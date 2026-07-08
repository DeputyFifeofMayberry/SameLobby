-- Slice 4: connection requests and mutual connections

create type public.connection_request_status as enum (
  'pending',
  'accepted',
  'declined',
  'expired',
  'cancelled'
);

create type public.connection_status as enum (
  'connected',
  'archived',
  'ended'
);

create table public.connection_requests (
  id uuid primary key default gen_random_uuid(),
  sender_account_id uuid not null references public.accounts (id) on delete cascade,
  recipient_account_id uuid not null references public.accounts (id) on delete cascade,
  intent_id uuid references public.current_intents (id) on delete set null,
  message text,
  status public.connection_request_status not null default 'pending',
  expires_at timestamptz not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  responded_at timestamptz,
  constraint connection_requests_distinct_users check (
    sender_account_id <> recipient_account_id
  ),
  constraint connection_requests_message_length check (
    char_length(coalesce(message, '')) <= 300
  )
);

create unique index connection_requests_active_pair_idx
  on public.connection_requests (
    least(sender_account_id, recipient_account_id),
    greatest(sender_account_id, recipient_account_id),
    coalesce(intent_id, '00000000-0000-0000-0000-000000000000'::uuid)
  )
  where status = 'pending';

create index connection_requests_recipient_pending_idx
  on public.connection_requests (recipient_account_id, status, expires_at)
  where status = 'pending';

create index connection_requests_sender_idx
  on public.connection_requests (sender_account_id, status, created_at desc);

create table public.connections (
  id uuid primary key default gen_random_uuid(),
  user_a_id uuid not null references public.accounts (id) on delete cascade,
  user_b_id uuid not null references public.accounts (id) on delete cascade,
  connection_request_id uuid references public.connection_requests (id) on delete set null,
  status public.connection_status not null default 'connected',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint connections_ordered_pair check (user_a_id < user_b_id),
  unique (user_a_id, user_b_id)
);

create index connections_user_a_idx on public.connections (user_a_id, status);
create index connections_user_b_idx on public.connections (user_b_id, status);

create trigger connection_requests_set_updated_at
  before update on public.connection_requests
  for each row execute function public.set_updated_at();

create trigger connections_set_updated_at
  before update on public.connections
  for each row execute function public.set_updated_at();

create or replace function public.accounts_blocked(a_id uuid, b_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.blocks
    where (blocker_account_id = a_id and blocked_account_id = b_id)
       or (blocker_account_id = b_id and blocked_account_id = a_id)
  );
$$;

create or replace function public.current_account_id()
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select id from public.accounts where auth_user_id = auth.uid() limit 1;
$$;

create or replace function public.accept_connection_request(p_request_id uuid)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_account_id uuid;
  v_req public.connection_requests%rowtype;
  v_connection_id uuid;
begin
  v_account_id := public.current_account_id();
  if v_account_id is null then
    raise exception 'not authenticated';
  end if;

  select * into v_req
  from public.connection_requests
  where id = p_request_id
  for update;

  if not found then
    raise exception 'request not found';
  end if;

  if v_req.recipient_account_id <> v_account_id then
    raise exception 'forbidden';
  end if;

  if v_req.status <> 'pending' then
    raise exception 'request not pending';
  end if;

  if v_req.expires_at < now() then
    update public.connection_requests
    set status = 'expired', updated_at = now()
    where id = p_request_id;
    raise exception 'request expired';
  end if;

  if public.accounts_blocked(v_req.sender_account_id, v_req.recipient_account_id) then
    raise exception 'blocked';
  end if;

  update public.connection_requests
  set
    status = 'accepted',
    responded_at = now(),
    updated_at = now()
  where id = p_request_id;

  insert into public.connections (user_a_id, user_b_id, connection_request_id)
  values (
    least(v_req.sender_account_id, v_req.recipient_account_id),
    greatest(v_req.sender_account_id, v_req.recipient_account_id),
    p_request_id
  )
  on conflict (user_a_id, user_b_id) do update
    set status = 'connected', updated_at = now()
  returning id into v_connection_id;

  return v_connection_id;
end;
$$;

alter table public.connection_requests enable row level security;
alter table public.connections enable row level security;

create policy connection_requests_select_participant
  on public.connection_requests for select to authenticated
  using (
    sender_account_id = public.current_account_id()
    or recipient_account_id = public.current_account_id()
  );

create policy connection_requests_insert_sender
  on public.connection_requests for insert to authenticated
  with check (
    sender_account_id = public.current_account_id()
    and not public.accounts_blocked(sender_account_id, recipient_account_id)
    and status = 'pending'
    and expires_at > now()
  );

create policy connection_requests_update_participant
  on public.connection_requests for update to authenticated
  using (
    sender_account_id = public.current_account_id()
    or recipient_account_id = public.current_account_id()
  )
  with check (
    sender_account_id = public.current_account_id()
    or recipient_account_id = public.current_account_id()
  );

create policy connections_select_participant
  on public.connections for select to authenticated
  using (
    user_a_id = public.current_account_id()
    or user_b_id = public.current_account_id()
  );

grant select, insert, update on public.connection_requests to authenticated;
grant select on public.connections to authenticated;
grant execute on function public.accept_connection_request(uuid) to authenticated;
grant execute on function public.accounts_blocked(uuid, uuid) to authenticated;
grant execute on function public.current_account_id() to authenticated;
