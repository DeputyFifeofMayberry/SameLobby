create table public.admin_users (
  account_id uuid primary key references public.accounts (id) on delete cascade,
  scopes text[] not null default '{}',
  mfa_enrolled_at timestamptz,
  disabled_at timestamptz,
  created_at timestamptz not null default now()
);

create table public.audit_events (
  id uuid primary key default gen_random_uuid(),
  actor_account_id uuid references public.accounts (id) on delete set null,
  action text not null,
  resource_type text not null,
  resource_id text,
  metadata jsonb not null default '{}',
  correlation_id text,
  created_at timestamptz not null default now()
);

create index audit_events_actor_idx on public.audit_events (actor_account_id);
create index audit_events_created_at_idx on public.audit_events (created_at desc);
