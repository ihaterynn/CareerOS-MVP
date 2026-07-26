-- Candidate onboarding — AI-native conversational intake.
-- Spec: docs/superpowers/specs/2026-07-26-candidate-onboarding-ai-native-design.md §6
--
-- OWNERSHIP MODEL (read before adding policies here):
-- public.candidate_profiles has BOTH `id` (PK, referenced by every candidate-owned table) and a
-- separate `user_id` (the auth user). They are NOT interchangeable. Every policy below therefore
-- resolves ownership through public.current_candidate_id(), never `auth.uid() = candidate_id`.

-- ---------------------------------------------------------------------------
-- 0. Ownership helper
-- ---------------------------------------------------------------------------

-- SECURITY DEFINER so a policy can resolve the caller's profile row without needing a
-- readable-to-everyone policy on candidate_profiles. search_path is pinned to defeat
-- search-path hijacking; the function is stable and takes no user input.
create or replace function public.current_candidate_id()
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select id from public.candidate_profiles where user_id = auth.uid() limit 1;
$$;

revoke all on function public.current_candidate_id() from public;
grant execute on function public.current_candidate_id() to authenticated;

comment on function public.current_candidate_id() is
  'Resolves the calling auth user to their candidate_profiles.id. Use in RLS instead of auth.uid() — candidate_profiles.id is not the auth uid.';

-- ---------------------------------------------------------------------------
-- 1. Enums
-- ---------------------------------------------------------------------------

do $$ begin
  create type public.onboarding_source_kind as enum ('resume', 'linkedin', 'paste', 'conversation');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.fact_dimension as enum ('identity', 'experience', 'skills', 'preferences', 'dna');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.fact_source as enum ('parsed', 'confirmed', 'inferred', 'self-reported');
exception when duplicate_object then null; end $$;

-- ---------------------------------------------------------------------------
-- 2. Tables
-- ---------------------------------------------------------------------------

create table if not exists public.candidate_onboarding_sessions (
  id uuid primary key default gen_random_uuid(),
  candidate_id uuid not null unique references public.candidate_profiles(id) on delete cascade,
  -- Turn queue + cursor, so a candidate resumes mid-conversation rather than restarting.
  state jsonb not null default '{}'::jsonb,
  coverage jsonb not null default '{}'::jsonb,
  source_kind public.onboarding_source_kind,
  -- Storage object path of the uploaded résumé. Always derived server-side from the caller.
  storage_path text,
  started_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  skipped_at timestamptz,
  completed_at timestamptz
);

-- Append-only fact ledger. An edit inserts a new row and points the old one at it via
-- superseded_by, so provenance stays auditable (spec §4).
create table if not exists public.candidate_profile_facts (
  id uuid primary key default gen_random_uuid(),
  candidate_id uuid not null references public.candidate_profiles(id) on delete cascade,
  dimension public.fact_dimension not null,
  key text not null,
  label text not null,
  value jsonb not null,
  source public.fact_source not null,
  confidence numeric(3, 2) not null default 1 check (confidence >= 0 and confidence <= 1),
  -- Verbatim span from the source document. NULL means the model inferred it and it must be
  -- confirmed before it counts as full coverage.
  evidence text,
  edited boolean not null default false,
  unit text,
  superseded_by uuid references public.candidate_profile_facts(id) on delete set null,
  created_at timestamptz not null default now()
);

-- One live fact per key per candidate; superseded rows are unconstrained history.
create unique index if not exists candidate_profile_facts_live_key_idx
  on public.candidate_profile_facts (candidate_id, key)
  where superseded_by is null;

create index if not exists candidate_profile_facts_candidate_id_idx
  on public.candidate_profile_facts (candidate_id);

-- Distributed rate limiting for the LLM routes. In-memory counters reset on every cold start,
-- so the limit has to live in the database (spec §6.3). Postgres counter — no new vendor.
create table if not exists public.llm_rate_limits (
  candidate_id uuid not null references public.candidate_profiles(id) on delete cascade,
  route text not null,
  window_start timestamptz not null,
  request_count integer not null default 0,
  primary key (candidate_id, route, window_start)
);

create index if not exists llm_rate_limits_window_idx on public.llm_rate_limits (window_start);

-- ---------------------------------------------------------------------------
-- 3. Atomic rate-limit check
-- ---------------------------------------------------------------------------

-- Returns true when the call is allowed. The upsert + check happen in one statement so two
-- concurrent requests cannot both read "under limit" and both proceed.
create or replace function public.consume_rate_limit(
  p_route text,
  p_limit integer,
  p_window_seconds integer
)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  v_candidate_id uuid := public.current_candidate_id();
  v_window timestamptz;
  v_count integer;
begin
  if v_candidate_id is null then
    return false;
  end if;

  v_window := to_timestamp(floor(extract(epoch from now()) / p_window_seconds) * p_window_seconds);

  insert into public.llm_rate_limits (candidate_id, route, window_start, request_count)
  values (v_candidate_id, p_route, v_window, 1)
  on conflict (candidate_id, route, window_start)
    do update set request_count = public.llm_rate_limits.request_count + 1
  returning request_count into v_count;

  return v_count <= p_limit;
end;
$$;

revoke all on function public.consume_rate_limit(text, integer, integer) from public;
grant execute on function public.consume_rate_limit(text, integer, integer) to authenticated;

-- ---------------------------------------------------------------------------
-- 3b. Atomic fact upsert
-- ---------------------------------------------------------------------------

-- Writing a fact for a key that already has a live row means superseding the old row with the
-- new one. That cannot be done from the client: the partial unique index forbids two live rows
-- for a key, and superseded_by has to point at an id that does not exist until the insert runs.
-- Doing both in one function keeps the ledger append-only AND collision-free.
create or replace function public.upsert_candidate_facts(p_facts jsonb)
returns setof public.candidate_profile_facts
language plpgsql
security definer
set search_path = public
as $$
declare
  v_candidate_id uuid := public.current_candidate_id();
  v_fact jsonb;
  v_new_id uuid;
begin
  if v_candidate_id is null then
    raise exception 'No candidate profile for the current user';
  end if;

  for v_fact in select * from jsonb_array_elements(p_facts) loop
    -- Detach the current live row first so the partial unique index is free, then point it at
    -- the replacement once the new row exists.
    update public.candidate_profile_facts
    set superseded_by = id
    where candidate_id = v_candidate_id
      and key = (v_fact ->> 'key')
      and superseded_by is null;

    insert into public.candidate_profile_facts
      (candidate_id, dimension, key, label, value, source, confidence, evidence, edited, unit)
    values (
      v_candidate_id,
      (v_fact ->> 'dimension')::public.fact_dimension,
      v_fact ->> 'key',
      v_fact ->> 'label',
      v_fact -> 'value',
      (v_fact ->> 'source')::public.fact_source,
      coalesce((v_fact ->> 'confidence')::numeric, 1),
      v_fact ->> 'evidence',
      coalesce((v_fact ->> 'edited')::boolean, false),
      v_fact ->> 'unit'
    )
    returning id into v_new_id;

    -- Repoint the rows that were self-superseded a moment ago at the actual replacement.
    update public.candidate_profile_facts
    set superseded_by = v_new_id
    where candidate_id = v_candidate_id
      and key = (v_fact ->> 'key')
      and id <> v_new_id
      and superseded_by = id;
  end loop;

  return query
    select * from public.candidate_profile_facts
    where candidate_id = v_candidate_id and superseded_by is null
    order by created_at;
end;
$$;

revoke all on function public.upsert_candidate_facts(jsonb) from public;
grant execute on function public.upsert_candidate_facts(jsonb) to authenticated;

-- ---------------------------------------------------------------------------
-- 4. Completion projection
-- ---------------------------------------------------------------------------

-- Projects confirmed facts onto the candidate's real profile and marks the session complete —
-- in one transaction, so a partial projection can never leave a "completed" session behind.
-- Provisional facts (parsed/inferred) are deliberately excluded: nothing the candidate has not
-- vouched for reaches their profile.
create or replace function public.complete_candidate_onboarding()
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_candidate_id uuid := public.current_candidate_id();
  v_name text;
  v_role text;
  v_location text;
  v_salary text;
  v_commute integer;
  v_work_mode text;
  v_interests text[];
  v_summary text;
  v_skills text[];
begin
  if v_candidate_id is null then
    raise exception 'No candidate profile for the current user';
  end if;

  select
    max(case when key = 'identity.name'    then value #>> '{}' end),
    max(case when key = 'identity.role'    then value #>> '{}' end),
    max(case when key = 'identity.location' then value #>> '{}' end),
    max(case when key = 'pref.salary'      then value #>> '{}' end),
    max(case when key = 'pref.commute'     then (value #>> '{}')::integer end),
    max(case when key = 'pref.work_mode'   then value #>> '{}' end),
    max(case when key = 'dna.summary'      then value #>> '{}' end)
  into v_name, v_role, v_location, v_salary, v_commute, v_work_mode, v_summary
  from public.candidate_profile_facts
  where candidate_id = v_candidate_id
    and superseded_by is null
    and source in ('confirmed', 'self-reported');

  select coalesce(array_agg(entry), '{}')
  into v_interests
  from public.candidate_profile_facts f,
       lateral jsonb_array_elements_text(case when jsonb_typeof(f.value) = 'array' then f.value else '[]'::jsonb end) entry
  where f.candidate_id = v_candidate_id
    and f.superseded_by is null
    and f.source in ('confirmed', 'self-reported')
    and f.key = 'pref.interests';

  select coalesce(array_agg(entry), '{}')
  into v_skills
  from public.candidate_profile_facts f,
       lateral jsonb_array_elements_text(case when jsonb_typeof(f.value) = 'array' then f.value else '[]'::jsonb end) entry
  where f.candidate_id = v_candidate_id
    and f.superseded_by is null
    and f.source in ('confirmed', 'self-reported')
    and f.key = 'skills.core';

  update public.candidate_profiles
  set
    name                       = coalesce(v_name, name),
    current_role_title         = coalesce(v_role, current_role_title),
    location                   = coalesce(v_location, location),
    salary_expectation         = coalesce(v_salary, salary_expectation),
    commute_preference_minutes = coalesce(v_commute, commute_preference_minutes),
    work_preferences           = case when v_work_mode is null then work_preferences else array[v_work_mode] end,
    career_interests           = case when coalesce(array_length(v_interests, 1), 0) = 0 then career_interests else v_interests end,
    summary                    = coalesce(v_summary, summary),
    updated_at                 = now()
  where id = v_candidate_id;

  -- Skills are seeded as self-reported Core signals with no level claim beyond a neutral
  -- baseline; the DNA module refines them later. Existing rows are left alone.
  insert into public.skill_signals (candidate_id, name, level, category, evidence)
  select v_candidate_id, s, 50, 'Core'::public.skill_category, 'Self-reported during onboarding'
  from unnest(v_skills) as s
  where not exists (
    select 1 from public.skill_signals existing
    where existing.candidate_id = v_candidate_id and lower(existing.name) = lower(s)
  );

  update public.candidate_onboarding_sessions
  set completed_at = now(), updated_at = now()
  where candidate_id = v_candidate_id;
end;
$$;

revoke all on function public.complete_candidate_onboarding() from public;
grant execute on function public.complete_candidate_onboarding() to authenticated;

-- ---------------------------------------------------------------------------
-- 5. RLS
-- ---------------------------------------------------------------------------

alter table public.candidate_onboarding_sessions enable row level security;
alter table public.candidate_profile_facts enable row level security;
alter table public.llm_rate_limits enable row level security;

drop policy if exists "Candidates read own onboarding session" on public.candidate_onboarding_sessions;
create policy "Candidates read own onboarding session" on public.candidate_onboarding_sessions
  for select to authenticated using (candidate_id = public.current_candidate_id());

drop policy if exists "Candidates create own onboarding session" on public.candidate_onboarding_sessions;
create policy "Candidates create own onboarding session" on public.candidate_onboarding_sessions
  for insert to authenticated with check (candidate_id = public.current_candidate_id());

drop policy if exists "Candidates update own onboarding session" on public.candidate_onboarding_sessions;
create policy "Candidates update own onboarding session" on public.candidate_onboarding_sessions
  for update to authenticated
  using (candidate_id = public.current_candidate_id())
  with check (candidate_id = public.current_candidate_id());

drop policy if exists "Candidates read own facts" on public.candidate_profile_facts;
create policy "Candidates read own facts" on public.candidate_profile_facts
  for select to authenticated using (candidate_id = public.current_candidate_id());

drop policy if exists "Candidates create own facts" on public.candidate_profile_facts;
create policy "Candidates create own facts" on public.candidate_profile_facts
  for insert to authenticated with check (candidate_id = public.current_candidate_id());

-- Supersede-only: the ledger is append-only, so an update may set superseded_by but must never
-- rewrite the recorded value, source, or evidence of an existing row.
drop policy if exists "Candidates supersede own facts" on public.candidate_profile_facts;
create policy "Candidates supersede own facts" on public.candidate_profile_facts
  for update to authenticated
  using (candidate_id = public.current_candidate_id() and superseded_by is null)
  with check (candidate_id = public.current_candidate_id());

-- No candidate-facing policy on llm_rate_limits: it is written only by consume_rate_limit()
-- (SECURITY DEFINER). RLS on + zero policies = candidates cannot read or forge their own counters.

-- Privileges are separate from RLS: a policy narrows access that a GRANT already allows, so
-- without these the policies above resolve to "permission denied" for every candidate.
-- No DELETE anywhere — the fact ledger is append-only, and sessions are closed, not removed.
grant select, insert, update on public.candidate_onboarding_sessions to authenticated;
grant select, insert, update on public.candidate_profile_facts to authenticated;
-- llm_rate_limits intentionally ungranted: reachable only through consume_rate_limit().

-- ---------------------------------------------------------------------------
-- 6. Storage — uploaded résumés
-- ---------------------------------------------------------------------------

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'candidate-uploads',
  'candidate-uploads',
  false,
  10485760, -- 10 MB
  array[
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/plain'
  ]
)
on conflict (id) do nothing;

-- Objects live under <candidate_profiles.id>/<filename>. The first path segment is compared to
-- the caller's resolved candidate id, so a client-supplied path cannot reach another candidate.
drop policy if exists "Candidates read own uploads" on storage.objects;
create policy "Candidates read own uploads" on storage.objects
  for select to authenticated
  using (
    bucket_id = 'candidate-uploads'
    and (storage.foldername(name))[1] = public.current_candidate_id()::text
  );

drop policy if exists "Candidates write own uploads" on storage.objects;
create policy "Candidates write own uploads" on storage.objects
  for insert to authenticated
  with check (
    bucket_id = 'candidate-uploads'
    and (storage.foldername(name))[1] = public.current_candidate_id()::text
  );

drop policy if exists "Candidates delete own uploads" on storage.objects;
create policy "Candidates delete own uploads" on storage.objects
  for delete to authenticated
  using (
    bucket_id = 'candidate-uploads'
    and (storage.foldername(name))[1] = public.current_candidate_id()::text
  );
