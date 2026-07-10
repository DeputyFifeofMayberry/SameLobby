begin;
-- SL-T074:db @p0
-- SL-T076:db @p0
select plan(5);

\set user_a 'e7111111-1111-1111-1111-111111111111'
\set user_b 'e7222222-2222-2222-2222-222222222222'
\set outsider 'e7333333-3333-3333-3333-333333333333'

select tests.as_postgres();

insert into auth.users (id, email, encrypted_password, email_confirmed_at, created_at, updated_at, instance_id, aud, role)
values
  (:'user_a', 'teammate-a@test.local', crypt('test', gen_salt('bf')), now(), now(), now(), '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated'),
  (:'user_b', 'teammate-b@test.local', crypt('test', gen_salt('bf')), now(), now(), now(), '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated'),
  (:'outsider', 'teammate-outsider@test.local', crypt('test', gen_salt('bf')), now(), now(), now(), '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated')
on conflict (id) do nothing;

insert into auth.identities (id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at)
values
  (:'user_a', :'user_a', jsonb_build_object('sub', :'user_a', 'email', 'teammate-a@test.local'), 'email', :'user_a', now(), now(), now()),
  (:'user_b', :'user_b', jsonb_build_object('sub', :'user_b', 'email', 'teammate-b@test.local'), 'email', :'user_b', now(), now(), now()),
  (:'outsider', :'outsider', jsonb_build_object('sub', :'outsider', 'email', 'teammate-outsider@test.local'), 'email', :'outsider', now(), now(), now())
on conflict (id) do nothing;

update public.accounts
set status = 'active', adult_attested_at = now()
where auth_user_id in (:'user_a'::uuid, :'user_b'::uuid, :'outsider'::uuid);

insert into public.connections (user_a_id, user_b_id, status)
select
  least(a.id, b.id),
  greatest(a.id, b.id),
  'connected'
from public.accounts a
cross join public.accounts b
where a.auth_user_id = :'user_a'::uuid
  and b.auth_user_id = :'user_b'::uuid
on conflict (user_a_id, user_b_id) do nothing;

insert into public.teammate_relationships (
  user_a_id,
  user_b_id,
  connection_id,
  status,
  proposed_by_account_id,
  user_a_affirmed,
  user_b_affirmed
)
select
  least(a.id, b.id),
  greatest(a.id, b.id),
  conn.id,
  'teammate'::public.teammate_status,
  a.id,
  true,
  true
from public.accounts a
cross join public.accounts b
join public.connections conn
  on conn.user_a_id = least(a.id, b.id)
 and conn.user_b_id = greatest(a.id, b.id)
where a.auth_user_id = :'user_a'::uuid
  and b.auth_user_id = :'user_b'::uuid
  and conn.status = 'connected'
on conflict (user_a_id, user_b_id) do nothing;

select tests.set_auth(:'user_a'::uuid);

select is(
  (select count(*)::int
   from public.teammate_relationships tr
   join public.accounts a on a.id in (tr.user_a_id, tr.user_b_id)
   where a.auth_user_id = :'user_a'::uuid),
  1,
  'participant can read teammate relationship'
);

select lives_ok(
  $$
  insert into public.teammate_notes (account_id, relationship_id, body)
  select a.id, tr.id, 'Private note'
  from public.accounts a
  cross join public.teammate_relationships tr
  where a.auth_user_id = 'e7111111-1111-1111-1111-111111111111'
  limit 1
  on conflict (account_id, relationship_id) do update set body = excluded.body
  $$,
  'author can write own teammate note'
);

select tests.set_auth(:'user_b'::uuid);

select is(
  (select count(*)::int from public.teammate_notes tn
   join public.teammate_relationships tr on tr.id = tn.relationship_id
   join public.accounts a on a.id in (tr.user_a_id, tr.user_b_id)
   where a.auth_user_id in (:'user_a'::uuid, :'user_b'::uuid)),
  0,
  'other participant cannot read teammate notes'
);

select tests.set_auth(:'outsider'::uuid);

select is(
  (select count(*)::int
   from public.teammate_relationships tr
   join public.accounts a on a.auth_user_id = :'user_a'::uuid
   join public.accounts b on b.auth_user_id = :'user_b'::uuid
   where tr.user_a_id in (a.id, b.id)
     and tr.user_b_id in (a.id, b.id)),
  0,
  'non-participant cannot read teammate relationships'
);

select tests.as_postgres();

insert into public.blocks (blocker_account_id, blocked_account_id)
select b.id, a.id
from public.accounts a
cross join public.accounts b
where a.auth_user_id = :'user_a'::uuid
  and b.auth_user_id = :'user_b'::uuid;

select tests.set_auth(:'user_b'::uuid);

select is(
  (select count(*)::int
   from public.teammate_relationships tr
   join public.accounts a on a.auth_user_id = :'user_a'::uuid
   join public.accounts b on b.auth_user_id = :'user_b'::uuid
   where tr.user_a_id in (a.id, b.id)
     and tr.user_b_id in (a.id, b.id)),
  0,
  'blocked participant cannot read teammate relationship'
);

select tests.clear_auth();
select * from finish();
rollback;
