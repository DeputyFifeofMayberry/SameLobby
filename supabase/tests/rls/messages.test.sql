begin;
select plan(5);

\set user_a 'b1111111-1111-1111-1111-111111111111'
\set user_b 'b2222222-2222-2222-2222-222222222222'
\set user_c 'b3333333-3333-3333-3333-333333333333'

insert into auth.users (id, email, encrypted_password, email_confirmed_at, created_at, updated_at, instance_id, aud, role)
values
  (:'user_a', 'msg-a@test.local', crypt('test', gen_salt('bf')), now(), now(), now(), '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated'),
  (:'user_b', 'msg-b@test.local', crypt('test', gen_salt('bf')), now(), now(), now(), '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated'),
  (:'user_c', 'msg-c@test.local', crypt('test', gen_salt('bf')), now(), now(), now(), '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated')
on conflict (id) do nothing;

insert into auth.identities (id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at)
values
  (:'user_a', :'user_a', jsonb_build_object('sub', :'user_a', 'email', 'msg-a@test.local'), 'email', :'user_a', now(), now(), now()),
  (:'user_b', :'user_b', jsonb_build_object('sub', :'user_b', 'email', 'msg-b@test.local'), 'email', :'user_b', now(), now(), now()),
  (:'user_c', :'user_c', jsonb_build_object('sub', :'user_c', 'email', 'msg-c@test.local'), 'email', :'user_c', now(), now(), now())
on conflict (id) do nothing;

update public.accounts
set status = 'active', adult_attested_at = now()
where auth_user_id in (:'user_a'::uuid, :'user_b'::uuid, :'user_c'::uuid);

insert into public.connections (user_a_id, user_b_id, status)
select least(a.id, b.id), greatest(a.id, b.id), 'connected'
from public.accounts a
cross join public.accounts b
where a.auth_user_id = :'user_a'::uuid
  and b.auth_user_id = :'user_b'::uuid
on conflict do nothing;

select public.create_conversation_for_connection(c.id)
from public.connections c
join public.accounts a on a.id = c.user_a_id or a.id = c.user_b_id
join public.accounts b on b.id = c.user_a_id or b.id = c.user_b_id
where a.auth_user_id = :'user_a'::uuid and b.auth_user_id = :'user_b'::uuid
limit 1;

select tests.set_auth(:'user_a'::uuid);

select lives_ok(
  $$
  insert into public.messages (conversation_id, sender_account_id, body, retention_at)
  select c.id, a.id, 'Hello', now() + interval '12 months'
  from public.conversations c
  join public.connections conn on conn.id = c.connection_id
  join public.accounts a on a.auth_user_id = 'b1111111-1111-1111-1111-111111111111'::uuid
  where conn.user_a_id = least(a.id, (select id from public.accounts where auth_user_id = 'b2222222-2222-2222-2222-222222222222'::uuid))
  limit 1
  $$,
  'member can send message'
);

select tests.set_auth(:'user_c'::uuid);

select is(
  (select count(*)::int from public.messages),
  0,
  'non-member cannot read messages'
);

select tests.set_auth(:'user_a'::uuid);

insert into public.blocks (blocker_account_id, blocked_account_id)
select a.id, b.id
from public.accounts a
cross join public.accounts b
where a.auth_user_id = :'user_a'::uuid
  and b.auth_user_id = :'user_b'::uuid;

select is(
  (select count(*)::int from public.conversations),
  0,
  'blocked conversation hidden from member'
);

select * from finish();
rollback;
