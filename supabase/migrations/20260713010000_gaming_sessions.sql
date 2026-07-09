-- Slice 6b: gaming sessions (migration 017 part 2)

create type public.gaming_session_status as enum (
  'confirmed',
  'in_progress',
  'completed',
  'cancelled',
  'disputed'
);

create table public.gaming_sessions (
  id uuid primary key default gen_random_uuid(),
  invitation_id uuid not null unique references public.play_invitations (id) on delete cascade,
  conversation_id uuid not null references public.conversations (id) on delete cascade,
  game_id uuid not null references public.games (id),
  platform_id uuid not null references public.platforms (id),
  status public.gaming_session_status not null default 'confirmed',
  confirmed_start_at timestamptz not null,
  session_length_minutes int not null,
  started_at timestamptz,
  completed_at timestamptz,
  participant_a_id uuid not null references public.accounts (id) on delete cascade,
  participant_b_id uuid not null references public.accounts (id) on delete cascade,
  occurred_a boolean,
  occurred_b boolean,
  reminder_24h_sent_at timestamptz,
  reminder_30m_sent_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint gaming_sessions_ordered_pair check (participant_a_id < participant_b_id)
);

create index gaming_sessions_participant_a_idx
  on public.gaming_sessions (participant_a_id, status, confirmed_start_at);

create index gaming_sessions_participant_b_idx
  on public.gaming_sessions (participant_b_id, status, confirmed_start_at);

create index gaming_sessions_upcoming_idx
  on public.gaming_sessions (confirmed_start_at)
  where status in ('confirmed', 'in_progress');

create trigger gaming_sessions_set_updated_at
  before update on public.gaming_sessions
  for each row execute function public.set_updated_at();

create or replace function public.is_session_participant(
  p_session_id uuid,
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
    from public.gaming_sessions gs
    where gs.id = p_session_id
      and (
        gs.participant_a_id = p_account_id
        or gs.participant_b_id = p_account_id
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
  v_session_id uuid;
  v_participant_a uuid;
  v_participant_b uuid;
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

  v_participant_a := least(v_inv.proposer_account_id, v_inv.recipient_account_id);
  v_participant_b := greatest(v_inv.proposer_account_id, v_inv.recipient_account_id);

  insert into public.gaming_sessions (
    invitation_id,
    conversation_id,
    game_id,
    platform_id,
    status,
    confirmed_start_at,
    session_length_minutes,
    participant_a_id,
    participant_b_id
  )
  values (
    p_invitation_id,
    v_inv.conversation_id,
    v_inv.game_id,
    v_inv.platform_id,
    'confirmed',
    v_start_at,
    v_inv.session_length_minutes,
    v_participant_a,
    v_participant_b
  )
  returning id into v_session_id;

  return v_session_id;
end;
$$;

alter table public.gaming_sessions enable row level security;

create policy gaming_sessions_select_participant
  on public.gaming_sessions for select to authenticated
  using (
    participant_a_id = public.current_account_id()
    or participant_b_id = public.current_account_id()
  );

create policy gaming_sessions_hide_blocked
  on public.gaming_sessions as restrictive for select to authenticated
  using (
    not public.accounts_blocked(participant_a_id, participant_b_id)
  );

create policy gaming_sessions_update_participant
  on public.gaming_sessions for update to authenticated
  using (
    participant_a_id = public.current_account_id()
    or participant_b_id = public.current_account_id()
  )
  with check (
    participant_a_id = public.current_account_id()
    or participant_b_id = public.current_account_id()
  );

grant select, update on public.gaming_sessions to authenticated;
grant execute on function public.is_session_participant(uuid, uuid) to authenticated;
