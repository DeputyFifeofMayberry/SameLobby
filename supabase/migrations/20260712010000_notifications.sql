-- Slice 5: in-app and email notification preferences (migration 016)

create type public.notification_kind as enum (
  'new_message',
  'connection_request',
  'connection_accepted'
);

create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  account_id uuid not null references public.accounts (id) on delete cascade,
  kind public.notification_kind not null,
  title text not null,
  body text not null,
  href text,
  read_at timestamptz,
  created_at timestamptz not null default now()
);

create index notifications_account_unread_idx
  on public.notifications (account_id, created_at desc)
  where read_at is null;

create table public.notification_preferences (
  account_id uuid primary key references public.accounts (id) on delete cascade,
  email_new_message boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger notification_preferences_set_updated_at
  before update on public.notification_preferences
  for each row execute function public.set_updated_at();

alter table public.notifications enable row level security;
alter table public.notification_preferences enable row level security;

create policy notifications_select_own
  on public.notifications for select to authenticated
  using (account_id = public.current_account_id());

create policy notifications_update_own
  on public.notifications for update to authenticated
  using (account_id = public.current_account_id())
  with check (account_id = public.current_account_id());

create policy notification_preferences_select_own
  on public.notification_preferences for select to authenticated
  using (account_id = public.current_account_id());

create policy notification_preferences_upsert_own
  on public.notification_preferences for insert to authenticated
  with check (account_id = public.current_account_id());

create policy notification_preferences_update_own
  on public.notification_preferences for update to authenticated
  using (account_id = public.current_account_id())
  with check (account_id = public.current_account_id());

grant select, update on public.notifications to authenticated;
grant select, insert, update on public.notification_preferences to authenticated;
