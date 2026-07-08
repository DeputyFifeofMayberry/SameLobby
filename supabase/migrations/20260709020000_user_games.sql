-- Slice 2: user game selections

create table public.user_games (
  id uuid primary key default gen_random_uuid(),
  account_id uuid not null references public.accounts (id) on delete cascade,
  game_id uuid not null references public.games (id) on delete restrict,
  platform_id uuid not null references public.platforms (id) on delete restrict,
  is_active boolean not null default true,
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (account_id, game_id, platform_id)
);

create index user_games_account_id_idx on public.user_games (account_id);
create index user_games_active_idx on public.user_games (account_id, is_active);

create trigger user_games_set_updated_at
  before update on public.user_games
  for each row
  execute function public.set_updated_at();

alter table public.user_games enable row level security;

create policy user_games_select_own
  on public.user_games
  for select
  to authenticated
  using (
    account_id in (
      select id from public.accounts where auth_user_id = auth.uid()
    )
  );

create policy user_games_insert_own
  on public.user_games
  for insert
  to authenticated
  with check (
    account_id in (
      select id from public.accounts where auth_user_id = auth.uid()
    )
  );

create policy user_games_update_own
  on public.user_games
  for update
  to authenticated
  using (
    account_id in (
      select id from public.accounts where auth_user_id = auth.uid()
    )
  )
  with check (
    account_id in (
      select id from public.accounts where auth_user_id = auth.uid()
    )
  );

create policy user_games_delete_own
  on public.user_games
  for delete
  to authenticated
  using (
    account_id in (
      select id from public.accounts where auth_user_id = auth.uid()
    )
  );

grant select, insert, update, delete on public.user_games to authenticated;
