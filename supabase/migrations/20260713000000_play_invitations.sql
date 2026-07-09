-- Slice 6a: play invitations and time options (migration 017 part 1)

create type public.play_invitation_status as enum (
  'proposed',
  'accepted',
  'declined',
  'expired',
  'cancelled',
  'countered'
);

create type public.play_scheduling_mode as enum (
  'play_now',
  'scheduled'
);

create table public.play_invitations (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.conversations (id) on delete cascade,
  proposer_account_id uuid not null references public.accounts (id) on delete cascade,
  recipient_account_id uuid not null references public.accounts (id) on delete cascade,
  game_id uuid not null references public.games (id),
  platform_id uuid not null references public.platforms (id),
  status public.play_invitation_status not null default 'proposed',
  scheduling_mode public.play_scheduling_mode not null,
  session_length_minutes int not null,
  voice_preferred boolean not null default false,
  note text,
  expires_at timestamptz not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  responded_at timestamptz,
  constraint play_invitations_distinct_users check (
    proposer_account_id <> recipient_account_id
  ),
  constraint play_invitations_note_length check (
    char_length(coalesce(note, '')) <= 300
  ),
  constraint play_invitations_session_length check (
    session_length_minutes in (60, 90, 120)
  )
);

create index play_invitations_recipient_proposed_idx
  on public.play_invitations (recipient_account_id, status, expires_at)
  where status = 'proposed';

create index play_invitations_proposer_idx
  on public.play_invitations (proposer_account_id, status, created_at desc);

create index play_invitations_conversation_idx
  on public.play_invitations (conversation_id, created_at desc);

create table public.play_time_options (
  id uuid primary key default gen_random_uuid(),
  invitation_id uuid not null references public.play_invitations (id) on delete cascade,
  proposed_start_at timestamptz not null,
  sort_order int not null,
  constraint play_time_options_sort_order check (sort_order >= 0 and sort_order <= 2),
  unique (invitation_id, sort_order)
);

create trigger play_invitations_set_updated_at
  before update on public.play_invitations
  for each row execute function public.set_updated_at();

create or replace function public.is_play_participant(
  p_invitation_id uuid,
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
    from public.play_invitations pi
    where pi.id = p_invitation_id
      and (
        pi.proposer_account_id = p_account_id
        or pi.recipient_account_id = p_account_id
      )
  );
$$;

create or replace function public.accept_play_invitation(
  p_invitation_id uuid,
  p_time_option_id uuid default null
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_account_id uuid;
  v_inv public.play_invitations%rowtype;
  v_start_at timestamptz;
begin
  v_account_id := public.current_account_id();
  if v_account_id is null then
    raise exception 'not authenticated';
  end if;

  select * into v_inv
  from public.play_invitations
  where id = p_invitation_id
  for update;

  if not found then
    raise exception 'invitation not found';
  end if;

  if v_inv.recipient_account_id <> v_account_id then
    raise exception 'forbidden';
  end if;

  if v_inv.status <> 'proposed' then
    raise exception 'invitation not proposed';
  end if;

  if v_inv.expires_at < now() then
    update public.play_invitations
    set status = 'expired', updated_at = now()
    where id = p_invitation_id;
    raise exception 'invitation expired';
  end if;

  if public.accounts_blocked(v_inv.proposer_account_id, v_inv.recipient_account_id) then
    raise exception 'blocked';
  end if;

  if v_inv.scheduling_mode = 'play_now' then
    v_start_at := now();
  else
    if p_time_option_id is null then
      raise exception 'time option required';
    end if;
    select proposed_start_at into v_start_at
    from public.play_time_options
    where id = p_time_option_id
      and invitation_id = p_invitation_id;
    if not found then
      raise exception 'invalid time option';
    end if;
  end if;

  update public.play_invitations
  set
    status = 'accepted',
    responded_at = now(),
    updated_at = now()
  where id = p_invitation_id;

  return p_invitation_id;
end;
$$;

alter table public.play_invitations enable row level security;
alter table public.play_time_options enable row level security;

create policy play_invitations_select_participant
  on public.play_invitations for select to authenticated
  using (
    proposer_account_id = public.current_account_id()
    or recipient_account_id = public.current_account_id()
  );

create policy play_invitations_hide_blocked
  on public.play_invitations as restrictive for select to authenticated
  using (
    not public.accounts_blocked(
      proposer_account_id,
      recipient_account_id
    )
  );

create policy play_invitations_insert_proposer
  on public.play_invitations for insert to authenticated
  with check (
    proposer_account_id = public.current_account_id()
    and public.is_conversation_member(conversation_id, public.current_account_id())
    and not public.accounts_blocked(proposer_account_id, recipient_account_id)
    and status = 'proposed'
    and expires_at > now()
    and exists (
      select 1
      from public.conversations c
      join public.connections conn on conn.id = c.connection_id
      where c.id = conversation_id
        and conn.status = 'connected'
        and c.permission = 'open'
    )
  );

create policy play_invitations_update_participant
  on public.play_invitations for update to authenticated
  using (
    proposer_account_id = public.current_account_id()
    or recipient_account_id = public.current_account_id()
  )
  with check (
    proposer_account_id = public.current_account_id()
    or recipient_account_id = public.current_account_id()
  );

create policy play_time_options_select_participant
  on public.play_time_options for select to authenticated
  using (
    public.is_play_participant(invitation_id, public.current_account_id())
  );

create policy play_time_options_insert_proposer
  on public.play_time_options for insert to authenticated
  with check (
    exists (
      select 1
      from public.play_invitations pi
      where pi.id = invitation_id
        and pi.proposer_account_id = public.current_account_id()
        and pi.status = 'proposed'
    )
  );

insert into public.feature_flags (key, enabled)
values ('play_invitations_enabled', false)
on conflict (key) do nothing;

grant select, insert, update on public.play_invitations to authenticated;
grant select, insert on public.play_time_options to authenticated;
grant execute on function public.is_play_participant(uuid, uuid) to authenticated;
grant execute on function public.accept_play_invitation(uuid, uuid) to authenticated;
