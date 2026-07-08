-- Accounts: users read and update their own row only
create policy accounts_select_own
  on public.accounts
  for select
  to authenticated
  using (auth.uid() = auth_user_id);

create policy accounts_update_own
  on public.accounts
  for update
  to authenticated
  using (auth.uid() = auth_user_id)
  with check (auth.uid() = auth_user_id);

-- Consent events: insert and read own
create policy consent_events_select_own
  on public.consent_events
  for select
  to authenticated
  using (
    account_id in (
      select id from public.accounts where auth_user_id = auth.uid()
    )
  );

create policy consent_events_insert_own
  on public.consent_events
  for insert
  to authenticated
  with check (
    account_id in (
      select id from public.accounts where auth_user_id = auth.uid()
    )
  );

-- Deletion requests: own rows only
create policy deletion_requests_select_own
  on public.deletion_requests
  for select
  to authenticated
  using (
    account_id in (
      select id from public.accounts where auth_user_id = auth.uid()
    )
  );

create policy deletion_requests_insert_own
  on public.deletion_requests
  for insert
  to authenticated
  with check (
    account_id in (
      select id from public.accounts where auth_user_id = auth.uid()
    )
  );

-- Feature flags: authenticated read (operational flags, no sensitive data)
create policy feature_flags_select_authenticated
  on public.feature_flags
  for select
  to authenticated
  using (true);

-- admin_users and audit_events: no user policies (deny by default)
