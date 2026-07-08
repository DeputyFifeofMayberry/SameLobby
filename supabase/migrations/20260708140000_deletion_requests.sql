create table public.deletion_requests (
  id uuid primary key default gen_random_uuid(),
  account_id uuid not null references public.accounts (id) on delete cascade,
  status public.deletion_request_status not null default 'requested',
  requested_at timestamptz not null default now(),
  scheduled_purge_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index deletion_requests_account_id_idx on public.deletion_requests (account_id);

create trigger deletion_requests_set_updated_at
  before update on public.deletion_requests
  for each row
  execute function public.set_updated_at();
