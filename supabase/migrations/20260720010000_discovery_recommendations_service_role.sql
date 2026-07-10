-- Allow service_role to refresh discovery recommendation snapshots.

grant select, insert, delete on public.discovery_recommendations to service_role;
