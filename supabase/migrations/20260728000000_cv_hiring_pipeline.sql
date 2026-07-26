create type public.cv_review_status as enum (
  'unreviewed', 'in_review', 'shortlisted', 'rejected', 'on_hold'
);

create type public.employer_member_role as enum (
  'admin', 'recruiter', 'hiring_manager'
);

create table if not exists public.employer_memberships (
  employer_id uuid not null references public.employers(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role public.employer_member_role not null default 'recruiter',
  created_at timestamptz not null default now(),
  primary key (employer_id, user_id)
);

create table if not exists public.cv_ingestion_batches (
  id uuid primary key default gen_random_uuid(),
  employer_id uuid not null references public.employers(id) on delete cascade,
  source text not null default 'upload',
  received_count integer not null default 0 check (received_count >= 0),
  created_at timestamptz not null default now()
);

create index if not exists cv_ingestion_batches_employer_created_idx
  on public.cv_ingestion_batches (employer_id, created_at desc);

alter table public.cv_ingestion_records
  add column if not exists batch_id uuid references public.cv_ingestion_batches(id) on delete set null,
  add column if not exists content_hash text,
  add column if not exists updated_at timestamptz not null default now();

create index if not exists cv_ingestion_records_employer_batch_idx
  on public.cv_ingestion_records (employer_id, batch_id);

create unique index if not exists cv_ingestion_records_employer_content_hash_idx
  on public.cv_ingestion_records (employer_id, content_hash)
  where content_hash is not null;

create table if not exists public.cv_role_matches (
  id uuid primary key default gen_random_uuid(),
  employer_id uuid not null references public.employers(id) on delete cascade,
  cv_record_id uuid not null references public.cv_ingestion_records(id) on delete cascade,
  job_id uuid not null references public.job_listings(id) on delete cascade,
  requirements_hash text not null,
  analysis_key text not null,
  model text not null default 'rules-v1',
  hard_filter_pass boolean not null,
  hard_filter_reasons text[] not null default '{}',
  score smallint not null check (score between 0 and 100),
  score_breakdown jsonb not null default '{}',
  evidence_json jsonb not null default '{}',
  explanation text,
  review_status public.cv_review_status not null default 'unreviewed',
  assigned_to uuid references auth.users(id) on delete set null,
  reviewed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (cv_record_id, job_id, analysis_key)
);

create index if not exists cv_role_matches_review_queue_idx
  on public.cv_role_matches (employer_id, job_id, review_status, hard_filter_pass, score desc);

create index if not exists cv_role_matches_cache_lookup_idx
  on public.cv_role_matches (cv_record_id, job_id, requirements_hash, model);

create table if not exists public.cv_review_events (
  id uuid primary key default gen_random_uuid(),
  match_id uuid not null references public.cv_role_matches(id) on delete cascade,
  employer_id uuid not null references public.employers(id) on delete cascade,
  actor_id uuid references auth.users(id) on delete set null,
  from_status public.cv_review_status,
  to_status public.cv_review_status not null,
  note text,
  created_at timestamptz not null default now()
);

create index if not exists cv_review_events_match_created_idx
  on public.cv_review_events (match_id, created_at desc);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists cv_ingestion_records_set_updated_at on public.cv_ingestion_records;
create trigger cv_ingestion_records_set_updated_at
before update on public.cv_ingestion_records
for each row execute function public.set_updated_at();

drop trigger if exists cv_role_matches_set_updated_at on public.cv_role_matches;
create trigger cv_role_matches_set_updated_at
before update on public.cv_role_matches
for each row execute function public.set_updated_at();

create or replace function public.is_employer_member(target_employer_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.employer_memberships membership
    where membership.employer_id = target_employer_id
      and membership.user_id = auth.uid()
  );
$$;

grant execute on function public.is_employer_member(uuid) to authenticated;

alter table public.employer_memberships enable row level security;
alter table public.cv_ingestion_batches enable row level security;
alter table public.cv_ingestion_records enable row level security;
alter table public.cv_role_matches enable row level security;
alter table public.cv_review_events enable row level security;

create policy "Users read own employer memberships"
on public.employer_memberships for select to authenticated
using (user_id = auth.uid());

create policy "Employer members read CV batches"
on public.cv_ingestion_batches for select to authenticated
using (public.is_employer_member(employer_id));

create policy "Employer members read CV records"
on public.cv_ingestion_records for select to authenticated
using (public.is_employer_member(employer_id));

create policy "Employer members read role matches"
on public.cv_role_matches for select to authenticated
using (public.is_employer_member(employer_id));

create policy "Employer members update role matches"
on public.cv_role_matches for update to authenticated
using (public.is_employer_member(employer_id))
with check (public.is_employer_member(employer_id));

create policy "Employer members read review events"
on public.cv_review_events for select to authenticated
using (public.is_employer_member(employer_id));

create policy "Employer members create review events"
on public.cv_review_events for insert to authenticated
with check (public.is_employer_member(employer_id) and actor_id = auth.uid());
