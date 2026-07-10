-- E2E fixtures use the service_role client for seed setup; table privileges are required even though RLS is bypassed.

grant select on public.accounts to service_role;
grant select, update on public.feature_flags to service_role;
grant select, insert, update, delete on public.subscriptions to service_role;
grant select, insert, update, delete on public.play_invitations to service_role;
grant select, insert, update, delete on public.private_groups to service_role;
grant select on public.games to service_role;
grant select, insert, update, delete on public.user_games to service_role;
