-- Slice 9: billing schema, entitlements, saved searches (migration 024)

create type public.subscription_tier as enum ('free', 'plus');

create type public.subscription_status as enum (
  'none',
  'active',
  'past_due',
  'cancel_at_period_end',
  'canceled'
);

create table public.plans (
  key text primary key,
  display_name text not null,
  stripe_price_id text,
  created_at timestamptz not null default now()
);

insert into public.plans (key, display_name, stripe_price_id)
values
  ('free', 'SameLobby Free', null),
  ('plus_monthly', 'SameLobby Plus (Monthly)', null),
  ('plus_annual', 'SameLobby Plus (Annual)', null)
on conflict (key) do nothing;

create table public.subscriptions (
  account_id uuid primary key references public.accounts (id) on delete cascade,
  stripe_customer_id text,
  stripe_subscription_id text unique,
  status public.subscription_status not null default 'none',
  plan_key text references public.plans (key) on delete set null,
  current_period_end timestamptz,
  cancel_at_period_end boolean not null default false,
  past_due_since timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index subscriptions_stripe_customer_idx on public.subscriptions (stripe_customer_id);
create index subscriptions_status_idx on public.subscriptions (status);

create trigger subscriptions_set_updated_at
  before update on public.subscriptions
  for each row execute function public.set_updated_at();

create table public.entitlements (
  account_id uuid primary key references public.accounts (id) on delete cascade,
  tier public.subscription_tier not null default 'free',
  max_active_games int not null default 8,
  max_active_groups_owned int not null default 1,
  max_saved_searches int not null default 0,
  read_only boolean not null default false,
  updated_at timestamptz not null default now()
);

create trigger entitlements_set_updated_at
  before update on public.entitlements
  for each row execute function public.set_updated_at();

create table public.stripe_webhook_events (
  id uuid primary key default gen_random_uuid(),
  stripe_event_id text not null unique,
  event_type text not null,
  processed_at timestamptz not null default now(),
  metadata jsonb not null default '{}'
);

create table public.saved_searches (
  id uuid primary key default gen_random_uuid(),
  account_id uuid not null references public.accounts (id) on delete cascade,
  name text not null,
  filters jsonb not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint saved_searches_name_length check (
    char_length(name) >= 1 and char_length(name) <= 80
  ),
  unique (account_id, name)
);

create index saved_searches_account_idx on public.saved_searches (account_id, created_at desc);

create trigger saved_searches_set_updated_at
  before update on public.saved_searches
  for each row execute function public.set_updated_at();

create or replace function public.recompute_entitlements(p_account_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_sub public.subscriptions%rowtype;
  v_tier public.subscription_tier := 'free';
  v_max_games int := 8;
  v_max_groups int := 1;
  v_max_saved int := 0;
  v_read_only boolean := false;
  v_plus boolean := false;
begin
  select * into v_sub
  from public.subscriptions
  where account_id = p_account_id;

  if found then
    if v_sub.status in ('active', 'cancel_at_period_end') then
      v_plus := true;
    elsif v_sub.status = 'past_due' then
      if v_sub.past_due_since is null
        or v_sub.past_due_since > now() - interval '7 days' then
        v_plus := true;
      else
        v_read_only := true;
      end if;
    elsif v_sub.status = 'canceled' then
      v_read_only := true;
    end if;
  end if;

  if v_plus then
    v_tier := 'plus';
    v_max_games := 25;
    v_max_groups := 10;
    v_max_saved := 10;
    v_read_only := false;
  end if;

  insert into public.entitlements (
    account_id,
    tier,
    max_active_games,
    max_active_groups_owned,
    max_saved_searches,
    read_only
  )
  values (
    p_account_id,
    v_tier,
    v_max_games,
    v_max_groups,
    v_max_saved,
    v_read_only
  )
  on conflict (account_id) do update
  set
    tier = excluded.tier,
    max_active_games = excluded.max_active_games,
    max_active_groups_owned = excluded.max_active_groups_owned,
    max_saved_searches = excluded.max_saved_searches,
    read_only = excluded.read_only,
    updated_at = now();
end;
$$;

create or replace function public.seed_entitlements_for_account()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  perform public.recompute_entitlements(new.id);
  return new;
end;
$$;

create trigger accounts_seed_entitlements
  after insert on public.accounts
  for each row execute function public.seed_entitlements_for_account();

do $$
declare
  v_account_id uuid;
begin
  for v_account_id in select id from public.accounts loop
    perform public.recompute_entitlements(v_account_id);
  end loop;
end;
$$;

create or replace function public.upsert_saved_search(
  p_name text,
  p_filters jsonb
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_account_id uuid := public.current_account_id();
  v_max int;
  v_count int;
  v_id uuid;
begin
  if v_account_id is null then
    raise exception 'not authenticated';
  end if;

  select max_saved_searches into v_max
  from public.entitlements
  where account_id = v_account_id;

  if v_max is null or v_max = 0 then
    raise exception 'saved searches require plus';
  end if;

  select count(*)::int into v_count
  from public.saved_searches
  where account_id = v_account_id;

  if not exists (
    select 1 from public.saved_searches
    where account_id = v_account_id and name = p_name
  ) and v_count >= v_max then
    raise exception 'saved search limit reached';
  end if;

  insert into public.saved_searches (account_id, name, filters)
  values (v_account_id, p_name, coalesce(p_filters, '{}'::jsonb))
  on conflict (account_id, name) do update
  set filters = excluded.filters, updated_at = now()
  returning id into v_id;

  return v_id;
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
  v_max_groups int;
  v_owned int;
begin
  v_account_id := public.current_account_id();
  if v_account_id is null then
    raise exception 'not authenticated';
  end if;

  select max_active_groups_owned into v_max_groups
  from public.entitlements
  where account_id = v_account_id;

  if v_max_groups is null then
    v_max_groups := 1;
  end if;

  select count(*)::int into v_owned
  from public.private_groups
  where owner_account_id = v_account_id
    and status in ('forming', 'active');

  if v_owned >= v_max_groups then
    raise exception 'group limit reached';
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

alter table public.plans enable row level security;
alter table public.subscriptions enable row level security;
alter table public.entitlements enable row level security;
alter table public.stripe_webhook_events enable row level security;
alter table public.saved_searches enable row level security;

create policy plans_select_all
  on public.plans for select to authenticated
  using (true);

create policy subscriptions_select_own
  on public.subscriptions for select to authenticated
  using (account_id = public.current_account_id());

create policy subscriptions_admin_select
  on public.subscriptions for select to authenticated
  using (public.admin_has_scope('billing'));

create policy entitlements_select_own
  on public.entitlements for select to authenticated
  using (account_id = public.current_account_id());

create policy entitlements_admin_select
  on public.entitlements for select to authenticated
  using (public.admin_has_scope('billing'));

create policy saved_searches_select_own
  on public.saved_searches for select to authenticated
  using (account_id = public.current_account_id());

create policy saved_searches_insert_own
  on public.saved_searches for insert to authenticated
  with check (account_id = public.current_account_id());

create policy saved_searches_update_own
  on public.saved_searches for update to authenticated
  using (account_id = public.current_account_id())
  with check (account_id = public.current_account_id());

create policy saved_searches_delete_own
  on public.saved_searches for delete to authenticated
  using (account_id = public.current_account_id());

grant select on public.plans to authenticated;
grant select on public.subscriptions to authenticated;
grant select on public.entitlements to authenticated;
grant select, insert, update, delete on public.saved_searches to authenticated;

grant execute on function public.recompute_entitlements(uuid) to service_role;
grant execute on function public.upsert_saved_search(text, jsonb) to authenticated;
