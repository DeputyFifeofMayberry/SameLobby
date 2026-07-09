begin;
select plan(4);

\set user_a 'e1111111-1111-1111-1111-111111111111'
\set user_b 'e2222222-2222-2222-2222-222222222222'

select tests.as_postgres();

insert into auth.users (id, email, encrypted_password, email_confirmed_at, created_at, updated_at, instance_id, aud, role)
values
  (:'user_a', 'billing-a@test.local', crypt('test', gen_salt('bf')), now(), now(), now(), '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated'),
  (:'user_b', 'billing-b@test.local', crypt('test', gen_salt('bf')), now(), now(), now(), '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated')
on conflict (id) do nothing;

insert into auth.identities (id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at)
values
  (:'user_a', :'user_a', jsonb_build_object('sub', :'user_a', 'email', 'billing-a@test.local'), 'email', :'user_a', now(), now(), now()),
  (:'user_b', :'user_b', jsonb_build_object('sub', :'user_b', 'email', 'billing-b@test.local'), 'email', :'user_b', now(), now(), now())
on conflict (id) do nothing;

update public.accounts
set status = 'active', adult_attested_at = now()
where auth_user_id in (:'user_a'::uuid, :'user_b'::uuid);

select tests.set_auth(:'user_a'::uuid);

select is(
  (select tier::text from public.entitlements where account_id = (
    select id from public.accounts where auth_user_id = :'user_a'::uuid
  )),
  'free',
  'user has free entitlements by default'
);

select tests.set_auth(:'user_b'::uuid);

select is(
  (select count(*)::int from public.entitlements where account_id = (
    select id from public.accounts where auth_user_id = :'user_a'::uuid
  )),
  0,
  'user cannot read another account entitlements'
);

select tests.set_auth(:'user_a'::uuid);

select throws_ok(
  $$ select public.upsert_saved_search('My search', '{"q":"apex"}'::jsonb) $$,
  null,
  'saved searches require plus',
  'free tier cannot save searches'
);

select tests.set_auth(:'user_a'::uuid);

select is(
  (select count(*)::int from public.subscriptions where account_id = (
    select id from public.accounts where auth_user_id = :'user_b'::uuid
  )),
  0,
  'user cannot read another account subscription'
);

select * from finish();
rollback;
