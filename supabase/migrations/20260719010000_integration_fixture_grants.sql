-- Vitest integration harness: extend service_role table grants for fixture setup.

grant update on public.accounts to service_role;
grant select on public.platforms to service_role;
grant select, insert, update on public.gamer_profiles to service_role;
grant select, insert, update on public.current_intents to service_role;
grant select on public.disclosure_settings to service_role;
grant select on public.deletion_requests to service_role;
grant select on public.entitlements to service_role;
grant select on public.connections to service_role;
grant select on public.connection_requests to service_role;
grant select, insert, update on public.conversations to service_role;
grant select, insert, update on public.conversation_members to service_role;
grant select, insert, update, delete on public.messages to service_role;
grant select, insert, update on public.play_invitations to service_role;
grant select, insert, update on public.play_time_options to service_role;
grant select, insert, update on public.gaming_sessions to service_role;
grant select, insert, update on public.private_groups to service_role;
grant select, insert, update, delete on public.reports to service_role;
grant select, insert, update on public.moderation_cases to service_role;
grant select, insert, update on public.moderation_evidence to service_role;
grant select, insert, update, delete on public.admin_users to service_role;
grant select, insert, update, delete on public.blocks to service_role;
grant select, insert, update on public.notifications to service_role;
grant select, insert, update on public.notification_preferences to service_role;
grant select, insert on public.stripe_webhook_events to service_role;
grant select on public.plans to service_role;
