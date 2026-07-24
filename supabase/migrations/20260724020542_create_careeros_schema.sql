-- CareerOS Schema Migration
-- Creates all tables, enums, relationships, indexes, and RLS policies

-- ── Enums ────────────────────────────────────────────────────────────────────

create type portal as enum ('candidate', 'employer');
create type candidate_module_id as enum ('dashboard', 'dna', 'jobs', 'career-path', 'jobby', 'applications');
create type employer_module_id as enum ('dashboard', 'career-root', 'talent', 'ingestion', 'retention', 'onboarding', 'heatmap', 'attrition', 'review');
create type skill_category as enum ('Core', 'Adjacent', 'Emerging');
create type job_mode as enum ('Hybrid', 'Remote-first', 'On-site');
create type application_status as enum ('Draft', 'Review', 'Applied', 'Interview');
create type career_track as enum ('Grow', 'Pivot', 'Specialize', 'Adjacent');
create type role_priority as enum ('Urgent', 'Active', 'Pipeline');
create type review_status as enum ('New', 'Shortlisted', 'Rejected');
create type onboarding_task_type as enum ('Automated', 'Manual', 'Document');
create type onboarding_task_status as enum ('Done', 'In progress', 'Scheduled');
create type salary_pressure as enum ('Low', 'Medium', 'High');
create type chat_author as enum ('assistant', 'candidate', 'bot', 'user');
create type interview_category_id as enum ('role', 'personality', 'culture');
create type cv_status as enum ('missing contact', 'duplicate fingerprint', 'parse failed');
create type aggregation_mode as enum ('skillCluster', 'experienceBand', 'location', 'gap');

-- ── Updated-at trigger ────────────────────────────────────────────────────────

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ── Tables ────────────────────────────────────────────────────────────────────

-- Employers (organizations using the platform)
create table employers (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  domain text,
  logo_url text,
  created_at timestamptz not null default now()
);

-- Candidate profiles
create table candidate_profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  current_role_title text not null,
  location text not null,
  latitude float8,
  longitude float8,
  commute_preference_minutes int,
  work_preferences text[] default '{}',
  salary_expectation text,
  relocation_flexibility text,
  career_interests text[] default '{}',
  summary text,
  email text,
  phone text,
  photo_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id)
);
create trigger set_candidate_profiles_updated_at
  before update on candidate_profiles
  for each row execute function set_updated_at();

-- User roles (portal access)
create table user_roles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  role portal not null,
  created_at timestamptz not null default now()
);

-- Navigation module definitions
create table navigation_modules (
  id text primary key,
  portal portal not null,
  label text not null,
  description text,
  icon text,
  href text not null,
  sort_order int2 not null default 0
);

-- Candidate education history
create table candidate_education (
  id uuid primary key default gen_random_uuid(),
  candidate_id uuid not null references candidate_profiles(id) on delete cascade,
  school text not null,
  credential text not null,
  year text not null
);
create index idx_candidate_education_candidate on candidate_education(candidate_id);

-- Candidate work experience
create table candidate_experience (
  id uuid primary key default gen_random_uuid(),
  candidate_id uuid not null references candidate_profiles(id) on delete cascade,
  role text not null,
  company text not null,
  period text not null,
  impact text[] default '{}',
  sort_order int2 not null default 0
);
create index idx_candidate_experience_candidate on candidate_experience(candidate_id);

-- Candidate certifications
create table candidate_certifications (
  id uuid primary key default gen_random_uuid(),
  candidate_id uuid not null references candidate_profiles(id) on delete cascade,
  name text not null,
  issuer text not null,
  year text not null
);
create index idx_candidate_certifications_candidate on candidate_certifications(candidate_id);

-- Candidate portfolio entries
create table candidate_portfolio (
  id uuid primary key default gen_random_uuid(),
  candidate_id uuid not null references candidate_profiles(id) on delete cascade,
  description text not null,
  sort_order int2 not null default 0
);
create index idx_candidate_portfolio_candidate on candidate_portfolio(candidate_id);

-- Candidate learning signals
create table candidate_learning_signals (
  id uuid primary key default gen_random_uuid(),
  candidate_id uuid not null references candidate_profiles(id) on delete cascade,
  signal text not null
);
create index idx_candidate_learning_signals_candidate on candidate_learning_signals(candidate_id);

-- Candidate DNA signals
create table candidate_dna_signals (
  id uuid primary key default gen_random_uuid(),
  candidate_id uuid not null references candidate_profiles(id) on delete cascade,
  signal text not null
);
create index idx_candidate_dna_signals_candidate on candidate_dna_signals(candidate_id);

-- Candidate skill assessments
create table skill_signals (
  id uuid primary key default gen_random_uuid(),
  candidate_id uuid not null references candidate_profiles(id) on delete cascade,
  name text not null,
  level int2 not null check (level >= 0 and level <= 100),
  category skill_category not null,
  evidence text
);
create index idx_skill_signals_candidate on skill_signals(candidate_id);

-- Registration steps / onboarding progress
create table registration_steps (
  id uuid primary key default gen_random_uuid(),
  candidate_id uuid not null references candidate_profiles(id) on delete cascade,
  step_label text not null,
  is_complete boolean not null default false,
  sort_order int2 not null default 0
);
create index idx_registration_steps_candidate on registration_steps(candidate_id);

-- Resume versions
create table resume_versions (
  id uuid primary key default gen_random_uuid(),
  candidate_id uuid not null references candidate_profiles(id) on delete cascade,
  version_name text not null,
  resume_text text not null,
  target_role text,
  target_job_id uuid,
  created_at timestamptz not null default now()
);
create index idx_resume_versions_candidate on resume_versions(candidate_id);

-- Job listings
create table job_listings (
  id uuid primary key default gen_random_uuid(),
  employer_id uuid not null references employers(id) on delete cascade,
  title text not null,
  company text not null,
  location text not null,
  latitude float8,
  longitude float8,
  salary text,
  mode job_mode not null,
  commute_minutes int,
  requirements text[] default '{}',
  missing_skills text[] default '{}',
  match_overall int2,
  match_skills int2,
  match_geo int2,
  match_salary int2,
  match_preference int2,
  explanation text[] default '{}',
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);
create index idx_job_listings_employer on job_listings(employer_id);
create index idx_job_listings_active on job_listings(is_active) where is_active = true;

-- Course recommendations (Coursera upskilling)
create table course_recommendations (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  provider text not null default 'Coursera',
  partner text,
  target_skill text,
  duration text,
  reason text,
  url text
);

-- Many-to-many: courses ↔ jobs
create table course_job_mappings (
  course_id uuid not null references course_recommendations(id) on delete cascade,
  job_id uuid not null references job_listings(id) on delete cascade,
  primary key (course_id, job_id)
);

-- Career path routes (Career Tree)
create table career_path_routes (
  id uuid primary key default gen_random_uuid(),
  candidate_id uuid not null references candidate_profiles(id) on delete cascade,
  title text not null,
  track career_track not null,
  readiness int2 check (readiness >= 0 and readiness <= 100),
  horizon text,
  salary_range text,
  current_expected_pay text,
  unlocked_pay_range text,
  pay_evidence text[] default '{}',
  market_signal text,
  why_realistic text[] default '{}',
  bridge_skills text[] default '{}',
  required_signals text[] default '{}',
  projects text[] default '{}',
  next_milestones text[] default '{}',
  source_signals text[] default '{}'
);
create index idx_career_path_routes_candidate on career_path_routes(candidate_id);

-- Courses within a career path route
create table career_route_courses (
  id uuid primary key default gen_random_uuid(),
  route_id uuid not null references career_path_routes(id) on delete cascade,
  title text not null,
  provider text not null default 'Coursera',
  partner text,
  target_skill text,
  duration text,
  url text
);
create index idx_career_route_courses_route on career_route_courses(route_id);

-- Candidate job applications
create table candidate_applications (
  id uuid primary key default gen_random_uuid(),
  candidate_id uuid not null references candidate_profiles(id) on delete cascade,
  job_id uuid not null references job_listings(id) on delete cascade,
  status application_status not null default 'Draft',
  submitted_at text,
  resume_version text,
  next_step text,
  quick_apply_step int2 not null default 0
);
create index idx_candidate_applications_candidate on candidate_applications(candidate_id);
create index idx_candidate_applications_job on candidate_applications(job_id);

-- Chat messages (career navigator & jobby.ai)
create table chat_messages (
  id uuid primary key default gen_random_uuid(),
  candidate_id uuid not null references candidate_profiles(id) on delete cascade,
  session text not null,
  author chat_author not null,
  text text not null,
  created_at timestamptz not null default now()
);
create index idx_chat_messages_session on chat_messages(candidate_id, session);

-- Employer dashboard metrics
create table employer_metrics (
  id uuid primary key default gen_random_uuid(),
  employer_id uuid not null references employers(id) on delete cascade,
  label text not null,
  value text not null,
  detail text
);
create index idx_employer_metrics_employer on employer_metrics(employer_id);

-- Role talent boards (positions with applicants)
create table role_talent_boards (
  id uuid primary key default gen_random_uuid(),
  employer_id uuid not null references employers(id) on delete cascade,
  title text not null,
  team text,
  location text,
  priority role_priority not null default 'Active',
  openings int2 not null default 1,
  hiring_goal text,
  role_signals text[] default '{}'
);
create index idx_role_talent_boards_employer on role_talent_boards(employer_id);

-- Talent matches (employer's aggregated view of candidates)
create table talent_matches (
  id uuid primary key default gen_random_uuid(),
  candidate_id uuid not null references candidate_profiles(id) on delete cascade,
  name text not null,
  avatar_url text,
  current_track text,
  source_field text,
  location text,
  summary text,
  score int2 check (score >= 0 and score <= 100),
  education_fit int2 check (education_fit >= 0 and education_fit <= 100),
  skill_fit int2 check (skill_fit >= 0 and skill_fit <= 100),
  experience_fit int2 check (experience_fit >= 0 and experience_fit <= 100),
  interest_signal int2 check (interest_signal >= 0 and interest_signal <= 100),
  skills text[] default '{}',
  education text,
  experience text[] default '{}',
  certifications text[] default '{}',
  portfolio text[] default '{}',
  career_interests text[] default '{}',
  learning_signals text[] default '{}',
  dna_signals text[] default '{}',
  mobility_intent text,
  highlights text[] default '{}',
  missing_signals text[] default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (candidate_id)
);
create trigger set_talent_matches_updated_at
  before update on talent_matches
  for each row execute function set_updated_at();

-- Many-to-many: role boards ↔ talent matches (with per-role scoring)
create table role_talent_board_applicants (
  id uuid primary key default gen_random_uuid(),
  role_board_id uuid not null references role_talent_boards(id) on delete cascade,
  talent_match_id uuid not null references talent_matches(id) on delete cascade,
  score int2 check (score >= 0 and score <= 100),
  summary text,
  skill_fit int2 check (skill_fit >= 0 and skill_fit <= 100),
  experience_fit int2 check (experience_fit >= 0 and experience_fit <= 100),
  education_fit int2 check (education_fit >= 0 and education_fit <= 100),
  interest_signal int2 check (interest_signal >= 0 and interest_signal <= 100),
  highlights text[] default '{}',
  missing_signals text[] default '{}',
  mobility_intent text,
  status review_status not null default 'New',
  unique (role_board_id, talent_match_id)
);
create index idx_rtb_applicants_board on role_talent_board_applicants(role_board_id);
create index idx_rtb_applicants_match on role_talent_board_applicants(talent_match_id);

-- Career root sourcing branches
create table career_root_branches (
  id uuid primary key default gen_random_uuid(),
  employer_id uuid not null references employers(id) on delete cascade,
  field text not null,
  fit_reason text,
  threshold_relaxed text
);
create index idx_career_root_branches_employer on career_root_branches(employer_id);

-- Retention signals (employee retention risk)
create table retention_signals (
  id uuid primary key default gen_random_uuid(),
  employer_id uuid not null references employers(id) on delete cascade,
  employee text not null,
  role text not null,
  team text,
  score int2 check (score >= 0 and score <= 100),
  opt_out boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create trigger set_retention_signals_updated_at
  before update on retention_signals
  for each row execute function set_updated_at();
create index idx_retention_signals_employer on retention_signals(employer_id);

-- Retention risk factors per employee
create table retention_factors (
  id uuid primary key default gen_random_uuid(),
  retention_signal_id uuid not null references retention_signals(id) on delete cascade,
  label text not null,
  weight text,
  contribution int2,
  detail text
);
create index idx_retention_factors_signal on retention_factors(retention_signal_id);

-- Onboarding success predictions
create table onboarding_predictions (
  id uuid primary key default gen_random_uuid(),
  employer_id uuid not null references employers(id) on delete cascade,
  hire text not null,
  role text not null,
  success_probability int2 check (success_probability >= 0 and success_probability <= 100),
  time_to_impact text,
  turnover_risk int2 check (turnover_risk >= 0 and turnover_risk <= 100),
  next_milestone text,
  drivers text[] default '{}'
);
create index idx_onboarding_predictions_employer on onboarding_predictions(employer_id);

-- Onboarding workflow plans
create table onboarding_workflows (
  id uuid primary key default gen_random_uuid(),
  prediction_id uuid not null references onboarding_predictions(id) on delete cascade,
  start_date text,
  manager text,
  buddy text,
  automated_count int2 default 0,
  total_count int2 default 0
);
create index idx_onboarding_workflows_prediction on onboarding_workflows(prediction_id);

-- Onboarding phases
create table onboarding_phases (
  id uuid primary key default gen_random_uuid(),
  workflow_id uuid not null references onboarding_workflows(id) on delete cascade,
  name text not null,
  time_window text,
  goal text,
  sort_order int2 not null default 0
);
create index idx_onboarding_phases_workflow on onboarding_phases(workflow_id);

-- Onboarding tasks
create table onboarding_tasks (
  id uuid primary key default gen_random_uuid(),
  phase_id uuid not null references onboarding_phases(id) on delete cascade,
  title text not null,
  owner text,
  due text,
  type onboarding_task_type not null,
  status onboarding_task_status not null default 'Scheduled'
);
create index idx_onboarding_tasks_phase on onboarding_tasks(phase_id);

-- Skill heatmap data
create table skill_heatmap_points (
  id uuid primary key default gen_random_uuid(),
  skill text not null,
  location text not null,
  x float8,
  y float8,
  demand int2 check (demand >= 0 and demand <= 100),
  supply int2 check (supply >= 0 and supply <= 100),
  salary_pressure salary_pressure
);
create index idx_skill_heatmap_skill on skill_heatmap_points(skill);

-- Attrition clusters
create table attrition_clusters (
  id uuid primary key default gen_random_uuid(),
  employer_id uuid not null references employers(id) on delete cascade,
  label text not null,
  share text,
  risk int2 check (risk >= 0 and risk <= 100),
  root_cause text,
  evidence text[] default '{}'
);
create index idx_attrition_clusters_employer on attrition_clusters(employer_id);

-- Application reviews (employer review queue)
create table application_reviews (
  id uuid primary key default gen_random_uuid(),
  employer_id uuid not null references employers(id) on delete cascade,
  candidate text not null,
  role text not null,
  score int2 check (score >= 0 and score <= 100),
  status review_status not null default 'New',
  reason_required text,
  feedback_trace text[] default '{}'
);
create index idx_application_reviews_employer on application_reviews(employer_id);

-- Interview kits (generated per candidate per role)
create table interview_kits (
  id uuid primary key default gen_random_uuid(),
  talent_match_id uuid not null references talent_matches(id) on delete cascade,
  role_title text not null,
  headline text,
  created_at timestamptz not null default now()
);
create index idx_interview_kits_match on interview_kits(talent_match_id);

-- Interview kit categories
create table interview_kit_categories (
  id uuid primary key default gen_random_uuid(),
  kit_id uuid not null references interview_kits(id) on delete cascade,
  category_id interview_category_id not null,
  label text not null,
  basis text
);
create index idx_kit_categories_kit on interview_kit_categories(kit_id);

-- Interview questions
create table interview_questions (
  id uuid primary key default gen_random_uuid(),
  category_id uuid not null references interview_kit_categories(id) on delete cascade,
  prompt text not null,
  probes text,
  look_for text,
  sort_order int2 not null default 0
);
create index idx_interview_questions_category on interview_questions(category_id);

-- CV ingestion records
create table cv_ingestion_records (
  id uuid primary key default gen_random_uuid(),
  employer_id uuid not null references employers(id) on delete cascade,
  name text not null,
  source text,
  role text,
  location text,
  years int2,
  skills text[] default '{}',
  confidence int2 check (confidence >= 0 and confidence <= 100),
  status cv_status,
  created_at timestamptz not null default now()
);
create index idx_cv_ingestion_employer on cv_ingestion_records(employer_id);

-- Notifications
create table notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  body text,
  is_read boolean not null default false,
  created_at timestamptz not null default now()
);
create index idx_notifications_user on notifications(user_id);
create index idx_notifications_unread on notifications(user_id, is_read) where is_read = false;

-- ── Row Level Security ────────────────────────────────────────────────────────

alter table candidate_profiles enable row level security;
alter table candidate_education enable row level security;
alter table candidate_experience enable row level security;
alter table candidate_certifications enable row level security;
alter table candidate_portfolio enable row level security;
alter table candidate_learning_signals enable row level security;
alter table candidate_dna_signals enable row level security;
alter table skill_signals enable row level security;
alter table registration_steps enable row level security;
alter table resume_versions enable row level security;
alter table user_roles enable row level security;
alter table job_listings enable row level security;
alter table candidate_applications enable row level security;
alter table chat_messages enable row level security;
alter table career_path_routes enable row level security;
alter table career_route_courses enable row level security;
alter table employers enable row level security;
alter table employer_metrics enable row level security;
alter table talent_matches enable row level security;
alter table role_talent_boards enable row level security;
alter table role_talent_board_applicants enable row level security;
alter table career_root_branches enable row level security;
alter table retention_signals enable row level security;
alter table retention_factors enable row level security;
alter table onboarding_predictions enable row level security;
alter table onboarding_workflows enable row level security;
alter table onboarding_phases enable row level security;
alter table onboarding_tasks enable row level security;
alter table skill_heatmap_points enable row level security;
alter table attrition_clusters enable row level security;
alter table application_reviews enable row level security;
alter table interview_kits enable row level security;
alter table interview_kit_categories enable row level security;
alter table interview_questions enable row level security;
alter table cv_ingestion_records enable row level security;
alter table notifications enable row level security;
alter table navigation_modules enable row level security;
alter table course_recommendations enable row level security;
alter table course_job_mappings enable row level security;

-- Authenticated users can read their own data
create policy "Users can read own candidate profile"
  on candidate_profiles for select
  using (auth.uid() = user_id);

create policy "Users can update own candidate profile"
  on candidate_profiles for update
  using (auth.uid() = user_id);

-- Employers can read candidate profiles for talent matching
create policy "Employers can read candidate profiles"
  on candidate_profiles for select
  using (
    exists (
      select 1 from user_roles
      where user_id = auth.uid() and role = 'employer'
    )
  );

-- Job listings readable by all authenticated users
create policy "Job listings are readable by all authenticated users"
  on job_listings for select
  using (auth.role() = 'authenticated');

-- Employers can manage their own job listings
create policy "Employers can manage own job listings"
  on job_listings for all
  using (
    exists (
      select 1 from employers e
      where e.id = job_listings.employer_id
      and exists (
        select 1 from user_roles
        where user_id = auth.uid() and role = 'employer'
      )
    )
  );
