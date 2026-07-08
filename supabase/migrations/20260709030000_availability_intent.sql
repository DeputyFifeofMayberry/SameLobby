-- Slice 2: availability windows and current intents

create type public.intent_status as enum ('active', 'paused', 'expired');

create table public.availability_windows (
  id uuid primary key default gen_random_uuid(),
  account_id uuid not null references public.accounts (id) on delete cascade,
  day_of_week smallint not null check (day_of_week between 0 and 6),
  start_time time not null,
  end_time time not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint availability_windows_time_order check (start_time < end_time)
);

create index availability_windows_account_id_idx on public.availability_windows (account_id);

create table public.current_intents (
  id uuid primary key default gen_random_uuid(),
  account_id uuid not null references public.accounts (id) on delete cascade,
  goal public.intent_goal not null,
  status public.intent_status not null default 'active',
  expires_at timestamptz not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index current_intents_account_id_idx on public.current_intents (account_id);
create index current_intents_active_idx on public.current_intents (account_id, status);

create trigger availability_windows_set_updated_at
  before update on public.availability_windows
  for each row
  execute function public.set_updated_at();

create trigger current_intents_set_updated_at
  before update on public.current_intents
  for each row
  execute function public.set_updated_at();

alter table public.availability_windows enable row level security;
alter table public.current_intents enable row level security;

create policy availability_windows_select_own
  on public.availability_windows for select to authenticated
  using (account_id in (select id from public.accounts where auth_user_id = auth.uid()));

create policy availability_windows_insert_own
  on public.availability_windows for insert to authenticated
  with check (account_id in (select id from public.accounts where auth_user_id = auth.uid()));

create policy availability_windows_update_own
  on public.availability_windows for update to authenticated
  using (account_id in (select id from public.accounts where auth_user_id = auth.uid()))
  with check (account_id in (select id from public.accounts where auth_user_id = auth.uid()));

create policy availability_windows_delete_own
  on public.availability_windows for delete to authenticated
  using (account_id in (select id from public.accounts where auth_user_id = auth.uid()));

create policy current_intents_select_own
  on public.current_intents for select to authenticated
  using (account_id in (select id from public.accounts where auth_user_id = auth.uid()));

create policy current_intents_insert_own
  on public.current_intents for insert to authenticated
  with check (account_id in (select id from public.accounts where auth_user_id = auth.uid()));

create policy current_intents_update_own
  on public.current_intents for update to authenticated
  using (account_id in (select id from public.accounts where auth_user_id = auth.uid()))
  with check (account_id in (select id from public.accounts where auth_user_id = auth.uid()));

create policy current_intents_delete_own
  on public.current_intents for delete to authenticated
  using (account_id in (select id from public.accounts where auth_user_id = auth.uid()));

grant select, insert, update, delete on public.availability_windows to authenticated;
grant select, insert, update, delete on public.current_intents to authenticated;
