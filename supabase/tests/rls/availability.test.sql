begin;
-- SL-T021:db @p1
select plan(5);

\set user_a 'f1111111-1111-1111-1111-111111111111'
\set user_b 'f1222222-2222-2222-2222-222222222222'

select tests.as_postgres();

insert into auth.users (id, email, encrypted_password, email_confirmed_at, created_at, updated_at, instance_id, aud, role)
values
  (:'user_a', 'avail-a@test.local', crypt('test', gen_salt('bf')), now(), now(), now(), '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated'),
  (:'user_b', 'avail-b@test.local', crypt('test', gen_salt('bf')), now(), now(), now(), '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated')
on conflict (id) do nothing;

insert into auth.identities (id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at)
values
  (:'user_a', :'user_a', jsonb_build_object('sub', :'user_a', 'email', 'avail-a@test.local'), 'email', :'user_a', now(), now(), now()),
  (:'user_b', :'user_b', jsonb_build_object('sub', :'user_b', 'email', 'avail-b@test.local'), 'email', :'user_b', now(), now(), now())
on conflict (id) do nothing;

update public.accounts
set status = 'active', adult_attested_at = now()
where auth_user_id in (:'user_a'::uuid, :'user_b'::uuid);

select tests.set_auth(:'user_a'::uuid);

select lives_ok(
  $$
  insert into public.availability_windows (account_id, day_of_week, start_time, end_time)
  select id, 1, '18:00'::time, '22:00'::time
  from public.accounts
  where auth_user_id = 'f1111111-1111-1111-1111-111111111111'::uuid
  $$,
  'owner can insert availability window'
);

select is(
  (
    select count(*)::int
    from public.availability_windows aw
    join public.accounts a on a.id = aw.account_id
    where a.auth_user_id = :'user_a'::uuid
  ),
  1,
  'owner can read own availability windows'
);

select tests.set_auth(:'user_b'::uuid);

select is(
  (
    select count(*)::int
    from public.availability_windows aw
    join public.accounts a on a.id = aw.account_id
    where a.auth_user_id = :'user_a'::uuid
  ),
  0,
  'outsider cannot read other availability windows'
);

select tests.set_auth(:'user_a'::uuid);

select lives_ok(
  $$
  update public.availability_windows aw
  set end_time = '23:00'::time
  from public.accounts a
  where aw.account_id = a.id
    and a.auth_user_id = 'f1111111-1111-1111-1111-111111111111'::uuid
  $$,
  'owner can update own availability window'
);

select lives_ok(
  $$
  delete from public.availability_windows aw
  using public.accounts a
  where aw.account_id = a.id
    and a.auth_user_id = 'f1111111-1111-1111-1111-111111111111'::uuid
  $$,
  'owner can delete own availability window'
);

select * from finish();
rollback;
