-- Slice 7b: private groups (migration 019 part 1)

create type public.private_group_status as enum (
  'forming',
  'active',
  'closed'
);

create type public.group_member_role as enum (
  'owner',
  'admin',
  'member'
);

create type public.group_membership_status as enum (
  'pending_approval',
  'active',
  'left',
  'removed'
);

create type public.group_invitation_status as enum (
  'pending',
  'accepted',
  'declined',
  'expired',
  'cancelled'
);

create table public.private_groups (
  id uuid primary key default gen_random_uuid(),
  owner_account_id uuid not null references public.accounts (id) on delete cascade,
  name text not null,
  emblem_key text,
  size_goal int not null,
  status public.private_group_status not null default 'forming',
  shared_game_id uuid references public.games (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint private_groups_name_length check (
    char_length(name) >= 3 and char_length(name) <= 40
  ),
  constraint private_groups_size_goal check (size_goal >= 3 and size_goal <= 8)
);

create table public.group_memberships (
  group_id uuid not null references public.private_groups (id) on delete cascade,
  account_id uuid not null references public.accounts (id) on delete cascade,
  role public.group_member_role not null default 'member',
  status public.group_membership_status not null default 'active',
  joined_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (group_id, account_id)
);

create index group_memberships_account_idx
  on public.group_memberships (account_id, status);

create table public.group_invitations (
  id uuid primary key default gen_random_uuid(),
  group_id uuid not null references public.private_groups (id) on delete cascade,
  inviter_account_id uuid not null references public.accounts (id) on delete cascade,
  invitee_account_id uuid not null references public.accounts (id) on delete cascade,
  status public.group_invitation_status not null default 'pending',
  expires_at timestamptz not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint group_invitations_distinct_users check (
    inviter_account_id <> invitee_account_id
  )
);

create index group_invitations_invitee_pending_idx
  on public.group_invitations (invitee_account_id, status)
  where status = 'pending';

create table public.group_invitation_approvals (
  invitation_id uuid not null references public.group_invitations (id) on delete cascade,
  voter_account_id uuid not null references public.accounts (id) on delete cascade,
  approved boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (invitation_id, voter_account_id)
);

create trigger private_groups_set_updated_at
  before update on public.private_groups
  for each row execute function public.set_updated_at();

create trigger group_memberships_set_updated_at
  before update on public.group_memberships
  for each row execute function public.set_updated_at();

create trigger group_invitations_set_updated_at
  before update on public.group_invitations
  for each row execute function public.set_updated_at();

create or replace function public.is_group_member(
  p_group_id uuid,
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
    from public.group_memberships gm
    where gm.group_id = p_group_id
      and gm.account_id = p_account_id
      and gm.status = 'active'
  );
$$;

create or replace function public.active_group_member_count(p_group_id uuid)
returns int
language sql
stable
security definer
set search_path = public
as $$
  select count(*)::int
  from public.group_memberships
  where group_id = p_group_id
    and status = 'active';
$$;

create or replace function public.approval_threshold_met(
  p_invitation_id uuid
)
returns boolean
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  v_group_id uuid;
  v_active_count int;
  v_total_voters int;
  v_approve_count int;
begin
  select gi.group_id into v_group_id
  from public.group_invitations gi
  where gi.id = p_invitation_id;

  v_active_count := public.active_group_member_count(v_group_id);

  select count(*)::int, count(*) filter (where approved)::int
  into v_total_voters, v_approve_count
  from public.group_invitation_approvals
  where invitation_id = p_invitation_id;

  if v_active_count <= 4 then
    return v_total_voters > 0 and v_approve_count = v_total_voters;
  end if;

  return v_total_voters > 0 and v_approve_count > (v_total_voters / 2);
end;
$$;

create or replace function public.create_private_group(
  p_name text,
  p_size_goal int,
  p_emblem_key text default null,
  p_shared_game_id uuid default null
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_account_id uuid;
  v_group_id uuid;
begin
  v_account_id := public.current_account_id();
  if v_account_id is null then
    raise exception 'not authenticated';
  end if;

  if exists (
    select 1 from public.private_groups
    where owner_account_id = v_account_id
      and status = 'active'
  ) then
    raise exception 'free group limit reached';
  end if;

  insert into public.private_groups (
    owner_account_id,
    name,
    emblem_key,
    size_goal,
    shared_game_id,
    status
  )
  values (
    v_account_id,
    p_name,
    p_emblem_key,
    p_size_goal,
    p_shared_game_id,
    'forming'
  )
  returning id into v_group_id;

  insert into public.group_memberships (
    group_id,
    account_id,
    role,
    status,
    joined_at
  )
  values (
    v_group_id,
    v_account_id,
    'owner',
    'active',
    now()
  );

  return v_group_id;
end;
$$;

create or replace function public.invite_to_group(
  p_group_id uuid,
  p_invitee_account_id uuid
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_account_id uuid;
  v_invitation_id uuid;
  v_user_a uuid;
  v_user_b uuid;
begin
  v_account_id := public.current_account_id();
  if v_account_id is null then
    raise exception 'not authenticated';
  end if;

  if not public.is_group_member(p_group_id, v_account_id) then
    raise exception 'forbidden';
  end if;

  if p_invitee_account_id = v_account_id then
    raise exception 'invalid invitee';
  end if;

  v_user_a := least(v_account_id, p_invitee_account_id);
  v_user_b := greatest(v_account_id, p_invitee_account_id);

  if public.accounts_blocked(v_user_a, v_user_b) then
    raise exception 'blocked';
  end if;

  if not exists (
    select 1 from public.connections c
    where c.user_a_id = v_user_a
      and c.user_b_id = v_user_b
      and c.status = 'connected'
  ) then
    raise exception 'not connected';
  end if;

  insert into public.group_invitations (
    group_id,
    inviter_account_id,
    invitee_account_id,
    status,
    expires_at
  )
  values (
    p_group_id,
    v_account_id,
    p_invitee_account_id,
    'pending',
    now() + interval '14 days'
  )
  returning id into v_invitation_id;

  return v_invitation_id;
end;
$$;

create or replace function public.accept_group_invitation(p_invitation_id uuid)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  v_account_id uuid;
  v_inv public.group_invitations%rowtype;
  v_member public.group_memberships%rowtype;
begin
  v_account_id := public.current_account_id();
  if v_account_id is null then
    raise exception 'not authenticated';
  end if;

  select * into v_inv
  from public.group_invitations
  where id = p_invitation_id
  for update;

  if not found or v_inv.invitee_account_id <> v_account_id then
    raise exception 'forbidden';
  end if;

  if v_inv.status <> 'pending' or v_inv.expires_at < now() then
    raise exception 'invitation not pending';
  end if;

  insert into public.group_memberships (
    group_id,
    account_id,
    role,
    status
  )
  values (
    v_inv.group_id,
    v_account_id,
    'member',
    'pending_approval'
  )
  on conflict (group_id, account_id) do update
    set status = 'pending_approval', updated_at = now();

  insert into public.group_invitation_approvals (invitation_id, voter_account_id, approved)
  select p_invitation_id, gm.account_id, false
  from public.group_memberships gm
  where gm.group_id = v_inv.group_id
    and gm.status = 'active'
    and gm.account_id <> v_account_id
  on conflict do nothing;

  update public.group_invitations
  set status = 'accepted', updated_at = now()
  where id = p_invitation_id;

  if public.approval_threshold_met(p_invitation_id) then
    update public.group_memberships
    set status = 'active', joined_at = now(), updated_at = now()
    where group_id = v_inv.group_id
      and account_id = v_account_id;

    if public.active_group_member_count(v_inv.group_id) >= 3 then
      update public.private_groups
      set status = 'active', updated_at = now()
      where id = v_inv.group_id
        and status = 'forming';
    end if;

    return true;
  end if;

  return false;
end;
$$;

create or replace function public.vote_group_invitation(
  p_invitation_id uuid,
  p_approved boolean
)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  v_account_id uuid;
  v_inv public.group_invitations%rowtype;
  v_invitee_id uuid;
begin
  v_account_id := public.current_account_id();
  if v_account_id is null then
    raise exception 'not authenticated';
  end if;

  select * into v_inv
  from public.group_invitations
  where id = p_invitation_id;

  if not found then
    raise exception 'not found';
  end if;

  if not public.is_group_member(v_inv.group_id, v_account_id) then
    raise exception 'forbidden';
  end if;

  select gm.account_id into v_invitee_id
  from public.group_memberships gm
  where gm.group_id = v_inv.group_id
    and gm.status = 'pending_approval'
  limit 1;

  update public.group_invitation_approvals
  set approved = p_approved, updated_at = now()
  where invitation_id = p_invitation_id
    and voter_account_id = v_account_id;

  if not p_approved then
    if v_invitee_id is not null then
      update public.group_memberships
      set status = 'removed', updated_at = now()
      where group_id = v_inv.group_id
        and account_id = v_invitee_id
        and status = 'pending_approval';
    end if;
    return false;
  end if;

  if public.approval_threshold_met(p_invitation_id) and v_invitee_id is not null then
    update public.group_memberships
    set status = 'active', joined_at = now(), updated_at = now()
    where group_id = v_inv.group_id
      and account_id = v_invitee_id
      and status = 'pending_approval';

    if public.active_group_member_count(v_inv.group_id) >= 3 then
      update public.private_groups
      set status = 'active', updated_at = now()
      where id = v_inv.group_id
        and status = 'forming';
    end if;

    return true;
  end if;

  return false;
end;
$$;

create or replace function public.transfer_private_group_ownership(p_group_id uuid)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_owner_id uuid;
  v_new_owner_id uuid;
begin
  select owner_account_id into v_owner_id
  from public.private_groups
  where id = p_group_id;

  if v_owner_id is null then
    raise exception 'group not found';
  end if;

  select gm.account_id into v_new_owner_id
  from public.group_memberships gm
  where gm.group_id = p_group_id
    and gm.status = 'active'
    and gm.account_id <> v_owner_id
  order by
    case gm.role when 'admin' then 0 when 'member' then 1 else 2 end,
    gm.joined_at nulls last
  limit 1;

  if v_new_owner_id is null then
    update public.private_groups
    set status = 'closed', updated_at = now()
    where id = p_group_id;
    return null;
  end if;

  update public.private_groups
  set owner_account_id = v_new_owner_id, updated_at = now()
  where id = p_group_id;

  update public.group_memberships
  set role = 'owner', updated_at = now()
  where group_id = p_group_id
    and account_id = v_new_owner_id;

  update public.group_memberships
  set role = 'member', updated_at = now()
  where group_id = p_group_id
    and account_id = v_owner_id;

  return v_new_owner_id;
end;
$$;

alter table public.private_groups enable row level security;
alter table public.group_memberships enable row level security;
alter table public.group_invitations enable row level security;
alter table public.group_invitation_approvals enable row level security;

create policy private_groups_select_member
  on public.private_groups for select to authenticated
  using (public.is_group_member(id, public.current_account_id()));

create policy group_memberships_select_member
  on public.group_memberships for select to authenticated
  using (public.is_group_member(group_id, public.current_account_id()));

create policy group_invitations_select_participant
  on public.group_invitations for select to authenticated
  using (
    inviter_account_id = public.current_account_id()
    or invitee_account_id = public.current_account_id()
    or public.is_group_member(group_id, public.current_account_id())
  );

create policy group_invitation_approvals_select_voter
  on public.group_invitation_approvals for select to authenticated
  using (voter_account_id = public.current_account_id());

create policy group_invitation_approvals_update_voter
  on public.group_invitation_approvals for update to authenticated
  using (voter_account_id = public.current_account_id())
  with check (voter_account_id = public.current_account_id());

insert into public.feature_flags (key, enabled)
values ('private_groups_enabled', false)
on conflict (key) do nothing;

grant select on public.private_groups to authenticated;
grant select on public.group_memberships to authenticated;
grant select, update on public.group_invitations to authenticated;
grant select, update on public.group_invitation_approvals to authenticated;
grant execute on function public.is_group_member(uuid, uuid) to authenticated;
grant execute on function public.create_private_group(text, int, text, uuid) to authenticated;
grant execute on function public.invite_to_group(uuid, uuid) to authenticated;
grant execute on function public.accept_group_invitation(uuid) to authenticated;
grant execute on function public.vote_group_invitation(uuid, boolean) to authenticated;
grant execute on function public.transfer_private_group_ownership(uuid) to authenticated;
