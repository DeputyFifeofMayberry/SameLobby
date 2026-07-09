begin;
select plan(3);

\set user_a 'c1111111-1111-1111-1111-111111111111'
\set user_b 'c2222222-2222-2222-2222-222222222222'
\set user_c 'c3333333-3333-3333-3333-333333333333'

select tests.as_postgres();

insert into auth.users (id, email, encrypted_password, email_confirmed_at, created_at, updated_at, instance_id, aud, role)
values
  (:'user_a', 'play-a@test.local', crypt('test', gen_salt('bf')), now(), now(), now(), '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated'),
  (:'user_b', 'play-b@test.local', crypt('test', gen_salt('bf')), now(), now(), now(), '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated'),
  (:'user_c', 'play-c@test.local', crypt('test', gen_salt('bf')), now(), now(), now(), '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated')
on conflict (id) do nothing;

insert into auth.identities (id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at)
values
  (:'user_a', :'user_a', jsonb_build_object('sub', :'user_a', 'email', 'play-a@test.local'), 'email', :'user_a', now(), now(), now()),
  (:'user_b', :'user_b', jsonb_build_object('sub', :'user_b', 'email', 'play-b@test.local'), 'email', :'user_b', now(), now(), now()),
  (:'user_c', :'user_c', jsonb_build_object('sub', :'user_c', 'email', 'play-c@test.local'), 'email', :'user_c', now(), now(), now())
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
join public.accounts a on a.id in (c.user_a_id, c.user_b_id)
join public.accounts b on b.id in (c.user_a_id, c.user_b_id)
where a.auth_user_id = :'user_a'::uuid and b.auth_user_id = :'user_b'::uuid
limit 1;

select tests.set_auth(:'user_a'::uuid);

select lives_ok(
  $$
  insert into public.play_invitations (
    conversation_id,
    proposer_account_id,
    recipient_account_id,
    game_id,
    platform_id,
    scheduling_mode,
    session_length_minutes,
    expires_at
  )
  select
    conv.id,
    proposer.id,
    recipient.id,
    (select id from public.games limit 1),
    (select id from public.platforms limit 1),
    'play_now'::public.play_scheduling_mode,
    60,
    now() + interval '14 days'
  from public.conversations conv
  join public.connections conn on conn.id = conv.connection_id
  join public.accounts proposer on proposer.auth_user_id = 'c1111111-1111-1111-1111-111111111111'::uuid
  join public.accounts recipient on recipient.auth_user_id = 'c2222222-2222-2222-2222-222222222222'::uuid
  limit 1
  $$,
  'proposer can insert invitation'
);

select tests.set_auth(:'user_c'::uuid);

select is(
  (
    select count(*)::int
    from public.play_invitations pi
    join public.accounts proposer on proposer.id = pi.proposer_account_id
    join public.accounts recipient on recipient.id = pi.recipient_account_id
    where proposer.auth_user_id = :'user_a'::uuid
      and recipient.auth_user_id = :'user_b'::uuid
  ),
  0,
  'non-participant cannot read invitations'
);

select tests.set_auth(:'user_a'::uuid);

select tests.as_postgres();

insert into public.blocks (blocker_account_id, blocked_account_id)
select a.id, b.id
from public.accounts a
cross join public.accounts b
where a.auth_user_id = :'user_a'::uuid
  and b.auth_user_id = :'user_b'::uuid;

select tests.set_auth(:'user_a'::uuid);

select is(
  (
    select count(*)::int
    from public.play_invitations pi
    join public.accounts proposer on proposer.id = pi.proposer_account_id
    join public.accounts recipient on recipient.id = pi.recipient_account_id
    where proposer.auth_user_id = :'user_a'::uuid
      and recipient.auth_user_id = :'user_b'::uuid
  ),
  0,
  'blocked pair cannot read invitations'
);

select * from finish();
rollback;
