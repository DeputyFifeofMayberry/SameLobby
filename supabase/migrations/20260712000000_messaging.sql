-- Slice 5: one-to-one messaging (migration 015)

create type public.conversation_kind as enum ('direct');

create type public.conversation_permission as enum (
  'open',
  'archived',
  'restricted',
  'blocked',
  'closed'
);

create table public.conversations (
  id uuid primary key default gen_random_uuid(),
  connection_id uuid not null unique references public.connections (id) on delete cascade,
  kind public.conversation_kind not null default 'direct',
  permission public.conversation_permission not null default 'open',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.conversation_members (
  conversation_id uuid not null references public.conversations (id) on delete cascade,
  account_id uuid not null references public.accounts (id) on delete cascade,
  last_read_at timestamptz,
  joined_at timestamptz not null default now(),
  primary key (conversation_id, account_id)
);

create index conversation_members_account_idx
  on public.conversation_members (account_id, conversation_id);

create table public.messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.conversations (id) on delete cascade,
  sender_account_id uuid not null references public.accounts (id) on delete cascade,
  body text not null,
  retention_at timestamptz not null,
  created_at timestamptz not null default now(),
  constraint messages_body_length check (
    char_length(body) >= 1 and char_length(body) <= 2000
  )
);

create index messages_conversation_created_idx
  on public.messages (conversation_id, created_at desc);

create trigger conversations_set_updated_at
  before update on public.conversations
  for each row execute function public.set_updated_at();

create or replace function public.is_conversation_member(
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
      and cm.account_id = p_account_id
  );
$$;

create or replace function public.conversation_partner_account_id(
  p_conversation_id uuid,
  p_account_id uuid
)
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select cm.account_id
  from public.conversation_members cm
  where cm.conversation_id = p_conversation_id
    and cm.account_id <> p_account_id
  limit 1;
$$;

create or replace function public.create_conversation_for_connection(
  p_connection_id uuid
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_conn public.connections%rowtype;
  v_conversation_id uuid;
begin
  select * into v_conn
  from public.connections
  where id = p_connection_id;

  if not found then
    raise exception 'connection not found';
  end if;

  insert into public.conversations (connection_id, kind, permission)
  values (p_connection_id, 'direct', 'open')
  on conflict (connection_id) do update
    set updated_at = now()
  returning id into v_conversation_id;

  insert into public.conversation_members (conversation_id, account_id)
  values
    (v_conversation_id, v_conn.user_a_id),
    (v_conversation_id, v_conn.user_b_id)
  on conflict do nothing;

  return v_conversation_id;
end;
$$;

alter table public.conversations enable row level security;
alter table public.conversation_members enable row level security;
alter table public.messages enable row level security;

create policy conversations_select_member
  on public.conversations for select to authenticated
  using (
    public.is_conversation_member(id, public.current_account_id())
    and permission <> 'blocked'
  );

create policy conversations_update_member
  on public.conversations for update to authenticated
  using (public.is_conversation_member(id, public.current_account_id()))
  with check (public.is_conversation_member(id, public.current_account_id()));

create policy conversations_hide_blocked
  on public.conversations as restrictive for select to authenticated
  using (
    not public.accounts_blocked(
      public.current_account_id(),
      public.conversation_partner_account_id(id, public.current_account_id())
    )
  );

create policy conversation_members_select_own
  on public.conversation_members for select to authenticated
  using (account_id = public.current_account_id());

create policy conversation_members_update_own
  on public.conversation_members for update to authenticated
  using (account_id = public.current_account_id())
  with check (account_id = public.current_account_id());

create policy messages_select_member
  on public.messages for select to authenticated
  using (
    public.is_conversation_member(conversation_id, public.current_account_id())
    and not public.accounts_blocked(
      public.current_account_id(),
      public.conversation_partner_account_id(
        conversation_id,
        public.current_account_id()
      )
    )
  );

create policy messages_insert_member
  on public.messages for insert to authenticated
  with check (
    sender_account_id = public.current_account_id()
    and public.is_conversation_member(conversation_id, public.current_account_id())
    and not public.accounts_blocked(
      public.current_account_id(),
      public.conversation_partner_account_id(
        conversation_id,
        public.current_account_id()
      )
    )
    and exists (
      select 1
      from public.conversations c
      where c.id = conversation_id
        and c.permission = 'open'
    )
  );

grant select, update on public.conversations to authenticated;
grant select, update on public.conversation_members to authenticated;
grant select, insert on public.messages to authenticated;

grant execute on function public.is_conversation_member(uuid, uuid) to authenticated;
grant execute on function public.conversation_partner_account_id(uuid, uuid) to authenticated;
grant execute on function public.create_conversation_for_connection(uuid) to authenticated;

alter table public.messages replica identity full;

do $$
begin
  if exists (select 1 from pg_publication where pubname = 'supabase_realtime') then
    alter publication supabase_realtime add table public.messages;
  end if;
exception
  when duplicate_object then null;
end $$;
