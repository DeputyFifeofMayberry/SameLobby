-- Account status lifecycle (Slice 1)
create type public.account_status as enum (
  'onboarding',
  'active',
  'restricted',
  'suspended',
  'deletion_pending',
  'deleted'
);

create type public.deletion_request_status as enum (
  'requested',
  'confirmed',
  'processing',
  'completed'
);

create type public.consent_event_type as enum (
  'adult_attestation',
  'terms_accepted',
  'privacy_accepted',
  'community_standards_accepted',
  'policy_updated'
);

create table public.accounts (
  id uuid primary key default gen_random_uuid(),
  auth_user_id uuid not null unique references auth.users (id) on delete cascade,
  email text not null,
  status public.account_status not null default 'onboarding',
  adult_attested_at timestamptz,
  terms_version text,
  privacy_version text,
  community_standards_version text,
  locale text not null default 'en-US',
  time_zone text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create index accounts_status_idx on public.accounts (status);
create index accounts_email_idx on public.accounts (email);

create table public.consent_events (
  id uuid primary key default gen_random_uuid(),
  account_id uuid not null references public.accounts (id) on delete cascade,
  event_type public.consent_event_type not null,
  policy_version text not null,
  ip_hash text,
  user_agent_hash text,
  created_at timestamptz not null default now()
);

create index consent_events_account_id_idx on public.consent_events (account_id);

-- Auto-provision account row when auth user is created
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.accounts (auth_user_id, email, status)
  values (new.id, coalesce(new.email, ''), 'onboarding');
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute function public.handle_new_user();

-- updated_at trigger
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger accounts_set_updated_at
  before update on public.accounts
  for each row
  execute function public.set_updated_at();
