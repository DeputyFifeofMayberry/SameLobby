-- Slice 3: cohort metrics, activation status, demand signals, discovery pause

create type public.cohort_status as enum (
  'below_threshold',
  'demand_collecting',
  'qualified',
  'active_discovery'
);

alter table public.gamer_profiles
  add column if not exists discovery_paused_at timestamptz;

create table public.cohort_metrics (
  id uuid primary key default gen_random_uuid(),
  cohort_key text not null,
  qualified_account_count int not null,
  measured_at timestamptz not null default now()
);

create index cohort_metrics_cohort_key_idx on public.cohort_metrics (cohort_key, measured_at desc);

create table public.cohort_activation_status (
  cohort_key text primary key,
  status public.cohort_status not null default 'below_threshold',
  updated_at timestamptz not null default now()
);

create table public.demand_signals (
  id uuid primary key default gen_random_uuid(),
  account_id uuid not null references public.accounts (id) on delete cascade,
  cohort_key text not null,
  created_at timestamptz not null default now(),
  unique (account_id, cohort_key)
);

create index demand_signals_cohort_key_idx on public.demand_signals (cohort_key);

-- Intent fields for game-specific discovery (J02)
alter table public.current_intents
  add column if not exists game_id uuid references public.games (id) on delete set null,
  add column if not exists platform_id uuid references public.platforms (id) on delete set null,
  add column if not exists voice_preferred boolean not null default false;

alter table public.cohort_metrics enable row level security;
alter table public.cohort_activation_status enable row level security;
alter table public.demand_signals enable row level security;

create policy cohort_metrics_select_authenticated
  on public.cohort_metrics for select to authenticated using (true);

create policy cohort_activation_status_select_authenticated
  on public.cohort_activation_status for select to authenticated using (true);

create policy demand_signals_select_own
  on public.demand_signals for select to authenticated
  using (account_id in (select id from public.accounts where auth_user_id = auth.uid()));

create policy demand_signals_insert_own
  on public.demand_signals for insert to authenticated
  with check (account_id in (select id from public.accounts where auth_user_id = auth.uid()));

grant select on public.cohort_metrics to authenticated;
grant select on public.cohort_activation_status to authenticated;
grant select, insert on public.demand_signals to authenticated;
