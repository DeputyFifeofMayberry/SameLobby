-- Slice 3 dependency: blocks for discovery exclusion (full Slice 4 expands later)

create table public.blocks (
  id uuid primary key default gen_random_uuid(),
  blocker_account_id uuid not null references public.accounts (id) on delete cascade,
  blocked_account_id uuid not null references public.accounts (id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (blocker_account_id, blocked_account_id),
  check (blocker_account_id <> blocked_account_id)
);

create index blocks_blocker_idx on public.blocks (blocker_account_id);
create index blocks_blocked_idx on public.blocks (blocked_account_id);

alter table public.blocks enable row level security;

create policy blocks_select_own
  on public.blocks for select to authenticated
  using (
    blocker_account_id in (select id from public.accounts where auth_user_id = auth.uid())
  );

create policy blocks_insert_own
  on public.blocks for insert to authenticated
  with check (
    blocker_account_id in (select id from public.accounts where auth_user_id = auth.uid())
  );

create policy blocks_delete_own
  on public.blocks for delete to authenticated
  using (
    blocker_account_id in (select id from public.accounts where auth_user_id = auth.uid())
  );

grant select, insert, delete on public.blocks to authenticated;
