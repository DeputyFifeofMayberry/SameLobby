begin;
-- SL-T034:db @p1
select plan(3);

\set viewer 'f1111111-1111-1111-1111-111111111111'
\set target 'f2222222-2222-2222-2222-222222222222'
\set blocked 'f3333333-3333-3333-3333-333333333333'

select tests.as_postgres();

insert into auth.users (id, email, encrypted_password, email_confirmed_at, created_at, updated_at, instance_id, aud, role)
values
  (:'viewer', 'discover-viewer@test.local', crypt('test', gen_salt('bf')), now(), now(), now(), '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated'),
  (:'target', 'discover-target@test.local', crypt('test', gen_salt('bf')), now(), now(), now(), '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated'),
  (:'blocked', 'discover-blocked@test.local', crypt('test', gen_salt('bf')), now(), now(), now(), '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated')
on conflict (id) do nothing;

insert into auth.identities (id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at)
values
  (:'viewer', :'viewer', jsonb_build_object('sub', :'viewer', 'email', 'discover-viewer@test.local'), 'email', :'viewer', now(), now(), now()),
  (:'target', :'target', jsonb_build_object('sub', :'target', 'email', 'discover-target@test.local'), 'email', :'target', now(), now(), now()),
  (:'blocked', :'blocked', jsonb_build_object('sub', :'blocked', 'email', 'discover-blocked@test.local'), 'email', :'blocked', now(), now(), now())
on conflict (id) do nothing;

update public.accounts
set
  status = 'active',
  adult_attested_at = now(),
  time_zone = 'America/Los_Angeles',
  locale = 'en'
where auth_user_id in (:'viewer'::uuid, :'target'::uuid, :'blocked'::uuid);

update public.gamer_profiles gp
set
  display_name = 'Target',
  communication_modes = array['same_lobby_text']::public.communication_mode[],
  onboarding_completed_at = now()
from public.accounts a
where gp.account_id = a.id and a.auth_user_id = :'target'::uuid;

update public.gamer_profiles gp
set
  display_name = 'Blocked',
  communication_modes = array['same_lobby_text']::public.communication_mode[],
  onboarding_completed_at = now()
from public.accounts a
where gp.account_id = a.id and a.auth_user_id = :'blocked'::uuid;

select tests.set_auth(:'viewer'::uuid);

select is(
  (
    select count(*)::int
    from public.gamer_profiles gp
    join public.accounts a on a.id = gp.account_id
    where a.auth_user_id = :'target'::uuid
  ),
  0,
  'gamer_profiles remain own-only; discovery uses server eligibility'
);

select tests.as_postgres();

insert into public.blocks (blocker_account_id, blocked_account_id)
select bv.id, bb.id
from public.accounts bv
cross join public.accounts bb
where bv.auth_user_id = :'viewer'::uuid
  and bb.auth_user_id = :'blocked'::uuid;

select tests.set_auth(:'viewer'::uuid);

select is(
  (
    select count(*)::int
    from public.blocks b
    join public.accounts a on a.id = b.blocker_account_id
    where a.auth_user_id = :'viewer'::uuid
  ),
  1,
  'blocker can see their own blocks'
);

select tests.clear_auth();

select is(
  (select count(*)::int from public.recommendation_reason_codes),
  6,
  'reason code catalog is seeded'
);

select * from finish();
rollback;
