-- Slice 8d part 2: generic job run idempotency log (migration 023)

create type public.job_run_status as enum (
  'running',
  'completed',
  'failed'
);

create table public.job_runs (
  id uuid primary key default gen_random_uuid(),
  job_name text not null,
  idempotency_key text not null,
  status public.job_run_status not null default 'running',
  metadata jsonb not null default '{}',
  started_at timestamptz not null default now(),
  completed_at timestamptz,
  unique (job_name, idempotency_key)
);

create index job_runs_job_name_idx on public.job_runs (job_name, started_at desc);

alter table public.job_runs enable row level security;

revoke all on table public.job_runs from authenticated, anon;
