-- Baseline: the schema as it existed on the linked project before the candidate onboarding work.
--
-- WHY THIS FILE EXISTS
-- The remote database was built outside this repo, so migration 20260724020542 was recorded in
-- supabase_migrations.schema_migrations with no corresponding file. Every `supabase db push` then
-- failed with "remote migration versions not found in local migrations directory".
--
-- This is a pg_dump of the remote public schema with the objects created by
-- 20260727000000_candidate_onboarding.sql removed, so the three migrations compose in order on a
-- fresh database. It reconstructs the END STATE of 20260724020542; it is not a literal replay of
-- whatever statements originally ran.
--
-- Regenerate with:
--   supabase db dump --linked --schema public



SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;


CREATE SCHEMA IF NOT EXISTS "public";


ALTER SCHEMA "public" OWNER TO "pg_database_owner";


COMMENT ON SCHEMA "public" IS 'standard public schema';



CREATE TYPE "public"."aggregation_mode" AS ENUM (
    'skillCluster',
    'experienceBand',
    'location',
    'gap'
);


ALTER TYPE "public"."aggregation_mode" OWNER TO "postgres";


CREATE TYPE "public"."application_status" AS ENUM (
    'Draft',
    'Review',
    'Applied',
    'Interview'
);


ALTER TYPE "public"."application_status" OWNER TO "postgres";


CREATE TYPE "public"."candidate_module_id" AS ENUM (
    'dashboard',
    'dna',
    'jobs',
    'career-path',
    'jobby',
    'applications'
);


ALTER TYPE "public"."candidate_module_id" OWNER TO "postgres";


CREATE TYPE "public"."career_track" AS ENUM (
    'Grow',
    'Pivot',
    'Specialize',
    'Adjacent'
);


ALTER TYPE "public"."career_track" OWNER TO "postgres";


CREATE TYPE "public"."chat_author" AS ENUM (
    'assistant',
    'candidate',
    'bot',
    'user'
);


ALTER TYPE "public"."chat_author" OWNER TO "postgres";


CREATE TYPE "public"."cv_status" AS ENUM (
    'missing contact',
    'duplicate fingerprint',
    'parse failed'
);


ALTER TYPE "public"."cv_status" OWNER TO "postgres";


CREATE TYPE "public"."employer_module_id" AS ENUM (
    'dashboard',
    'career-root',
    'talent',
    'ingestion',
    'retention',
    'onboarding',
    'heatmap',
    'attrition',
    'review'
);


ALTER TYPE "public"."employer_module_id" OWNER TO "postgres";


CREATE TYPE "public"."interview_category_id" AS ENUM (
    'role',
    'personality',
    'culture'
);


ALTER TYPE "public"."interview_category_id" OWNER TO "postgres";


CREATE TYPE "public"."job_mode" AS ENUM (
    'Hybrid',
    'Remote-first',
    'On-site'
);


ALTER TYPE "public"."job_mode" OWNER TO "postgres";


CREATE TYPE "public"."onboarding_task_status" AS ENUM (
    'Done',
    'In progress',
    'Scheduled'
);


ALTER TYPE "public"."onboarding_task_status" OWNER TO "postgres";


CREATE TYPE "public"."onboarding_task_type" AS ENUM (
    'Automated',
    'Manual',
    'Document'
);


ALTER TYPE "public"."onboarding_task_type" OWNER TO "postgres";


CREATE TYPE "public"."portal" AS ENUM (
    'candidate',
    'employer'
);


ALTER TYPE "public"."portal" OWNER TO "postgres";


CREATE TYPE "public"."review_status" AS ENUM (
    'New',
    'Shortlisted',
    'Rejected'
);


ALTER TYPE "public"."review_status" OWNER TO "postgres";


CREATE TYPE "public"."role_priority" AS ENUM (
    'Urgent',
    'Active',
    'Pipeline'
);


ALTER TYPE "public"."role_priority" OWNER TO "postgres";


CREATE TYPE "public"."salary_pressure" AS ENUM (
    'Low',
    'Medium',
    'High'
);


ALTER TYPE "public"."salary_pressure" OWNER TO "postgres";


CREATE TYPE "public"."skill_category" AS ENUM (
    'Core',
    'Adjacent',
    'Emerging'
);


ALTER TYPE "public"."skill_category" OWNER TO "postgres";



CREATE OR REPLACE FUNCTION "public"."set_updated_at"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
begin
  new.updated_at = now();
  return new;
end;
$$;


ALTER FUNCTION "public"."set_updated_at"() OWNER TO "postgres";

SET default_tablespace = '';

SET default_table_access_method = "heap";


CREATE TABLE IF NOT EXISTS "public"."application_reviews" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "employer_id" "uuid" NOT NULL,
    "candidate" "text" NOT NULL,
    "role" "text" NOT NULL,
    "score" smallint,
    "status" "public"."review_status" DEFAULT 'New'::"public"."review_status" NOT NULL,
    "reason_required" "text",
    "feedback_trace" "text"[] DEFAULT '{}'::"text"[],
    CONSTRAINT "application_reviews_score_check" CHECK ((("score" >= 0) AND ("score" <= 100)))
);


ALTER TABLE "public"."application_reviews" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."attrition_clusters" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "employer_id" "uuid" NOT NULL,
    "label" "text" NOT NULL,
    "share" "text",
    "risk" smallint,
    "root_cause" "text",
    "evidence" "text"[] DEFAULT '{}'::"text"[],
    CONSTRAINT "attrition_clusters_risk_check" CHECK ((("risk" >= 0) AND ("risk" <= 100)))
);


ALTER TABLE "public"."attrition_clusters" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."candidate_applications" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "candidate_id" "uuid" NOT NULL,
    "job_id" "uuid" NOT NULL,
    "status" "public"."application_status" DEFAULT 'Draft'::"public"."application_status" NOT NULL,
    "submitted_at" "text",
    "resume_version" "text",
    "next_step" "text",
    "quick_apply_step" smallint DEFAULT 0 NOT NULL
);


ALTER TABLE "public"."candidate_applications" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."candidate_certifications" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "candidate_id" "uuid" NOT NULL,
    "name" "text" NOT NULL,
    "issuer" "text" NOT NULL,
    "year" "text" NOT NULL
);


ALTER TABLE "public"."candidate_certifications" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."candidate_dna_signals" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "candidate_id" "uuid" NOT NULL,
    "signal" "text" NOT NULL
);


ALTER TABLE "public"."candidate_dna_signals" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."candidate_education" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "candidate_id" "uuid" NOT NULL,
    "school" "text" NOT NULL,
    "credential" "text" NOT NULL,
    "year" "text" NOT NULL
);


ALTER TABLE "public"."candidate_education" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."candidate_experience" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "candidate_id" "uuid" NOT NULL,
    "role" "text" NOT NULL,
    "company" "text" NOT NULL,
    "period" "text" NOT NULL,
    "impact" "text"[] DEFAULT '{}'::"text"[],
    "sort_order" smallint DEFAULT 0 NOT NULL
);


ALTER TABLE "public"."candidate_experience" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."candidate_learning_signals" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "candidate_id" "uuid" NOT NULL,
    "signal" "text" NOT NULL
);


ALTER TABLE "public"."candidate_learning_signals" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."candidate_portfolio" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "candidate_id" "uuid" NOT NULL,
    "description" "text" NOT NULL,
    "sort_order" smallint DEFAULT 0 NOT NULL
);


ALTER TABLE "public"."candidate_portfolio" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."candidate_profiles" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "name" "text" NOT NULL,
    "current_role_title" "text" NOT NULL,
    "location" "text" NOT NULL,
    "latitude" double precision,
    "longitude" double precision,
    "commute_preference_minutes" integer,
    "work_preferences" "text"[] DEFAULT '{}'::"text"[],
    "salary_expectation" "text",
    "relocation_flexibility" "text",
    "career_interests" "text"[] DEFAULT '{}'::"text"[],
    "summary" "text",
    "email" "text",
    "phone" "text",
    "photo_url" "text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."candidate_profiles" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."career_path_routes" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "candidate_id" "uuid" NOT NULL,
    "title" "text" NOT NULL,
    "track" "public"."career_track" NOT NULL,
    "readiness" smallint,
    "horizon" "text",
    "salary_range" "text",
    "current_expected_pay" "text",
    "unlocked_pay_range" "text",
    "pay_evidence" "text"[] DEFAULT '{}'::"text"[],
    "market_signal" "text",
    "why_realistic" "text"[] DEFAULT '{}'::"text"[],
    "bridge_skills" "text"[] DEFAULT '{}'::"text"[],
    "required_signals" "text"[] DEFAULT '{}'::"text"[],
    "projects" "text"[] DEFAULT '{}'::"text"[],
    "next_milestones" "text"[] DEFAULT '{}'::"text"[],
    "source_signals" "text"[] DEFAULT '{}'::"text"[],
    CONSTRAINT "career_path_routes_readiness_check" CHECK ((("readiness" >= 0) AND ("readiness" <= 100)))
);


ALTER TABLE "public"."career_path_routes" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."career_root_branches" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "employer_id" "uuid" NOT NULL,
    "field" "text" NOT NULL,
    "fit_reason" "text",
    "threshold_relaxed" "text"
);


ALTER TABLE "public"."career_root_branches" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."career_route_courses" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "route_id" "uuid" NOT NULL,
    "title" "text" NOT NULL,
    "provider" "text" DEFAULT 'Coursera'::"text" NOT NULL,
    "partner" "text",
    "target_skill" "text",
    "duration" "text",
    "url" "text"
);


ALTER TABLE "public"."career_route_courses" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."chat_messages" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "candidate_id" "uuid" NOT NULL,
    "session" "text" NOT NULL,
    "author" "public"."chat_author" NOT NULL,
    "text" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."chat_messages" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."course_job_mappings" (
    "course_id" "uuid" NOT NULL,
    "job_id" "uuid" NOT NULL
);


ALTER TABLE "public"."course_job_mappings" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."course_recommendations" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "title" "text" NOT NULL,
    "provider" "text" DEFAULT 'Coursera'::"text" NOT NULL,
    "partner" "text",
    "target_skill" "text",
    "duration" "text",
    "reason" "text",
    "url" "text"
);


ALTER TABLE "public"."course_recommendations" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."cv_ingestion_records" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "employer_id" "uuid" NOT NULL,
    "name" "text" NOT NULL,
    "source" "text",
    "role" "text",
    "location" "text",
    "years" smallint,
    "skills" "text"[] DEFAULT '{}'::"text"[],
    "confidence" smallint,
    "status" "public"."cv_status",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "cv_ingestion_records_confidence_check" CHECK ((("confidence" >= 0) AND ("confidence" <= 100)))
);


ALTER TABLE "public"."cv_ingestion_records" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."employer_metrics" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "employer_id" "uuid" NOT NULL,
    "label" "text" NOT NULL,
    "value" "text" NOT NULL,
    "detail" "text"
);


ALTER TABLE "public"."employer_metrics" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."employers" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" "text" NOT NULL,
    "domain" "text",
    "logo_url" "text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."employers" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."interview_kit_categories" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "kit_id" "uuid" NOT NULL,
    "category_id" "public"."interview_category_id" NOT NULL,
    "label" "text" NOT NULL,
    "basis" "text"
);


ALTER TABLE "public"."interview_kit_categories" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."interview_kits" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "talent_match_id" "uuid" NOT NULL,
    "role_title" "text" NOT NULL,
    "headline" "text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."interview_kits" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."interview_questions" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "category_id" "uuid" NOT NULL,
    "prompt" "text" NOT NULL,
    "probes" "text",
    "look_for" "text",
    "sort_order" smallint DEFAULT 0 NOT NULL
);


ALTER TABLE "public"."interview_questions" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."job_listings" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "employer_id" "uuid" NOT NULL,
    "title" "text" NOT NULL,
    "company" "text" NOT NULL,
    "location" "text" NOT NULL,
    "latitude" double precision,
    "longitude" double precision,
    "salary" "text",
    "mode" "public"."job_mode" NOT NULL,
    "commute_minutes" integer,
    "requirements" "text"[] DEFAULT '{}'::"text"[],
    "missing_skills" "text"[] DEFAULT '{}'::"text"[],
    "match_overall" smallint,
    "match_skills" smallint,
    "match_geo" smallint,
    "match_salary" smallint,
    "match_preference" smallint,
    "explanation" "text"[] DEFAULT '{}'::"text"[],
    "is_active" boolean DEFAULT true NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."job_listings" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."navigation_modules" (
    "id" "text" NOT NULL,
    "portal" "public"."portal" NOT NULL,
    "label" "text" NOT NULL,
    "description" "text",
    "icon" "text",
    "href" "text" NOT NULL,
    "sort_order" smallint DEFAULT 0 NOT NULL
);


ALTER TABLE "public"."navigation_modules" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."notifications" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "title" "text" NOT NULL,
    "body" "text",
    "is_read" boolean DEFAULT false NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."notifications" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."onboarding_phases" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "workflow_id" "uuid" NOT NULL,
    "name" "text" NOT NULL,
    "time_window" "text",
    "goal" "text",
    "sort_order" smallint DEFAULT 0 NOT NULL
);


ALTER TABLE "public"."onboarding_phases" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."onboarding_predictions" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "employer_id" "uuid" NOT NULL,
    "hire" "text" NOT NULL,
    "role" "text" NOT NULL,
    "success_probability" smallint,
    "time_to_impact" "text",
    "turnover_risk" smallint,
    "next_milestone" "text",
    "drivers" "text"[] DEFAULT '{}'::"text"[],
    CONSTRAINT "onboarding_predictions_success_probability_check" CHECK ((("success_probability" >= 0) AND ("success_probability" <= 100))),
    CONSTRAINT "onboarding_predictions_turnover_risk_check" CHECK ((("turnover_risk" >= 0) AND ("turnover_risk" <= 100)))
);


ALTER TABLE "public"."onboarding_predictions" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."onboarding_tasks" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "phase_id" "uuid" NOT NULL,
    "title" "text" NOT NULL,
    "owner" "text",
    "due" "text",
    "type" "public"."onboarding_task_type" NOT NULL,
    "status" "public"."onboarding_task_status" DEFAULT 'Scheduled'::"public"."onboarding_task_status" NOT NULL
);


ALTER TABLE "public"."onboarding_tasks" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."onboarding_workflows" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "prediction_id" "uuid" NOT NULL,
    "start_date" "text",
    "manager" "text",
    "buddy" "text",
    "automated_count" smallint DEFAULT 0,
    "total_count" smallint DEFAULT 0
);


ALTER TABLE "public"."onboarding_workflows" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."registration_steps" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "candidate_id" "uuid" NOT NULL,
    "step_label" "text" NOT NULL,
    "is_complete" boolean DEFAULT false NOT NULL,
    "sort_order" smallint DEFAULT 0 NOT NULL
);


ALTER TABLE "public"."registration_steps" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."resume_analysis_cache" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "candidate_id" "uuid" NOT NULL,
    "resume_version_id" "uuid" NOT NULL,
    "job_description_id" "uuid" NOT NULL,
    "analysis_json" "jsonb" NOT NULL,
    "model" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."resume_analysis_cache" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."resume_job_descriptions" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "candidate_id" "uuid" NOT NULL,
    "client_id" "text",
    "title" "text" NOT NULL,
    "content_text" "text" NOT NULL,
    "content_hash" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."resume_job_descriptions" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."resume_versions" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "candidate_id" "uuid" NOT NULL,
    "version_name" "text" NOT NULL,
    "resume_text" "text" NOT NULL,
    "target_role" "text",
    "target_job_id" "uuid",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "resume_id" "uuid",
    "version_number" integer,
    "source" "text" DEFAULT 'manual'::"text",
    "content_json" "jsonb",
    "content_hash" "text"
);


ALTER TABLE "public"."resume_versions" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."resumes" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "candidate_id" "uuid" NOT NULL,
    "title" "text" NOT NULL,
    "source_kind" "text" DEFAULT 'manual'::"text" NOT NULL,
    "active_version_id" "uuid",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."resumes" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."retention_factors" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "retention_signal_id" "uuid" NOT NULL,
    "label" "text" NOT NULL,
    "weight" "text",
    "contribution" smallint,
    "detail" "text"
);


ALTER TABLE "public"."retention_factors" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."retention_signals" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "employer_id" "uuid" NOT NULL,
    "employee" "text" NOT NULL,
    "role" "text" NOT NULL,
    "team" "text",
    "score" smallint,
    "opt_out" boolean DEFAULT false NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "retention_signals_score_check" CHECK ((("score" >= 0) AND ("score" <= 100)))
);


ALTER TABLE "public"."retention_signals" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."role_talent_board_applicants" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "role_board_id" "uuid" NOT NULL,
    "talent_match_id" "uuid" NOT NULL,
    "score" smallint,
    "summary" "text",
    "skill_fit" smallint,
    "experience_fit" smallint,
    "education_fit" smallint,
    "interest_signal" smallint,
    "highlights" "text"[] DEFAULT '{}'::"text"[],
    "missing_signals" "text"[] DEFAULT '{}'::"text"[],
    "mobility_intent" "text",
    "status" "public"."review_status" DEFAULT 'New'::"public"."review_status" NOT NULL,
    CONSTRAINT "role_talent_board_applicants_education_fit_check" CHECK ((("education_fit" >= 0) AND ("education_fit" <= 100))),
    CONSTRAINT "role_talent_board_applicants_experience_fit_check" CHECK ((("experience_fit" >= 0) AND ("experience_fit" <= 100))),
    CONSTRAINT "role_talent_board_applicants_interest_signal_check" CHECK ((("interest_signal" >= 0) AND ("interest_signal" <= 100))),
    CONSTRAINT "role_talent_board_applicants_score_check" CHECK ((("score" >= 0) AND ("score" <= 100))),
    CONSTRAINT "role_talent_board_applicants_skill_fit_check" CHECK ((("skill_fit" >= 0) AND ("skill_fit" <= 100)))
);


ALTER TABLE "public"."role_talent_board_applicants" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."role_talent_boards" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "employer_id" "uuid" NOT NULL,
    "title" "text" NOT NULL,
    "team" "text",
    "location" "text",
    "priority" "public"."role_priority" DEFAULT 'Active'::"public"."role_priority" NOT NULL,
    "openings" smallint DEFAULT 1 NOT NULL,
    "hiring_goal" "text",
    "role_signals" "text"[] DEFAULT '{}'::"text"[]
);


ALTER TABLE "public"."role_talent_boards" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."skill_heatmap_points" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "skill" "text" NOT NULL,
    "location" "text" NOT NULL,
    "x" double precision,
    "y" double precision,
    "demand" smallint,
    "supply" smallint,
    "salary_pressure" "public"."salary_pressure",
    CONSTRAINT "skill_heatmap_points_demand_check" CHECK ((("demand" >= 0) AND ("demand" <= 100))),
    CONSTRAINT "skill_heatmap_points_supply_check" CHECK ((("supply" >= 0) AND ("supply" <= 100)))
);


ALTER TABLE "public"."skill_heatmap_points" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."skill_signals" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "candidate_id" "uuid" NOT NULL,
    "name" "text" NOT NULL,
    "level" smallint NOT NULL,
    "category" "public"."skill_category" NOT NULL,
    "evidence" "text",
    CONSTRAINT "skill_signals_level_check" CHECK ((("level" >= 0) AND ("level" <= 100)))
);


ALTER TABLE "public"."skill_signals" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."talent_matches" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "candidate_id" "uuid" NOT NULL,
    "name" "text" NOT NULL,
    "avatar_url" "text",
    "current_track" "text",
    "source_field" "text",
    "location" "text",
    "summary" "text",
    "score" smallint,
    "education_fit" smallint,
    "skill_fit" smallint,
    "experience_fit" smallint,
    "interest_signal" smallint,
    "skills" "text"[] DEFAULT '{}'::"text"[],
    "education" "text",
    "experience" "text"[] DEFAULT '{}'::"text"[],
    "certifications" "text"[] DEFAULT '{}'::"text"[],
    "portfolio" "text"[] DEFAULT '{}'::"text"[],
    "career_interests" "text"[] DEFAULT '{}'::"text"[],
    "learning_signals" "text"[] DEFAULT '{}'::"text"[],
    "dna_signals" "text"[] DEFAULT '{}'::"text"[],
    "mobility_intent" "text",
    "highlights" "text"[] DEFAULT '{}'::"text"[],
    "missing_signals" "text"[] DEFAULT '{}'::"text"[],
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "talent_matches_education_fit_check" CHECK ((("education_fit" >= 0) AND ("education_fit" <= 100))),
    CONSTRAINT "talent_matches_experience_fit_check" CHECK ((("experience_fit" >= 0) AND ("experience_fit" <= 100))),
    CONSTRAINT "talent_matches_interest_signal_check" CHECK ((("interest_signal" >= 0) AND ("interest_signal" <= 100))),
    CONSTRAINT "talent_matches_score_check" CHECK ((("score" >= 0) AND ("score" <= 100))),
    CONSTRAINT "talent_matches_skill_fit_check" CHECK ((("skill_fit" >= 0) AND ("skill_fit" <= 100)))
);


ALTER TABLE "public"."talent_matches" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."user_roles" (
    "user_id" "uuid" NOT NULL,
    "role" "public"."portal" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."user_roles" OWNER TO "postgres";


ALTER TABLE ONLY "public"."application_reviews"
    ADD CONSTRAINT "application_reviews_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."attrition_clusters"
    ADD CONSTRAINT "attrition_clusters_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."candidate_applications"
    ADD CONSTRAINT "candidate_applications_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."candidate_certifications"
    ADD CONSTRAINT "candidate_certifications_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."candidate_dna_signals"
    ADD CONSTRAINT "candidate_dna_signals_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."candidate_education"
    ADD CONSTRAINT "candidate_education_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."candidate_experience"
    ADD CONSTRAINT "candidate_experience_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."candidate_learning_signals"
    ADD CONSTRAINT "candidate_learning_signals_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."candidate_portfolio"
    ADD CONSTRAINT "candidate_portfolio_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."candidate_profiles"
    ADD CONSTRAINT "candidate_profiles_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."candidate_profiles"
    ADD CONSTRAINT "candidate_profiles_user_id_key" UNIQUE ("user_id");



ALTER TABLE ONLY "public"."career_path_routes"
    ADD CONSTRAINT "career_path_routes_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."career_root_branches"
    ADD CONSTRAINT "career_root_branches_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."career_route_courses"
    ADD CONSTRAINT "career_route_courses_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."chat_messages"
    ADD CONSTRAINT "chat_messages_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."course_job_mappings"
    ADD CONSTRAINT "course_job_mappings_pkey" PRIMARY KEY ("course_id", "job_id");



ALTER TABLE ONLY "public"."course_recommendations"
    ADD CONSTRAINT "course_recommendations_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."cv_ingestion_records"
    ADD CONSTRAINT "cv_ingestion_records_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."employer_metrics"
    ADD CONSTRAINT "employer_metrics_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."employers"
    ADD CONSTRAINT "employers_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."interview_kit_categories"
    ADD CONSTRAINT "interview_kit_categories_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."interview_kits"
    ADD CONSTRAINT "interview_kits_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."interview_questions"
    ADD CONSTRAINT "interview_questions_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."job_listings"
    ADD CONSTRAINT "job_listings_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."navigation_modules"
    ADD CONSTRAINT "navigation_modules_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."notifications"
    ADD CONSTRAINT "notifications_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."onboarding_phases"
    ADD CONSTRAINT "onboarding_phases_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."onboarding_predictions"
    ADD CONSTRAINT "onboarding_predictions_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."onboarding_tasks"
    ADD CONSTRAINT "onboarding_tasks_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."onboarding_workflows"
    ADD CONSTRAINT "onboarding_workflows_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."registration_steps"
    ADD CONSTRAINT "registration_steps_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."resume_analysis_cache"
    ADD CONSTRAINT "resume_analysis_cache_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."resume_analysis_cache"
    ADD CONSTRAINT "resume_analysis_cache_resume_version_id_job_description_id__key" UNIQUE ("resume_version_id", "job_description_id", "model");



ALTER TABLE ONLY "public"."resume_job_descriptions"
    ADD CONSTRAINT "resume_job_descriptions_candidate_id_content_hash_key" UNIQUE ("candidate_id", "content_hash");



ALTER TABLE ONLY "public"."resume_job_descriptions"
    ADD CONSTRAINT "resume_job_descriptions_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."resume_versions"
    ADD CONSTRAINT "resume_versions_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."resumes"
    ADD CONSTRAINT "resumes_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."retention_factors"
    ADD CONSTRAINT "retention_factors_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."retention_signals"
    ADD CONSTRAINT "retention_signals_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."role_talent_board_applicants"
    ADD CONSTRAINT "role_talent_board_applicants_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."role_talent_board_applicants"
    ADD CONSTRAINT "role_talent_board_applicants_role_board_id_talent_match_id_key" UNIQUE ("role_board_id", "talent_match_id");



ALTER TABLE ONLY "public"."role_talent_boards"
    ADD CONSTRAINT "role_talent_boards_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."skill_heatmap_points"
    ADD CONSTRAINT "skill_heatmap_points_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."skill_signals"
    ADD CONSTRAINT "skill_signals_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."talent_matches"
    ADD CONSTRAINT "talent_matches_candidate_id_key" UNIQUE ("candidate_id");



ALTER TABLE ONLY "public"."talent_matches"
    ADD CONSTRAINT "talent_matches_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."user_roles"
    ADD CONSTRAINT "user_roles_pkey" PRIMARY KEY ("user_id");



CREATE INDEX "idx_application_reviews_employer" ON "public"."application_reviews" USING "btree" ("employer_id");



CREATE INDEX "idx_attrition_clusters_employer" ON "public"."attrition_clusters" USING "btree" ("employer_id");



CREATE INDEX "idx_candidate_applications_candidate" ON "public"."candidate_applications" USING "btree" ("candidate_id");



CREATE INDEX "idx_candidate_applications_job" ON "public"."candidate_applications" USING "btree" ("job_id");



CREATE INDEX "idx_candidate_certifications_candidate" ON "public"."candidate_certifications" USING "btree" ("candidate_id");



CREATE INDEX "idx_candidate_dna_signals_candidate" ON "public"."candidate_dna_signals" USING "btree" ("candidate_id");



CREATE INDEX "idx_candidate_education_candidate" ON "public"."candidate_education" USING "btree" ("candidate_id");



CREATE INDEX "idx_candidate_experience_candidate" ON "public"."candidate_experience" USING "btree" ("candidate_id");



CREATE INDEX "idx_candidate_learning_signals_candidate" ON "public"."candidate_learning_signals" USING "btree" ("candidate_id");



CREATE INDEX "idx_candidate_portfolio_candidate" ON "public"."candidate_portfolio" USING "btree" ("candidate_id");



CREATE INDEX "idx_career_path_routes_candidate" ON "public"."career_path_routes" USING "btree" ("candidate_id");



CREATE INDEX "idx_career_root_branches_employer" ON "public"."career_root_branches" USING "btree" ("employer_id");



CREATE INDEX "idx_career_route_courses_route" ON "public"."career_route_courses" USING "btree" ("route_id");



CREATE INDEX "idx_chat_messages_session" ON "public"."chat_messages" USING "btree" ("candidate_id", "session");



CREATE INDEX "idx_cv_ingestion_employer" ON "public"."cv_ingestion_records" USING "btree" ("employer_id");



CREATE INDEX "idx_employer_metrics_employer" ON "public"."employer_metrics" USING "btree" ("employer_id");



CREATE INDEX "idx_interview_kits_match" ON "public"."interview_kits" USING "btree" ("talent_match_id");



CREATE INDEX "idx_interview_questions_category" ON "public"."interview_questions" USING "btree" ("category_id");



CREATE INDEX "idx_job_listings_active" ON "public"."job_listings" USING "btree" ("is_active") WHERE ("is_active" = true);



CREATE INDEX "idx_job_listings_employer" ON "public"."job_listings" USING "btree" ("employer_id");



CREATE INDEX "idx_kit_categories_kit" ON "public"."interview_kit_categories" USING "btree" ("kit_id");



CREATE INDEX "idx_notifications_unread" ON "public"."notifications" USING "btree" ("user_id", "is_read") WHERE ("is_read" = false);



CREATE INDEX "idx_notifications_user" ON "public"."notifications" USING "btree" ("user_id");



CREATE INDEX "idx_onboarding_phases_workflow" ON "public"."onboarding_phases" USING "btree" ("workflow_id");



CREATE INDEX "idx_onboarding_predictions_employer" ON "public"."onboarding_predictions" USING "btree" ("employer_id");



CREATE INDEX "idx_onboarding_tasks_phase" ON "public"."onboarding_tasks" USING "btree" ("phase_id");



CREATE INDEX "idx_onboarding_workflows_prediction" ON "public"."onboarding_workflows" USING "btree" ("prediction_id");



CREATE INDEX "idx_registration_steps_candidate" ON "public"."registration_steps" USING "btree" ("candidate_id");



CREATE INDEX "idx_resume_versions_candidate" ON "public"."resume_versions" USING "btree" ("candidate_id");



CREATE INDEX "idx_retention_factors_signal" ON "public"."retention_factors" USING "btree" ("retention_signal_id");



CREATE INDEX "idx_retention_signals_employer" ON "public"."retention_signals" USING "btree" ("employer_id");



CREATE INDEX "idx_role_talent_boards_employer" ON "public"."role_talent_boards" USING "btree" ("employer_id");



CREATE INDEX "idx_rtb_applicants_board" ON "public"."role_talent_board_applicants" USING "btree" ("role_board_id");



CREATE INDEX "idx_rtb_applicants_match" ON "public"."role_talent_board_applicants" USING "btree" ("talent_match_id");



CREATE INDEX "idx_skill_heatmap_skill" ON "public"."skill_heatmap_points" USING "btree" ("skill");



CREATE INDEX "idx_skill_signals_candidate" ON "public"."skill_signals" USING "btree" ("candidate_id");



CREATE INDEX "resume_analysis_cache_candidate_id_idx" ON "public"."resume_analysis_cache" USING "btree" ("candidate_id");



CREATE INDEX "resume_job_descriptions_candidate_id_idx" ON "public"."resume_job_descriptions" USING "btree" ("candidate_id");



CREATE INDEX "resume_versions_candidate_id_idx" ON "public"."resume_versions" USING "btree" ("candidate_id");



CREATE UNIQUE INDEX "resume_versions_resume_id_version_number_idx" ON "public"."resume_versions" USING "btree" ("resume_id", "version_number") WHERE ("resume_id" IS NOT NULL);



CREATE INDEX "resumes_candidate_id_idx" ON "public"."resumes" USING "btree" ("candidate_id");



CREATE OR REPLACE TRIGGER "set_candidate_profiles_updated_at" BEFORE UPDATE ON "public"."candidate_profiles" FOR EACH ROW EXECUTE FUNCTION "public"."set_updated_at"();



CREATE OR REPLACE TRIGGER "set_retention_signals_updated_at" BEFORE UPDATE ON "public"."retention_signals" FOR EACH ROW EXECUTE FUNCTION "public"."set_updated_at"();



CREATE OR REPLACE TRIGGER "set_talent_matches_updated_at" BEFORE UPDATE ON "public"."talent_matches" FOR EACH ROW EXECUTE FUNCTION "public"."set_updated_at"();



ALTER TABLE ONLY "public"."application_reviews"
    ADD CONSTRAINT "application_reviews_employer_id_fkey" FOREIGN KEY ("employer_id") REFERENCES "public"."employers"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."attrition_clusters"
    ADD CONSTRAINT "attrition_clusters_employer_id_fkey" FOREIGN KEY ("employer_id") REFERENCES "public"."employers"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."candidate_applications"
    ADD CONSTRAINT "candidate_applications_candidate_id_fkey" FOREIGN KEY ("candidate_id") REFERENCES "public"."candidate_profiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."candidate_applications"
    ADD CONSTRAINT "candidate_applications_job_id_fkey" FOREIGN KEY ("job_id") REFERENCES "public"."job_listings"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."candidate_certifications"
    ADD CONSTRAINT "candidate_certifications_candidate_id_fkey" FOREIGN KEY ("candidate_id") REFERENCES "public"."candidate_profiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."candidate_dna_signals"
    ADD CONSTRAINT "candidate_dna_signals_candidate_id_fkey" FOREIGN KEY ("candidate_id") REFERENCES "public"."candidate_profiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."candidate_education"
    ADD CONSTRAINT "candidate_education_candidate_id_fkey" FOREIGN KEY ("candidate_id") REFERENCES "public"."candidate_profiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."candidate_experience"
    ADD CONSTRAINT "candidate_experience_candidate_id_fkey" FOREIGN KEY ("candidate_id") REFERENCES "public"."candidate_profiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."candidate_learning_signals"
    ADD CONSTRAINT "candidate_learning_signals_candidate_id_fkey" FOREIGN KEY ("candidate_id") REFERENCES "public"."candidate_profiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."candidate_portfolio"
    ADD CONSTRAINT "candidate_portfolio_candidate_id_fkey" FOREIGN KEY ("candidate_id") REFERENCES "public"."candidate_profiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."candidate_profiles"
    ADD CONSTRAINT "candidate_profiles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."career_path_routes"
    ADD CONSTRAINT "career_path_routes_candidate_id_fkey" FOREIGN KEY ("candidate_id") REFERENCES "public"."candidate_profiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."career_root_branches"
    ADD CONSTRAINT "career_root_branches_employer_id_fkey" FOREIGN KEY ("employer_id") REFERENCES "public"."employers"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."career_route_courses"
    ADD CONSTRAINT "career_route_courses_route_id_fkey" FOREIGN KEY ("route_id") REFERENCES "public"."career_path_routes"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."chat_messages"
    ADD CONSTRAINT "chat_messages_candidate_id_fkey" FOREIGN KEY ("candidate_id") REFERENCES "public"."candidate_profiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."course_job_mappings"
    ADD CONSTRAINT "course_job_mappings_course_id_fkey" FOREIGN KEY ("course_id") REFERENCES "public"."course_recommendations"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."course_job_mappings"
    ADD CONSTRAINT "course_job_mappings_job_id_fkey" FOREIGN KEY ("job_id") REFERENCES "public"."job_listings"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."cv_ingestion_records"
    ADD CONSTRAINT "cv_ingestion_records_employer_id_fkey" FOREIGN KEY ("employer_id") REFERENCES "public"."employers"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."employer_metrics"
    ADD CONSTRAINT "employer_metrics_employer_id_fkey" FOREIGN KEY ("employer_id") REFERENCES "public"."employers"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."interview_kit_categories"
    ADD CONSTRAINT "interview_kit_categories_kit_id_fkey" FOREIGN KEY ("kit_id") REFERENCES "public"."interview_kits"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."interview_kits"
    ADD CONSTRAINT "interview_kits_talent_match_id_fkey" FOREIGN KEY ("talent_match_id") REFERENCES "public"."talent_matches"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."interview_questions"
    ADD CONSTRAINT "interview_questions_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "public"."interview_kit_categories"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."job_listings"
    ADD CONSTRAINT "job_listings_employer_id_fkey" FOREIGN KEY ("employer_id") REFERENCES "public"."employers"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."notifications"
    ADD CONSTRAINT "notifications_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."onboarding_phases"
    ADD CONSTRAINT "onboarding_phases_workflow_id_fkey" FOREIGN KEY ("workflow_id") REFERENCES "public"."onboarding_workflows"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."onboarding_predictions"
    ADD CONSTRAINT "onboarding_predictions_employer_id_fkey" FOREIGN KEY ("employer_id") REFERENCES "public"."employers"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."onboarding_tasks"
    ADD CONSTRAINT "onboarding_tasks_phase_id_fkey" FOREIGN KEY ("phase_id") REFERENCES "public"."onboarding_phases"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."onboarding_workflows"
    ADD CONSTRAINT "onboarding_workflows_prediction_id_fkey" FOREIGN KEY ("prediction_id") REFERENCES "public"."onboarding_predictions"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."registration_steps"
    ADD CONSTRAINT "registration_steps_candidate_id_fkey" FOREIGN KEY ("candidate_id") REFERENCES "public"."candidate_profiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."resume_analysis_cache"
    ADD CONSTRAINT "resume_analysis_cache_candidate_id_fkey" FOREIGN KEY ("candidate_id") REFERENCES "public"."candidate_profiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."resume_analysis_cache"
    ADD CONSTRAINT "resume_analysis_cache_job_description_id_fkey" FOREIGN KEY ("job_description_id") REFERENCES "public"."resume_job_descriptions"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."resume_analysis_cache"
    ADD CONSTRAINT "resume_analysis_cache_resume_version_id_fkey" FOREIGN KEY ("resume_version_id") REFERENCES "public"."resume_versions"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."resume_job_descriptions"
    ADD CONSTRAINT "resume_job_descriptions_candidate_id_fkey" FOREIGN KEY ("candidate_id") REFERENCES "public"."candidate_profiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."resume_versions"
    ADD CONSTRAINT "resume_versions_candidate_id_fkey" FOREIGN KEY ("candidate_id") REFERENCES "public"."candidate_profiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."resume_versions"
    ADD CONSTRAINT "resume_versions_resume_id_fkey" FOREIGN KEY ("resume_id") REFERENCES "public"."resumes"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."resumes"
    ADD CONSTRAINT "resumes_active_version_id_fkey" FOREIGN KEY ("active_version_id") REFERENCES "public"."resume_versions"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."resumes"
    ADD CONSTRAINT "resumes_candidate_id_fkey" FOREIGN KEY ("candidate_id") REFERENCES "public"."candidate_profiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."retention_factors"
    ADD CONSTRAINT "retention_factors_retention_signal_id_fkey" FOREIGN KEY ("retention_signal_id") REFERENCES "public"."retention_signals"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."retention_signals"
    ADD CONSTRAINT "retention_signals_employer_id_fkey" FOREIGN KEY ("employer_id") REFERENCES "public"."employers"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."role_talent_board_applicants"
    ADD CONSTRAINT "role_talent_board_applicants_role_board_id_fkey" FOREIGN KEY ("role_board_id") REFERENCES "public"."role_talent_boards"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."role_talent_board_applicants"
    ADD CONSTRAINT "role_talent_board_applicants_talent_match_id_fkey" FOREIGN KEY ("talent_match_id") REFERENCES "public"."talent_matches"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."role_talent_boards"
    ADD CONSTRAINT "role_talent_boards_employer_id_fkey" FOREIGN KEY ("employer_id") REFERENCES "public"."employers"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."skill_signals"
    ADD CONSTRAINT "skill_signals_candidate_id_fkey" FOREIGN KEY ("candidate_id") REFERENCES "public"."candidate_profiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."talent_matches"
    ADD CONSTRAINT "talent_matches_candidate_id_fkey" FOREIGN KEY ("candidate_id") REFERENCES "public"."candidate_profiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."user_roles"
    ADD CONSTRAINT "user_roles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



CREATE POLICY "Candidates create own analysis cache" ON "public"."resume_analysis_cache" FOR INSERT TO "authenticated" WITH CHECK (((( SELECT "auth"."uid"() AS "uid") = "candidate_id") AND (EXISTS ( SELECT 1
   FROM "public"."resume_versions"
  WHERE (("resume_versions"."id" = "resume_analysis_cache"."resume_version_id") AND ("resume_versions"."candidate_id" = ( SELECT "auth"."uid"() AS "uid"))))) AND (EXISTS ( SELECT 1
   FROM "public"."resume_job_descriptions"
  WHERE (("resume_job_descriptions"."id" = "resume_analysis_cache"."job_description_id") AND ("resume_job_descriptions"."candidate_id" = ( SELECT "auth"."uid"() AS "uid")))))));



CREATE POLICY "Candidates create own resume versions" ON "public"."resume_versions" FOR INSERT TO "authenticated" WITH CHECK (((( SELECT "auth"."uid"() AS "uid") = "candidate_id") AND (EXISTS ( SELECT 1
   FROM "public"."resumes"
  WHERE (("resumes"."id" = "resume_versions"."resume_id") AND ("resumes"."candidate_id" = ( SELECT "auth"."uid"() AS "uid")))))));



CREATE POLICY "Candidates create own resumes" ON "public"."resumes" FOR INSERT TO "authenticated" WITH CHECK ((( SELECT "auth"."uid"() AS "uid") = "candidate_id"));



CREATE POLICY "Candidates delete own resumes" ON "public"."resumes" FOR DELETE TO "authenticated" USING ((( SELECT "auth"."uid"() AS "uid") = "candidate_id"));



CREATE POLICY "Candidates manage own job descriptions" ON "public"."resume_job_descriptions" TO "authenticated" USING ((( SELECT "auth"."uid"() AS "uid") = "candidate_id")) WITH CHECK ((( SELECT "auth"."uid"() AS "uid") = "candidate_id"));



CREATE POLICY "Candidates read own analysis cache" ON "public"."resume_analysis_cache" FOR SELECT TO "authenticated" USING ((( SELECT "auth"."uid"() AS "uid") = "candidate_id"));



CREATE POLICY "Candidates read own resume versions" ON "public"."resume_versions" FOR SELECT TO "authenticated" USING ((( SELECT "auth"."uid"() AS "uid") = "candidate_id"));



CREATE POLICY "Candidates read own resumes" ON "public"."resumes" FOR SELECT TO "authenticated" USING ((( SELECT "auth"."uid"() AS "uid") = "candidate_id"));



CREATE POLICY "Candidates update own resumes" ON "public"."resumes" FOR UPDATE TO "authenticated" USING ((( SELECT "auth"."uid"() AS "uid") = "candidate_id")) WITH CHECK (((( SELECT "auth"."uid"() AS "uid") = "candidate_id") AND (("active_version_id" IS NULL) OR (EXISTS ( SELECT 1
   FROM "public"."resume_versions"
  WHERE (("resume_versions"."id" = "resumes"."active_version_id") AND ("resume_versions"."candidate_id" = ( SELECT "auth"."uid"() AS "uid"))))))));



CREATE POLICY "Employers can manage own job listings" ON "public"."job_listings" USING ((EXISTS ( SELECT 1
   FROM "public"."employers" "e"
  WHERE (("e"."id" = "job_listings"."employer_id") AND (EXISTS ( SELECT 1
           FROM "public"."user_roles"
          WHERE (("user_roles"."user_id" = "auth"."uid"()) AND ("user_roles"."role" = 'employer'::"public"."portal"))))))));



CREATE POLICY "Employers can read candidate profiles" ON "public"."candidate_profiles" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM "public"."user_roles"
  WHERE (("user_roles"."user_id" = "auth"."uid"()) AND ("user_roles"."role" = 'employer'::"public"."portal")))));



CREATE POLICY "Job listings are readable by all authenticated users" ON "public"."job_listings" FOR SELECT USING (("auth"."role"() = 'authenticated'::"text"));



CREATE POLICY "Users can read own candidate profile" ON "public"."candidate_profiles" FOR SELECT USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can update own candidate profile" ON "public"."candidate_profiles" FOR UPDATE USING (("auth"."uid"() = "user_id"));



ALTER TABLE "public"."application_reviews" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."attrition_clusters" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."candidate_applications" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."candidate_certifications" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."candidate_dna_signals" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."candidate_education" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."candidate_experience" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."candidate_learning_signals" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."candidate_portfolio" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."candidate_profiles" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."career_path_routes" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."career_root_branches" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."career_route_courses" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."chat_messages" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."course_job_mappings" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."course_recommendations" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."cv_ingestion_records" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."employer_metrics" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."employers" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."interview_kit_categories" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."interview_kits" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."interview_questions" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."job_listings" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."navigation_modules" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."notifications" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."onboarding_phases" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."onboarding_predictions" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."onboarding_tasks" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."onboarding_workflows" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."registration_steps" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."resume_analysis_cache" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."resume_job_descriptions" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."resume_versions" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."resumes" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."retention_factors" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."retention_signals" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."role_talent_board_applicants" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."role_talent_boards" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."skill_heatmap_points" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."skill_signals" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."talent_matches" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."user_roles" ENABLE ROW LEVEL SECURITY;


GRANT USAGE ON SCHEMA "public" TO "postgres";
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";



GRANT ALL ON FUNCTION "public"."set_updated_at"() TO "anon";
GRANT ALL ON FUNCTION "public"."set_updated_at"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."set_updated_at"() TO "service_role";



GRANT ALL ON TABLE "public"."application_reviews" TO "anon";
GRANT ALL ON TABLE "public"."application_reviews" TO "authenticated";
GRANT ALL ON TABLE "public"."application_reviews" TO "service_role";



GRANT ALL ON TABLE "public"."attrition_clusters" TO "anon";
GRANT ALL ON TABLE "public"."attrition_clusters" TO "authenticated";
GRANT ALL ON TABLE "public"."attrition_clusters" TO "service_role";



GRANT ALL ON TABLE "public"."candidate_applications" TO "anon";
GRANT ALL ON TABLE "public"."candidate_applications" TO "authenticated";
GRANT ALL ON TABLE "public"."candidate_applications" TO "service_role";



GRANT ALL ON TABLE "public"."candidate_certifications" TO "anon";
GRANT ALL ON TABLE "public"."candidate_certifications" TO "authenticated";
GRANT ALL ON TABLE "public"."candidate_certifications" TO "service_role";



GRANT ALL ON TABLE "public"."candidate_dna_signals" TO "anon";
GRANT ALL ON TABLE "public"."candidate_dna_signals" TO "authenticated";
GRANT ALL ON TABLE "public"."candidate_dna_signals" TO "service_role";



GRANT ALL ON TABLE "public"."candidate_education" TO "anon";
GRANT ALL ON TABLE "public"."candidate_education" TO "authenticated";
GRANT ALL ON TABLE "public"."candidate_education" TO "service_role";



GRANT ALL ON TABLE "public"."candidate_experience" TO "anon";
GRANT ALL ON TABLE "public"."candidate_experience" TO "authenticated";
GRANT ALL ON TABLE "public"."candidate_experience" TO "service_role";



GRANT ALL ON TABLE "public"."candidate_learning_signals" TO "anon";
GRANT ALL ON TABLE "public"."candidate_learning_signals" TO "authenticated";
GRANT ALL ON TABLE "public"."candidate_learning_signals" TO "service_role";



GRANT ALL ON TABLE "public"."candidate_portfolio" TO "anon";
GRANT ALL ON TABLE "public"."candidate_portfolio" TO "authenticated";
GRANT ALL ON TABLE "public"."candidate_portfolio" TO "service_role";



GRANT ALL ON TABLE "public"."candidate_profiles" TO "anon";
GRANT ALL ON TABLE "public"."candidate_profiles" TO "authenticated";
GRANT ALL ON TABLE "public"."candidate_profiles" TO "service_role";



GRANT ALL ON TABLE "public"."career_path_routes" TO "anon";
GRANT ALL ON TABLE "public"."career_path_routes" TO "authenticated";
GRANT ALL ON TABLE "public"."career_path_routes" TO "service_role";



GRANT ALL ON TABLE "public"."career_root_branches" TO "anon";
GRANT ALL ON TABLE "public"."career_root_branches" TO "authenticated";
GRANT ALL ON TABLE "public"."career_root_branches" TO "service_role";



GRANT ALL ON TABLE "public"."career_route_courses" TO "anon";
GRANT ALL ON TABLE "public"."career_route_courses" TO "authenticated";
GRANT ALL ON TABLE "public"."career_route_courses" TO "service_role";



GRANT ALL ON TABLE "public"."chat_messages" TO "anon";
GRANT ALL ON TABLE "public"."chat_messages" TO "authenticated";
GRANT ALL ON TABLE "public"."chat_messages" TO "service_role";



GRANT ALL ON TABLE "public"."course_job_mappings" TO "anon";
GRANT ALL ON TABLE "public"."course_job_mappings" TO "authenticated";
GRANT ALL ON TABLE "public"."course_job_mappings" TO "service_role";



GRANT ALL ON TABLE "public"."course_recommendations" TO "anon";
GRANT ALL ON TABLE "public"."course_recommendations" TO "authenticated";
GRANT ALL ON TABLE "public"."course_recommendations" TO "service_role";



GRANT ALL ON TABLE "public"."cv_ingestion_records" TO "anon";
GRANT ALL ON TABLE "public"."cv_ingestion_records" TO "authenticated";
GRANT ALL ON TABLE "public"."cv_ingestion_records" TO "service_role";



GRANT ALL ON TABLE "public"."employer_metrics" TO "anon";
GRANT ALL ON TABLE "public"."employer_metrics" TO "authenticated";
GRANT ALL ON TABLE "public"."employer_metrics" TO "service_role";



GRANT ALL ON TABLE "public"."employers" TO "anon";
GRANT ALL ON TABLE "public"."employers" TO "authenticated";
GRANT ALL ON TABLE "public"."employers" TO "service_role";



GRANT ALL ON TABLE "public"."interview_kit_categories" TO "anon";
GRANT ALL ON TABLE "public"."interview_kit_categories" TO "authenticated";
GRANT ALL ON TABLE "public"."interview_kit_categories" TO "service_role";



GRANT ALL ON TABLE "public"."interview_kits" TO "anon";
GRANT ALL ON TABLE "public"."interview_kits" TO "authenticated";
GRANT ALL ON TABLE "public"."interview_kits" TO "service_role";



GRANT ALL ON TABLE "public"."interview_questions" TO "anon";
GRANT ALL ON TABLE "public"."interview_questions" TO "authenticated";
GRANT ALL ON TABLE "public"."interview_questions" TO "service_role";



GRANT ALL ON TABLE "public"."job_listings" TO "anon";
GRANT ALL ON TABLE "public"."job_listings" TO "authenticated";
GRANT ALL ON TABLE "public"."job_listings" TO "service_role";



GRANT ALL ON TABLE "public"."navigation_modules" TO "anon";
GRANT ALL ON TABLE "public"."navigation_modules" TO "authenticated";
GRANT ALL ON TABLE "public"."navigation_modules" TO "service_role";



GRANT ALL ON TABLE "public"."notifications" TO "anon";
GRANT ALL ON TABLE "public"."notifications" TO "authenticated";
GRANT ALL ON TABLE "public"."notifications" TO "service_role";



GRANT ALL ON TABLE "public"."onboarding_phases" TO "anon";
GRANT ALL ON TABLE "public"."onboarding_phases" TO "authenticated";
GRANT ALL ON TABLE "public"."onboarding_phases" TO "service_role";



GRANT ALL ON TABLE "public"."onboarding_predictions" TO "anon";
GRANT ALL ON TABLE "public"."onboarding_predictions" TO "authenticated";
GRANT ALL ON TABLE "public"."onboarding_predictions" TO "service_role";



GRANT ALL ON TABLE "public"."onboarding_tasks" TO "anon";
GRANT ALL ON TABLE "public"."onboarding_tasks" TO "authenticated";
GRANT ALL ON TABLE "public"."onboarding_tasks" TO "service_role";



GRANT ALL ON TABLE "public"."onboarding_workflows" TO "anon";
GRANT ALL ON TABLE "public"."onboarding_workflows" TO "authenticated";
GRANT ALL ON TABLE "public"."onboarding_workflows" TO "service_role";



GRANT ALL ON TABLE "public"."registration_steps" TO "anon";
GRANT ALL ON TABLE "public"."registration_steps" TO "authenticated";
GRANT ALL ON TABLE "public"."registration_steps" TO "service_role";



GRANT ALL ON TABLE "public"."resume_analysis_cache" TO "anon";
GRANT ALL ON TABLE "public"."resume_analysis_cache" TO "authenticated";
GRANT ALL ON TABLE "public"."resume_analysis_cache" TO "service_role";



GRANT ALL ON TABLE "public"."resume_job_descriptions" TO "anon";
GRANT ALL ON TABLE "public"."resume_job_descriptions" TO "authenticated";
GRANT ALL ON TABLE "public"."resume_job_descriptions" TO "service_role";



GRANT ALL ON TABLE "public"."resume_versions" TO "anon";
GRANT ALL ON TABLE "public"."resume_versions" TO "authenticated";
GRANT ALL ON TABLE "public"."resume_versions" TO "service_role";



GRANT ALL ON TABLE "public"."resumes" TO "anon";
GRANT ALL ON TABLE "public"."resumes" TO "authenticated";
GRANT ALL ON TABLE "public"."resumes" TO "service_role";



GRANT ALL ON TABLE "public"."retention_factors" TO "anon";
GRANT ALL ON TABLE "public"."retention_factors" TO "authenticated";
GRANT ALL ON TABLE "public"."retention_factors" TO "service_role";



GRANT ALL ON TABLE "public"."retention_signals" TO "anon";
GRANT ALL ON TABLE "public"."retention_signals" TO "authenticated";
GRANT ALL ON TABLE "public"."retention_signals" TO "service_role";



GRANT ALL ON TABLE "public"."role_talent_board_applicants" TO "anon";
GRANT ALL ON TABLE "public"."role_talent_board_applicants" TO "authenticated";
GRANT ALL ON TABLE "public"."role_talent_board_applicants" TO "service_role";



GRANT ALL ON TABLE "public"."role_talent_boards" TO "anon";
GRANT ALL ON TABLE "public"."role_talent_boards" TO "authenticated";
GRANT ALL ON TABLE "public"."role_talent_boards" TO "service_role";



GRANT ALL ON TABLE "public"."skill_heatmap_points" TO "anon";
GRANT ALL ON TABLE "public"."skill_heatmap_points" TO "authenticated";
GRANT ALL ON TABLE "public"."skill_heatmap_points" TO "service_role";



GRANT ALL ON TABLE "public"."skill_signals" TO "anon";
GRANT ALL ON TABLE "public"."skill_signals" TO "authenticated";
GRANT ALL ON TABLE "public"."skill_signals" TO "service_role";



GRANT ALL ON TABLE "public"."talent_matches" TO "anon";
GRANT ALL ON TABLE "public"."talent_matches" TO "authenticated";
GRANT ALL ON TABLE "public"."talent_matches" TO "service_role";



GRANT ALL ON TABLE "public"."user_roles" TO "anon";
GRANT ALL ON TABLE "public"."user_roles" TO "authenticated";
GRANT ALL ON TABLE "public"."user_roles" TO "service_role";



ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "service_role";