-- Hardening follow-up to 20260727000000_candidate_onboarding.sql
--
-- Supabase's default privileges grant anon and authenticated broad access to new tables in the
-- public schema. The onboarding tables were therefore reachable by the anon role at the privilege
-- layer, with only RLS standing between an anonymous caller and the rows.
--
-- RLS already denies them (every policy is `to authenticated`, and llm_rate_limits has no policy
-- at all, so both fail closed). This migration removes the redundant grants so the privilege layer
-- states the same intent as the policy layer — a later "temporary" permissive policy then cannot
-- silently expose these tables to anonymous callers.

revoke all on public.candidate_onboarding_sessions from anon;
revoke all on public.candidate_profile_facts from anon;

-- Written only by consume_rate_limit() (SECURITY DEFINER). No role needs direct access, so a
-- candidate cannot read or forge their own counters.
revoke all on public.llm_rate_limits from anon, authenticated;

-- Never let an anonymous caller resolve or mutate candidate state directly.
revoke all on function public.current_candidate_id() from anon;
revoke all on function public.consume_rate_limit(text, integer, integer) from anon;
revoke all on function public.upsert_candidate_facts(jsonb) from anon;
revoke all on function public.complete_candidate_onboarding() from anon;
