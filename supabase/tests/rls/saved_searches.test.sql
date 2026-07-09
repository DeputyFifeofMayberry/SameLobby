begin;
select plan(5);

\set user_a 'f1111111-1111-1111-1111-111111111111'
\set user_b 'f2222222-2222-2222-2222-222222222222'

select tests.as_postgres();

insert into auth.users (id, email, encrypted_password, email_confirmed_at, created_at, updated_at, instance_id, aud, role)
values
  (:'user_a', 'saved-a@test.local', crypt('test', gen_salt('bf')), now(), now(), now(), '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated'),
  (:'user_b', 'saved-b@test.local', crypt('test', gen_salt('bf')), now(), now(), now(), '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated')
on conflict (id) do nothing;

insert into auth.identities (id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at)
values
  (:'user_a', :'user_a', jsonb_build_object('sub', :'user_a', 'email', 'saved-a@test.local'), 'email', :'user_a', now(), now(), now()),
  (:'user_b', :'user_b', jsonb_build_object('sub', :'user_b', 'email', 'saved-b@test.local'), 'email', :'user_b', now(), now(), now())
on conflict (id) do nothing;

update public.accounts
set status = 'active', adult_attested_at = now()
where auth_user_id in (:'user_a'::uuid, :'user_b'::uuid);

update public.entitlements
set tier = 'plus', max_saved_searches = 10
where account_id = (select id from public.accounts where auth_user_id = :'user_a'::uuid);

select tests.set_auth(:'user_a'::uuid);

select lives_ok(
  $$ insert into public.saved_searches (account_id, name, filters)
     select id, 'My search', '{"game":"fortnite"}'::jsonb
     from public.accounts where auth_user_id = 'f1111111-1111-1111-1111-111111111111'::uuid $$,
  'plus user can insert saved search via table policy'
);

select tests.set_auth(:'user_a'::uuid);

select is(
  (select count(*)::int from public.saved_searches where account_id = (
    select id from public.accounts where auth_user_id = :'user_a'::uuid
  )),
  1,
  'user can read own saved searches'
);

select tests.set_auth(:'user_b'::uuid);

select is(
  (select count(*)::int from public.saved_searches where account_id = (
    select id from public.accounts where auth_user_id = :'user_a'::uuid
  )),
  0,
  'user cannot read another account saved searches'
);

select tests.set_auth(:'user_b'::uuid);

select results_eq(
  $$ with attempted as (
       insert into public.saved_searches (account_id, name, filters)
       select id, 'Sneak', '{}'::jsonb
       from public.accounts where auth_user_id = 'f1111111-1111-1111-1111-111111111111'::uuid
       returning 1
     ) select count(*)::int from attempted $$,
  ARRAY[0],
  'cannot insert saved search for another account'
);

select tests.set_auth(:'user_a'::uuid);

select lives_ok(
  $$ delete from public.saved_searches
     where account_id = (select id from public.accounts where auth_user_id = 'f1111111-1111-1111-1111-111111111111'::uuid) $$,
  'user can delete own saved search'
);

select * from finish();
rollback;
