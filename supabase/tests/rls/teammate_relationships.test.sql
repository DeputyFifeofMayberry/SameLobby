begin;
select plan(5);

\set user_a 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'
\set user_b 'd1111111-1111-1111-1111-111111111111'
\set outsider 'b2222222-2222-2222-2222-222222222222'

select tests.as_postgres();

insert into auth.users (id, email, encrypted_password, email_confirmed_at, created_at, updated_at, instance_id, aud, role)
values
  (:'outsider', 'teammate-outsider@test.local', crypt('test', gen_salt('bf')), now(), now(), now(), '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated')
on conflict (id) do nothing;

insert into auth.identities (id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at)
values
  (:'outsider', :'outsider', jsonb_build_object('sub', :'outsider', 'email', 'teammate-outsider@test.local'), 'email', :'outsider', now(), now(), now())
on conflict (id) do nothing;

update public.accounts
set status = 'active', adult_attested_at = now()
where auth_user_id = :'outsider'::uuid;

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
  where a.auth_user_id = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'
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
