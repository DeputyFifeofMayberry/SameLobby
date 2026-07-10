begin;
-- SL-T057:db @p1
select plan(2);

\set user_a 'b4111111-1111-1111-1111-111111111111'
\set user_b 'b4222222-2222-2222-2222-222222222222'

select tests.as_postgres();

insert into auth.users (id, email, encrypted_password, email_confirmed_at, created_at, updated_at, instance_id, aud, role)
values
  (:'user_a', 'ret-a@test.local', crypt('test', gen_salt('bf')), now(), now(), now(), '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated'),
  (:'user_b', 'ret-b@test.local', crypt('test', gen_salt('bf')), now(), now(), now(), '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated')
on conflict (id) do nothing;

insert into auth.identities (id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at)
values
  (:'user_a', :'user_a', jsonb_build_object('sub', :'user_a', 'email', 'ret-a@test.local'), 'email', :'user_a', now(), now(), now()),
  (:'user_b', :'user_b', jsonb_build_object('sub', :'user_b', 'email', 'ret-b@test.local'), 'email', :'user_b', now(), now(), now())
on conflict (id) do nothing;

update public.accounts
set status = 'active', adult_attested_at = now()
where auth_user_id in (:'user_a'::uuid, :'user_b'::uuid);

insert into public.connections (user_a_id, user_b_id, status)
select least(a.id, b.id), greatest(a.id, b.id), 'connected'
from public.accounts a
cross join public.accounts b
where a.auth_user_id = :'user_a'::uuid
  and b.auth_user_id = :'user_b'::uuid
on conflict do nothing;

select public.create_conversation_for_connection(c.id)
from public.connections c
join public.accounts a on a.auth_user_id = :'user_a'::uuid
join public.accounts b on b.auth_user_id = :'user_b'::uuid
where c.user_a_id in (a.id, b.id)
  and c.user_b_id in (a.id, b.id)
limit 1;

insert into public.messages (conversation_id, sender_account_id, body, retention_at)
select c.id, a.id, 'Expired message', now() + interval '12 months'
from public.conversations c
join public.connections conn on conn.id = c.connection_id
join public.accounts a on a.auth_user_id = :'user_a'::uuid
where a.id in (conn.user_a_id, conn.user_b_id)
limit 1;

update public.messages
set retention_at = now() - interval '1 day'
where body = 'Expired message';

select is(
  (
    select count(*)::int
    from public.messages m
    where m.body = 'Expired message'
  ),
  1,
  'expired message exists before purge'
);

select is(
  public.purge_expired_messages(500),
  1,
  'purge_expired_messages removes expired messages'
);

select * from finish();
rollback;
