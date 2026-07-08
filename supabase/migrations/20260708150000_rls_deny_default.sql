-- Deny-by-default: enable RLS on all user-linked tables (no permissive policies yet)
alter table public.accounts enable row level security;
alter table public.consent_events enable row level security;
alter table public.admin_users enable row level security;
alter table public.audit_events enable row level security;
alter table public.feature_flags enable row level security;
alter table public.deletion_requests enable row level security;
