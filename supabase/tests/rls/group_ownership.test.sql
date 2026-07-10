begin;
-- SL-T080:db @p0
select plan(4);

\set owner 'c2111111-1111-1111-1111-111111111111'
\set member 'c2222222-2222-2222-2222-222222222222'
\set outsider 'c2333333-3333-3333-3333-333333333333'

select tests.as_postgres();

insert into auth.users (id, email, encrypted_password, email_confirmed_at, created_at, updated_at, instance_id, aud, role)
values
  (:'owner', 'own-owner@test.local', crypt('test', gen_salt('bf')), now(), now(), now(), '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated'),
  (:'member', 'own-member@test.local', crypt('test', gen_salt('bf')), now(), now(), now(), '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated'),
  (:'outsider', 'own-outsider@test.local', crypt('test', gen_salt('bf')), now(), now(), now(), '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated')
on conflict (id) do nothing;

insert into auth.identities (id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at)
values
  (:'owner', :'owner', jsonb_build_object('sub', :'owner', 'email', 'own-owner@test.local'), 'email', :'owner', now(), now(), now()),
  (:'member', :'member', jsonb_build_object('sub', :'member', 'email', 'own-member@test.local'), 'email', :'member', now(), now(), now()),
  (:'outsider', :'outsider', jsonb_build_object('sub', :'outsider', 'email', 'own-outsider@test.local'), 'email', :'outsider', now(), now(), now())
on conflict (id) do nothing;

update public.accounts
set status = 'active', adult_attested_at = now()
where auth_user_id in (:'owner'::uuid, :'member'::uuid, :'outsider'::uuid);

select tests.set_auth(:'owner'::uuid);

select lives_ok(
  $$ select public.create_private_group('Ownership Transfer', 3, 'bolt', null) $$,
  'owner can create private group'
);

select tests.as_postgres();

insert into public.group_memberships (group_id, account_id, role, status, joined_at)
select g.id, member.id, 'member', 'active', now()
from public.private_groups g
cross join public.accounts member
where g.name = 'Ownership Transfer'
  and member.auth_user_id = :'member'::uuid
on conflict do nothing;

select tests.set_auth(:'owner'::uuid);

select lives_ok(
  $$
  select public.transfer_private_group_ownership(
    (select id from public.private_groups where name = 'Ownership Transfer' limit 1)
  )
  $$,
  'owner can transfer group ownership via rpc'
);

select tests.as_postgres();

select is(
  (
    select owner_account_id
    from public.private_groups
    where name = 'Ownership Transfer'
  ),
  (select id from public.accounts where auth_user_id = :'member'::uuid),
  'ownership transfer updates owner_account_id to member'
);

select tests.set_auth(:'outsider'::uuid);

select throws_ok(
  $$
  select public.transfer_private_group_ownership(
    (select id from public.private_groups where name = 'Ownership Transfer' limit 1)
  )
  $$,
  'P0001',
  null,
  'non-member cannot transfer group ownership'
);

select tests.clear_auth();
select * from finish();
rollback;
