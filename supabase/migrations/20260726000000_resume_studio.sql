create table if not exists public.resumes (
  id uuid primary key default gen_random_uuid(),
  candidate_id uuid not null references public.candidate_profiles(id) on delete cascade,
  title text not null,
  source_kind text not null default 'manual',
  active_version_id uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.resume_versions (
  id uuid primary key default gen_random_uuid(),
  resume_id uuid not null references public.resumes(id) on delete cascade,
  candidate_id uuid not null references public.candidate_profiles(id) on delete cascade,
  version_number integer not null check (version_number > 0),
  source text not null default 'manual',
  content_json jsonb not null,
  content_hash text not null,
  created_at timestamptz not null default now(),
  unique (resume_id, version_number)
);

alter table public.resume_versions add column if not exists resume_id uuid references public.resumes(id) on delete cascade;
alter table public.resume_versions add column if not exists version_number integer;
alter table public.resume_versions add column if not exists source text default 'manual';
alter table public.resume_versions add column if not exists content_json jsonb;
alter table public.resume_versions add column if not exists content_hash text;
create unique index if not exists resume_versions_resume_id_version_number_idx on public.resume_versions (resume_id, version_number) where resume_id is not null;

alter table public.resumes
  add constraint resumes_active_version_id_fkey
  foreign key (active_version_id) references public.resume_versions(id) on delete set null;

create table if not exists public.resume_job_descriptions (
  id uuid primary key default gen_random_uuid(),
  candidate_id uuid not null references public.candidate_profiles(id) on delete cascade,
  client_id text,
  title text not null,
  content_text text not null,
  content_hash text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (candidate_id, content_hash)
);

create table if not exists public.resume_analysis_cache (
  id uuid primary key default gen_random_uuid(),
  candidate_id uuid not null references public.candidate_profiles(id) on delete cascade,
  resume_version_id uuid not null references public.resume_versions(id) on delete cascade,
  job_description_id uuid not null references public.resume_job_descriptions(id) on delete cascade,
  analysis_json jsonb not null,
  model text not null,
  created_at timestamptz not null default now(),
  unique (resume_version_id, job_description_id, model)
);

create index if not exists resumes_candidate_id_idx on public.resumes (candidate_id);
create index if not exists resume_versions_candidate_id_idx on public.resume_versions (candidate_id);
create index if not exists resume_job_descriptions_candidate_id_idx on public.resume_job_descriptions (candidate_id);
create index if not exists resume_analysis_cache_candidate_id_idx on public.resume_analysis_cache (candidate_id);

alter table public.resumes enable row level security;
alter table public.resume_versions enable row level security;
alter table public.resume_job_descriptions enable row level security;
alter table public.resume_analysis_cache enable row level security;

create policy "Candidates read own resumes" on public.resumes
  for select to authenticated using ((select auth.uid()) = candidate_id);
create policy "Candidates create own resumes" on public.resumes
  for insert to authenticated with check ((select auth.uid()) = candidate_id);
create policy "Candidates update own resumes" on public.resumes
  for update to authenticated using ((select auth.uid()) = candidate_id) with check (
    (select auth.uid()) = candidate_id
    and (active_version_id is null or exists (
      select 1 from public.resume_versions where id = active_version_id and candidate_id = (select auth.uid())
    ))
  );
create policy "Candidates delete own resumes" on public.resumes
  for delete to authenticated using ((select auth.uid()) = candidate_id);

create policy "Candidates read own resume versions" on public.resume_versions
  for select to authenticated using ((select auth.uid()) = candidate_id);
create policy "Candidates create own resume versions" on public.resume_versions
  for insert to authenticated with check (
    (select auth.uid()) = candidate_id
    and exists (select 1 from public.resumes where id = resume_id and candidate_id = (select auth.uid()))
  );

create policy "Candidates manage own job descriptions" on public.resume_job_descriptions
  for all to authenticated using ((select auth.uid()) = candidate_id) with check ((select auth.uid()) = candidate_id);

create policy "Candidates read own analysis cache" on public.resume_analysis_cache
  for select to authenticated using ((select auth.uid()) = candidate_id);
create policy "Candidates create own analysis cache" on public.resume_analysis_cache
  for insert to authenticated with check (
    (select auth.uid()) = candidate_id
    and exists (select 1 from public.resume_versions where id = resume_version_id and candidate_id = (select auth.uid()))
    and exists (select 1 from public.resume_job_descriptions where id = job_description_id and candidate_id = (select auth.uid()))
  );
