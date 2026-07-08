create table public.feature_flags (
  key text primary key,
  enabled boolean not null default false,
  updated_at timestamptz not null default now(),
  updated_by uuid references public.accounts (id) on delete set null
);

insert into public.feature_flags (key, enabled) values
  ('registration_open', true),
  ('connection_requests_enabled', false),
  ('messaging_enabled', false),
  ('discovery_enabled', false),
  ('stripe_enabled', false),
  ('links_in_messages', false);
