-- Slice 4: block enforcement keys (survive account deletion)

alter table public.accounts
  add column if not exists enforcement_key uuid not null default gen_random_uuid();

create unique index if not exists accounts_enforcement_key_idx
  on public.accounts (enforcement_key);

create table public.block_enforcement_keys (
  blocker_key uuid not null,
  blocked_key uuid not null,
  created_at timestamptz not null default now(),
  primary key (blocker_key, blocked_key)
);

create or replace function public.sync_block_enforcement_key()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_blocker_key uuid;
  v_blocked_key uuid;
begin
  select enforcement_key into v_blocker_key
  from public.accounts where id = new.blocker_account_id;

  select enforcement_key into v_blocked_key
  from public.accounts where id = new.blocked_account_id;

  if v_blocker_key is not null and v_blocked_key is not null then
    insert into public.block_enforcement_keys (blocker_key, blocked_key)
    values (v_blocker_key, v_blocked_key)
    on conflict do nothing;
  end if;

  return new;
end;
$$;

create trigger blocks_sync_enforcement_key
  after insert on public.blocks
  for each row execute function public.sync_block_enforcement_key();

-- Blocked users cannot see incoming requests from people they blocked / who blocked them
create policy connection_requests_hide_blocked
  on public.connection_requests as restrictive for select to authenticated
  using (not public.accounts_blocked(sender_account_id, recipient_account_id));
