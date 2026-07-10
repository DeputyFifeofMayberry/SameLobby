begin;
-- SL-T077:db @p0
select plan(3);

\set owner 'e3111111-1111-1111-1111-111111111111'
\set member 'e3222222-2222-2222-2222-222222222222'
\set outsider 'e3333333-3333-3333-3333-333333333333'

select tests.as_postgres();

insert into auth.users (id, email, encrypted_password, email_confirmed_at, created_at, updated_at, instance_id, aud, role)
values
  (:'owner', 'pg-owner@test.local', crypt('test', gen_salt('bf')), now(), now(), now(), '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated'),
  (:'member', 'pg-member@test.local', crypt('test', gen_salt('bf')), now(), now(), now(), '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated'),
  (:'outsider', 'pg-outsider@test.local', crypt('test', gen_salt('bf')), now(), now(), now(), '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated')
on conflict (id) do nothing;

insert into auth.identities (id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at)
values
  (:'owner', :'owner', jsonb_build_object('sub', :'owner', 'email', 'pg-owner@test.local'), 'email', :'owner', now(), now(), now()),
  (:'member', :'member', jsonb_build_object('sub', :'member', 'email', 'pg-member@test.local'), 'email', :'member', now(), now(), now()),
  (:'outsider', :'outsider', jsonb_build_object('sub', :'outsider', 'email', 'pg-outsider@test.local'), 'email', :'outsider', now(), now(), now())
on conflict (id) do nothing;

update public.accounts
set status = 'active', adult_attested_at = now()
where auth_user_id in (:'owner'::uuid, :'member'::uuid, :'outsider'::uuid);

select tests.set_auth(:'owner'::uuid);

select lives_ok(
  $$
  select public.create_private_group('Dev Squad', 4, 'star', null)
  $$,
  'owner can create private group'
);

update public.private_groups
set status = 'active'
where name = 'Dev Squad';

select tests.set_auth(:'outsider'::uuid);

select is(
  (select count(*)::int from public.private_groups),
  0,
  'non-member cannot read private group'
);

select tests.set_auth(:'owner'::uuid);

select throws_ok(
  $$ select public.create_private_group('Second Squad', 4, 'bolt', null) $$,
  null,
  null,
  'free tier blocks second active owned group'
);

select tests.clear_auth();
select * from finish();
rollback;
