-- Slice 7c part 2: group messaging schema, RLS, and open seats

alter table public.conversations
  alter column connection_id drop not null;

alter table public.conversations
  add column if not exists group_id uuid references public.private_groups (id) on delete cascade;

alter table public.conversations
  drop constraint if exists conversations_connection_id_key;

create unique index if not exists conversations_connection_id_direct_idx
  on public.conversations (connection_id)
  where kind = 'direct' and connection_id is not null;

create unique index if not exists conversations_group_id_idx
  on public.conversations (group_id)
  where kind = 'group' and group_id is not null;

alter table public.conversations
  drop constraint if exists conversations_kind_target_check;

alter table public.conversations
  add constraint conversations_kind_target_check check (
    (kind = 'direct' and connection_id is not null and group_id is null)
    or (kind = 'group' and group_id is not null and connection_id is null)
  );

create or replace function public.is_blocked_with_any_conversation_member(
  p_conversation_id uuid,
  p_account_id uuid
)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.conversation_members cm
    where cm.conversation_id = p_conversation_id
      and cm.account_id <> p_account_id
      and public.accounts_blocked(p_account_id, cm.account_id)
  );
$$;

create or replace function public.create_conversation_for_group(
  p_group_id uuid
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_group public.private_groups%rowtype;
  v_conversation_id uuid;
begin
  select * into v_group
  from public.private_groups
  where id = p_group_id;

  if not found or v_group.status <> 'active' then
    raise exception 'group not active';
  end if;

  insert into public.conversations (kind, permission, group_id)
  values ('group'::public.conversation_kind, 'open', p_group_id)
  on conflict (group_id) where (kind = 'group')
  do update set updated_at = now()
  returning id into v_conversation_id;

  if v_conversation_id is null then
    select id into v_conversation_id
    from public.conversations
    where group_id = p_group_id
      and kind = 'group'
    limit 1;
  end if;

  insert into public.conversation_members (conversation_id, account_id)
  select v_conversation_id, gm.account_id
  from public.group_memberships gm
  where gm.group_id = p_group_id
    and gm.status = 'active'
  on conflict do nothing;

  return v_conversation_id;
end;
$$;

drop policy if exists conversations_hide_blocked on public.conversations;

create policy conversations_hide_blocked_direct
  on public.conversations as restrictive for select to authenticated
  using (
    kind <> 'direct'
    or not public.accounts_blocked(
      public.current_account_id(),
      public.conversation_partner_account_id(id, public.current_account_id())
    )
  );

create policy conversations_hide_blocked_group
  on public.conversations as restrictive for select to authenticated
  using (
    kind <> 'group'
    or not public.is_blocked_with_any_conversation_member(id, public.current_account_id())
  );

drop policy if exists messages_select_member on public.messages;
drop policy if exists messages_insert_member on public.messages;

create policy messages_select_member
  on public.messages for select to authenticated
  using (
    public.is_conversation_member(conversation_id, public.current_account_id())
    and not public.is_blocked_with_any_conversation_member(
      conversation_id,
      public.current_account_id()
    )
  );

create policy messages_insert_member
  on public.messages for insert to authenticated
  with check (
    sender_account_id = public.current_account_id()
    and public.is_conversation_member(conversation_id, public.current_account_id())
    and not public.is_blocked_with_any_conversation_member(
      conversation_id,
      public.current_account_id()
    )
    and exists (
      select 1
      from public.conversations c
      where c.id = conversation_id
        and c.permission = 'open'
    )
  );

create type public.open_seat_kind as enum (
  'temporary',
  'permanent'
);

create type public.open_seat_status as enum (
  'open',
  'filled',
  'cancelled'
);

create table public.group_open_seats (
  id uuid primary key default gen_random_uuid(),
  group_id uuid not null references public.private_groups (id) on delete cascade,
  created_by_account_id uuid not null references public.accounts (id) on delete cascade,
  unavailable_account_id uuid not null references public.accounts (id) on delete cascade,
  kind public.open_seat_kind not null,
  game_id uuid references public.games (id) on delete set null,
  role_note text,
  status public.open_seat_status not null default 'open',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint group_open_seats_role_note_length check (
    char_length(coalesce(role_note, '')) <= 200
  )
);

create trigger group_open_seats_set_updated_at
  before update on public.group_open_seats
  for each row execute function public.set_updated_at();

alter table public.group_open_seats enable row level security;

create policy group_open_seats_select_member
  on public.group_open_seats for select to authenticated
  using (public.is_group_member(group_id, public.current_account_id()));

create policy group_open_seats_insert_member
  on public.group_open_seats for insert to authenticated
  with check (
    created_by_account_id = public.current_account_id()
    and public.is_group_member(group_id, public.current_account_id())
  );

create policy group_open_seats_update_member
  on public.group_open_seats for update to authenticated
  using (public.is_group_member(group_id, public.current_account_id()))
  with check (public.is_group_member(group_id, public.current_account_id()));

grant execute on function public.is_blocked_with_any_conversation_member(uuid, uuid) to authenticated;
grant execute on function public.create_conversation_for_group(uuid) to authenticated;
grant select, insert, update on public.group_open_seats to authenticated;
