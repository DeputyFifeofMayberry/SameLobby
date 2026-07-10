-- SL-T005:db @p0
begin;
select plan(7);

\set new_user 'f1111111-1111-1111-1111-111111111111'

select tests.as_postgres();

select is(
  (select count(*)::int from public.accounts where auth_user_id = :'new_user'::uuid),
  0,
  'no account row before auth user insert'
);

insert into auth.users (
  id,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at,
  instance_id,
  aud,
  role
)
values (
  :'new_user',
  'provision-new@test.local',
  crypt('TestPass123!', gen_salt('bf')),
  now(),
  now(),
  now(),
  '00000000-0000-0000-0000-000000000000',
  'authenticated',
  'authenticated'
);

select is(
  (select count(*)::int from public.accounts where auth_user_id = :'new_user'::uuid),
  1,
  'handle_new_user trigger provisions account row'
);

select is(
  (select status::text from public.accounts where auth_user_id = :'new_user'::uuid),
  'onboarding',
  'provisioned account starts in onboarding status'
);

select is(
  (select email from public.accounts where auth_user_id = :'new_user'::uuid),
  'provision-new@test.local',
  'provisioned account copies auth email'
);

select is(
  (
    select count(*)::int
    from public.gamer_profiles gp
    join public.accounts a on a.id = gp.account_id
    where a.auth_user_id = :'new_user'::uuid
  ),
  1,
  'handle_new_account_profile provisions gamer_profiles row'
);

select is(
  (
    select count(*)::int
    from public.disclosure_settings ds
    join public.accounts a on a.id = ds.account_id
    where a.auth_user_id = :'new_user'::uuid
  ),
  3,
  'handle_new_account_profile seeds default disclosure settings'
);

select is(
  (
    select tier::text
    from public.entitlements e
    join public.accounts a on a.id = e.account_id
    where a.auth_user_id = :'new_user'::uuid
  ),
  'free',
  'accounts_seed_entitlements provisions free tier entitlements'
);

select * from finish();
rollback;
