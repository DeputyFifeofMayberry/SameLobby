-- pgTAP + admin RPC: table grants required alongside RLS policies for moderation workflows.

grant select on public.moderation_cases to authenticated;
grant insert, update on public.moderation_actions to authenticated;
