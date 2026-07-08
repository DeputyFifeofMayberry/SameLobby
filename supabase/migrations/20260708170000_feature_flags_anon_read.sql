-- Allow anonymous read of operational feature flags (no sensitive data)
create policy feature_flags_select_anon
  on public.feature_flags
  for select
  to anon
  using (true);
