-- Slice 10: registration numeric cap via feature_flags metadata

alter table public.feature_flags
  add column if not exists metadata jsonb not null default '{}';

insert into public.feature_flags (key, enabled, metadata)
values ('registration_cap', true, '{"max_accounts": 10000}'::jsonb)
on conflict (key) do nothing;

create or replace function public.registration_cap_max()
returns int
language sql
stable
security definer
set search_path = public
as $$
  select coalesce((metadata->>'max_accounts')::int, 10000)
  from public.feature_flags
  where key = 'registration_cap'
    and enabled = true
  limit 1;
$$;

create or replace function public.registration_cap_utilization()
returns jsonb
language sql
stable
security definer
set search_path = public
as $$
  select jsonb_build_object(
    'max_accounts', public.registration_cap_max(),
    'current_count', (
      select count(*)::int
      from public.accounts
      where status not in ('deleted')
    )
  );
$$;

create or replace function public.registration_cap_reached()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select (
    select count(*)::int
    from public.accounts
    where status not in ('deleted')
  ) >= public.registration_cap_max();
$$;

-- The auth hook provides a friendly early rejection, while this trigger path
-- serializes account provisioning so concurrent sign-ups cannot exceed the cap.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  lock table public.accounts in share row exclusive mode;

  if public.registration_cap_reached() then
    raise exception 'registration cap reached';
  end if;

  insert into public.accounts (auth_user_id, email, status)
  values (new.id, coalesce(new.email, ''), 'onboarding');
  return new;
end;
$$;

create or replace function public.hook_before_user_created(event jsonb)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
begin
  if not exists (
    select 1
    from public.feature_flags
    where key = 'registration_open'
      and enabled = true
  ) then
    return jsonb_build_object(
      'error', jsonb_build_object(
        'http_code', 403,
        'message', 'Registration is temporarily paused.'
      )
    );
  end if;

  if public.registration_cap_reached() then
    return jsonb_build_object(
      'error', jsonb_build_object(
        'http_code', 403,
        'message', 'Registration is full. Try again later.'
      )
    );
  end if;

  return '{}'::jsonb;
end;
$$;

revoke all on function public.registration_cap_max() from public;
revoke all on function public.registration_cap_utilization() from public;
revoke all on function public.registration_cap_reached() from public;
revoke all on function public.hook_before_user_created(jsonb) from public;

grant execute on function public.hook_before_user_created(jsonb) to supabase_auth_admin;
grant execute on function public.registration_cap_max() to service_role;
grant execute on function public.registration_cap_utilization() to service_role;
grant execute on function public.registration_cap_reached() to service_role;
