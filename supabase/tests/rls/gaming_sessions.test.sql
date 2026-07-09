begin;
select plan(2);

\set user_a 'c4111111-1111-1111-1111-111111111111'
\set user_b 'c4222222-2222-2222-2222-222222222222'
\set user_c 'c4333333-3333-3333-3333-333333333333'

select tests.as_postgres();

insert into auth.users (id, email, encrypted_password, email_confirmed_at, created_at, updated_at, instance_id, aud, role)
values
  (:'user_a', 'sess-a@test.local', crypt('test', gen_salt('bf')), now(), now(), now(), '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated'),
  (:'user_b', 'sess-b@test.local', crypt('test', gen_salt('bf')), now(), now(), now(), '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated'),
  (:'user_c', 'sess-c@test.local', crypt('test', gen_salt('bf')), now(), now(), now(), '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated')
on conflict (id) do nothing;

insert into auth.identities (id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at)
values
  (:'user_a', :'user_a', jsonb_build_object('sub', :'user_a'), 'email', :'user_a', now(), now(), now()),
  (:'user_b', :'user_b', jsonb_build_object('sub', :'user_b'), 'email', :'user_b', now(), now(), now()),
  (:'user_c', :'user_c', jsonb_build_object('sub', :'user_c'), 'email', :'user_c', now(), now(), now())
on conflict (id) do nothing;

update public.accounts set status = 'active', adult_attested_at = now()
where auth_user_id in (:'user_a'::uuid, :'user_b'::uuid, :'user_c'::uuid);

insert into public.connections (user_a_id, user_b_id, status)
select least(a.id, b.id), greatest(a.id, b.id), 'connected'
from public.accounts a cross join public.accounts b
where a.auth_user_id = :'user_a'::uuid and b.auth_user_id = :'user_b'::uuid
on conflict do nothing;

select public.create_conversation_for_connection(c.id)
from public.connections c
join public.accounts a on a.auth_user_id = :'user_a'::uuid and a.id in (c.user_a_id, c.user_b_id)
limit 1;

insert into public.play_invitations (
  conversation_id, proposer_account_id, recipient_account_id,
  game_id, platform_id, scheduling_mode, session_length_minutes,
  status, expires_at
)
select conv.id, proposer.id, recipient.id,
  (select id from public.games limit 1),
  (select id from public.platforms limit 1),
  'play_now', 60, 'accepted', now() + interval '7 days'
from public.conversations conv
join public.accounts proposer on proposer.auth_user_id = :'user_a'::uuid
join public.accounts recipient on recipient.auth_user_id = :'user_b'::uuid
limit 1;

insert into public.gaming_sessions (
  invitation_id, conversation_id, game_id, platform_id,
  confirmed_start_at, session_length_minutes,
  participant_a_id, participant_b_id
)
select pi.id, pi.conversation_id, pi.game_id, pi.platform_id,
  now() + interval '1 day', 60,
  least(pi.proposer_account_id, pi.recipient_account_id),
  greatest(pi.proposer_account_id, pi.recipient_account_id)
from public.play_invitations pi
where not exists (
  select 1 from public.gaming_sessions gs where gs.invitation_id = pi.id
)
limit 1;

select tests.set_auth(:'user_c'::uuid);

select is(
  (
    select count(*)::int
    from public.gaming_sessions gs
    join public.play_invitations pi on pi.id = gs.invitation_id
    join public.accounts proposer on proposer.id = pi.proposer_account_id
    where proposer.auth_user_id = :'user_a'::uuid
  ),
  0,
  'non-participant cannot read sessions'
);

select tests.set_auth(:'user_a'::uuid);

select is(
  (
    select count(*)::int
    from public.gaming_sessions gs
    join public.play_invitations pi on pi.id = gs.invitation_id
    join public.accounts proposer on proposer.id = pi.proposer_account_id
    where proposer.auth_user_id = :'user_a'::uuid
  ),
  1,
  'participant can read session'
);

select * from finish();
rollback;
