-- pgTAP + RLS: grant table access so policies (not privileges) enforce denial.

grant select on public.stripe_webhook_events to authenticated;

create policy stripe_webhook_events_deny_authenticated
  on public.stripe_webhook_events for all to authenticated
  using (false)
  with check (false);

grant select on public.moderation_evidence to authenticated;

grant select, update on public.audit_events to authenticated;

create policy audit_events_deny_authenticated
  on public.audit_events for all to authenticated
  using (false)
  with check (false);

create policy private_groups_update_owner
  on public.private_groups for update to authenticated
  using (owner_account_id = public.current_account_id())
  with check (owner_account_id = public.current_account_id());

grant update on public.private_groups to authenticated;
