-- Base table privileges required for RLS policies (pgTAP + app clients)
-- Note: tests schema grants live in supabase/tests/000_setup.test.sql (local CI only)

grant select, update on public.accounts to authenticated;
grant select, insert on public.consent_events to authenticated;
grant select on public.feature_flags to anon, authenticated;
grant select, insert on public.deletion_requests to authenticated;
