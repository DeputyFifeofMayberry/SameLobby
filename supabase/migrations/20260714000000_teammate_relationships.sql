-- Slice 7a: teammate relationships and private notes (migration 018)

create type public.teammate_status as enum (
  'proposed',
  'teammate',
  'regular_teammate',
  'ended'
);

create table public.teammate_relationships (
  id uuid primary key default gen_random_uuid(),
  user_a_id uuid not null references public.accounts (id) on delete cascade,
  user_b_id uuid not null references public.accounts (id) on delete cascade,
  connection_id uuid not null references public.connections (id) on delete cascade,
  status public.teammate_status not null default 'proposed',
  proposed_by_account_id uuid references public.accounts (id) on delete set null,
  user_a_affirmed boolean not null default false,
  user_b_affirmed boolean not null default false,
  regular_teammate_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  status_changed_at timestamptz not null default now(),
  constraint teammate_relationships_ordered_pair check (user_a_id < user_b_id),
  unique (user_a_id, user_b_id)
);

create index teammate_relationships_user_a_idx
  on public.teammate_relationships (user_a_id, status);

create index teammate_relationships_user_b_idx
  on public.teammate_relationships (user_b_id, status);

create table public.teammate_notes (
  id uuid primary key default gen_random_uuid(),
  account_id uuid not null references public.accounts (id) on delete cascade,
  relationship_id uuid not null references public.teammate_relationships (id) on delete cascade,
  body text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint teammate_notes_body_length check (
    char_length(body) >= 1 and char_length(body) <= 500
  ),
  unique (account_id, relationship_id)
);

create trigger teammate_relationships_set_updated_at
  before update on public.teammate_relationships
  for each row execute function public.set_updated_at();

create trigger teammate_notes_set_updated_at
  before update on public.teammate_notes
  for each row execute function public.set_updated_at();

create or replace function public.has_completed_session_between(
  p_account_a uuid,
  p_account_b uuid
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
    where gs.status = 'completed'
      and (
        (gs.participant_a_id = least(p_account_a, p_account_b)
         and gs.participant_b_id = greatest(p_account_a, p_account_b))
      )
  );
$$;

create or replace function public.is_teammate_participant(
  p_relationship_id uuid,
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
    from public.teammate_relationships tr
    where tr.id = p_relationship_id
      and (tr.user_a_id = p_account_id or tr.user_b_id = p_account_id)
  );
$$;

create or replace function public.promote_teammate_if_mutual(
  p_relationship_id uuid
)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  v_rel public.teammate_relationships%rowtype;
  v_matched boolean;
begin
  select * into v_rel
  from public.teammate_relationships
  where id = p_relationship_id
  for update;

  if not found then
    return false;
  end if;

  v_matched := v_rel.user_a_affirmed and v_rel.user_b_affirmed;

  if v_matched and v_rel.status in ('proposed', 'ended') then
    update public.teammate_relationships
    set
      status = 'teammate',
      status_changed_at = now(),
      updated_at = now()
    where id = p_relationship_id;
    return true;
  end if;

  return v_rel.user_a_affirmed and v_rel.user_b_affirmed and v_rel.status = 'teammate';
end;
$$;

create or replace function public.record_teammate_intent(p_session_id uuid)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  v_account_id uuid;
  v_session public.gaming_sessions%rowtype;
  v_user_a uuid;
  v_user_b uuid;
  v_rel_id uuid;
  v_is_a boolean;
  v_matched boolean;
begin
  v_account_id := public.current_account_id();
  if v_account_id is null then
    raise exception 'not authenticated';
  end if;

  select * into v_session
  from public.gaming_sessions
  where id = p_session_id;

  if not found then
    raise exception 'session not found';
  end if;

  if v_session.status <> 'completed' then
    raise exception 'session not completed';
  end if;

  if v_account_id not in (v_session.participant_a_id, v_session.participant_b_id) then
    raise exception 'forbidden';
  end if;

  v_user_a := v_session.participant_a_id;
  v_user_b := v_session.participant_b_id;

  if public.accounts_blocked(v_user_a, v_user_b) then
    raise exception 'blocked';
  end if;

  if not public.has_completed_session_between(v_user_a, v_user_b) then
    raise exception 'no completed session';
  end if;

  v_is_a := v_account_id = v_user_a;

  insert into public.teammate_relationships (
    user_a_id,
    user_b_id,
    connection_id,
    status,
    user_a_affirmed,
    user_b_affirmed
  )
  select
    v_user_a,
    v_user_b,
    c.connection_id,
    'proposed',
    v_is_a,
    not v_is_a
  from public.conversations c
  where c.id = v_session.conversation_id
  on conflict (user_a_id, user_b_id) do update
    set
      user_a_affirmed = case when v_is_a then true else public.teammate_relationships.user_a_affirmed end,
      user_b_affirmed = case when not v_is_a then true else public.teammate_relationships.user_b_affirmed end,
      updated_at = now()
  returning id into v_rel_id;

  select public.promote_teammate_if_mutual(v_rel_id) into v_matched;

  return coalesce(v_matched, false);
end;
$$;

create or replace function public.propose_teammate(p_other_account_id uuid)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_account_id uuid;
  v_user_a uuid;
  v_user_b uuid;
  v_connection_id uuid;
  v_rel_id uuid;
  v_is_a boolean;
begin
  v_account_id := public.current_account_id();
  if v_account_id is null then
    raise exception 'not authenticated';
  end if;

  if p_other_account_id = v_account_id then
    raise exception 'invalid target';
  end if;

  v_user_a := least(v_account_id, p_other_account_id);
  v_user_b := greatest(v_account_id, p_other_account_id);

  if public.accounts_blocked(v_user_a, v_user_b) then
    raise exception 'blocked';
  end if;

  if not public.has_completed_session_between(v_user_a, v_user_b) then
    raise exception 'no completed session';
  end if;

  select c.id into v_connection_id
  from public.connections c
  where c.user_a_id = v_user_a
    and c.user_b_id = v_user_b
    and c.status = 'connected';

  if v_connection_id is null then
    raise exception 'not connected';
  end if;

  v_is_a := v_account_id = v_user_a;

  insert into public.teammate_relationships (
    user_a_id,
    user_b_id,
    connection_id,
    status,
    proposed_by_account_id,
    user_a_affirmed,
    user_b_affirmed
  )
  values (
    v_user_a,
    v_user_b,
    v_connection_id,
    'proposed',
    v_account_id,
    v_is_a,
    false
  )
  on conflict (user_a_id, user_b_id) do update
    set
      status = 'proposed',
      proposed_by_account_id = v_account_id,
      user_a_affirmed = case when v_is_a then true else public.teammate_relationships.user_a_affirmed end,
      user_b_affirmed = case when not v_is_a then true else public.teammate_relationships.user_b_affirmed end,
      status_changed_at = now(),
      updated_at = now()
  returning id into v_rel_id;

  perform public.promote_teammate_if_mutual(v_rel_id);

  return v_rel_id;
end;
$$;

create or replace function public.affirm_teammate_proposal(p_relationship_id uuid)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  v_account_id uuid;
  v_rel public.teammate_relationships%rowtype;
  v_is_a boolean;
  v_matched boolean;
begin
  v_account_id := public.current_account_id();
  if v_account_id is null then
    raise exception 'not authenticated';
  end if;

  select * into v_rel
  from public.teammate_relationships
  where id = p_relationship_id
  for update;

  if not found then
    raise exception 'not found';
  end if;

  if v_account_id not in (v_rel.user_a_id, v_rel.user_b_id) then
    raise exception 'forbidden';
  end if;

  if v_rel.status not in ('proposed', 'teammate') then
    raise exception 'not affirmable';
  end if;

  if public.accounts_blocked(v_rel.user_a_id, v_rel.user_b_id) then
    raise exception 'blocked';
  end if;

  v_is_a := v_account_id = v_rel.user_a_id;

  update public.teammate_relationships
  set
    user_a_affirmed = case when v_is_a then true else user_a_affirmed end,
    user_b_affirmed = case when not v_is_a then true else user_b_affirmed end,
    updated_at = now()
  where id = p_relationship_id;

  select public.promote_teammate_if_mutual(p_relationship_id) into v_matched;

  return v_matched;
end;
$$;

create or replace function public.end_teammate_relationship(p_relationship_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_account_id uuid;
begin
  v_account_id := public.current_account_id();
  if v_account_id is null then
    raise exception 'not authenticated';
  end if;

  update public.teammate_relationships
  set
    status = 'ended',
    user_a_affirmed = false,
    user_b_affirmed = false,
    regular_teammate_at = null,
    status_changed_at = now(),
    updated_at = now()
  where id = p_relationship_id
    and (user_a_id = v_account_id or user_b_id = v_account_id)
    and status in ('proposed', 'teammate', 'regular_teammate');
end;
$$;

create or replace function public.promote_regular_teammate(p_relationship_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_account_id uuid;
begin
  v_account_id := public.current_account_id();
  if v_account_id is null then
    raise exception 'not authenticated';
  end if;

  update public.teammate_relationships
  set
    status = 'regular_teammate',
    regular_teammate_at = now(),
    status_changed_at = now(),
    updated_at = now()
  where id = p_relationship_id
    and (user_a_id = v_account_id or user_b_id = v_account_id)
    and status = 'teammate';
end;
$$;

alter type public.notification_kind add value if not exists 'teammate_proposal';

alter table public.teammate_relationships enable row level security;
alter table public.teammate_notes enable row level security;

create policy teammate_relationships_select_participant
  on public.teammate_relationships for select to authenticated
  using (
    user_a_id = public.current_account_id()
    or user_b_id = public.current_account_id()
  );

create policy teammate_relationships_hide_blocked
  on public.teammate_relationships as restrictive for select to authenticated
  using (not public.accounts_blocked(user_a_id, user_b_id));

create policy teammate_relationships_update_participant
  on public.teammate_relationships for update to authenticated
  using (
    user_a_id = public.current_account_id()
    or user_b_id = public.current_account_id()
  )
  with check (
    user_a_id = public.current_account_id()
    or user_b_id = public.current_account_id()
  );

create policy teammate_notes_select_own
  on public.teammate_notes for select to authenticated
  using (account_id = public.current_account_id());

create policy teammate_notes_insert_own
  on public.teammate_notes for insert to authenticated
  with check (
    account_id = public.current_account_id()
    and public.is_teammate_participant(relationship_id, public.current_account_id())
  );

create policy teammate_notes_update_own
  on public.teammate_notes for update to authenticated
  using (account_id = public.current_account_id())
  with check (account_id = public.current_account_id());

insert into public.feature_flags (key, enabled)
values ('teammates_enabled', false)
on conflict (key) do nothing;

grant select, update on public.teammate_relationships to authenticated;
grant select, insert, update on public.teammate_notes to authenticated;
grant execute on function public.has_completed_session_between(uuid, uuid) to authenticated;
grant execute on function public.is_teammate_participant(uuid, uuid) to authenticated;
grant execute on function public.record_teammate_intent(uuid) to authenticated;
grant execute on function public.propose_teammate(uuid) to authenticated;
grant execute on function public.affirm_teammate_proposal(uuid) to authenticated;
grant execute on function public.end_teammate_relationship(uuid) to authenticated;
grant execute on function public.promote_regular_teammate(uuid) to authenticated;
