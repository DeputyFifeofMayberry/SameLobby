begin;
-- SL-T081:db @p0
select plan(4);

\set owner 'e4111111-1111-1111-1111-111111111111'
\set member 'e4222222-2222-2222-2222-222222222222'

select tests.as_postgres();

insert into auth.users (id, email, encrypted_password, email_confirmed_at, created_at, updated_at, instance_id, aud, role)
values
  (:'owner', 'gm-owner@test.local', crypt('test', gen_salt('bf')), now(), now(), now(), '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated'),
  (:'member', 'gm-member@test.local', crypt('test', gen_salt('bf')), now(), now(), now(), '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated')
on conflict (id) do nothing;

insert into auth.identities (id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at)
values
  (:'owner', :'owner', jsonb_build_object('sub', :'owner', 'email', 'gm-owner@test.local'), 'email', :'owner', now(), now(), now()),
  (:'member', :'member', jsonb_build_object('sub', :'member', 'email', 'gm-member@test.local'), 'email', :'member', now(), now(), now())
on conflict (id) do nothing;

update public.accounts
set status = 'active', adult_attested_at = now()
where auth_user_id in (:'owner'::uuid, :'member'::uuid);

select tests.set_auth(:'owner'::uuid);

select lives_ok(
  $$ select public.create_private_group('Chat Squad', 3, 'leaf', null) $$,
  'owner can create private group'
);

update public.private_groups
set status = 'active'
where name = 'Chat Squad';

select lives_ok(
  $$ select public.create_conversation_for_group(
       (select id from public.private_groups where name = 'Chat Squad' limit 1)
     ) $$,
  'active group can get a conversation'
);

select tests.set_auth(:'member'::uuid);

select is(
  (
    select count(*)::int
    from public.conversations c
    join public.private_groups g on g.id = c.group_id
    where c.kind = 'group'
      and g.name = 'Chat Squad'
  ),
  0,
  'non-member cannot read group conversation before joining'
);

select tests.set_auth(:'owner'::uuid);

select lives_ok(
  $$
  insert into public.messages (conversation_id, sender_account_id, body, retention_at)
  select c.id, owner.id, 'Group hello', now() + interval '12 months'
  from public.conversations c
  join public.private_groups g on g.id = c.group_id
  join public.accounts owner on owner.auth_user_id = 'e4111111-1111-1111-1111-111111111111'::uuid
  where c.kind = 'group'
    and g.name = 'Chat Squad'
  limit 1
  $$,
  'group owner can send group message'
);

select tests.clear_auth();
select * from finish();
rollback;
