-- Synthetic local dev users (password: TestPass123!)
-- Do not use real PII. Not for production.

insert into auth.users (
  id,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at,
  instance_id,
  aud,
  role
)
values
  (
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    'dev-active@test.local',
    crypt('TestPass123!', gen_salt('bf')),
    now(),
    now(),
    now(),
    '00000000-0000-0000-0000-000000000000',
    'authenticated',
    'authenticated'
  ),
  (
    'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
    'dev-onboarding@test.local',
    crypt('TestPass123!', gen_salt('bf')),
    now(),
    now(),
    now(),
    '00000000-0000-0000-0000-000000000000',
    'authenticated',
    'authenticated'
  ),
  (
    'cccccccc-cccc-cccc-cccc-cccccccccccc',
    'dev-restricted@test.local',
    crypt('TestPass123!', gen_salt('bf')),
    now(),
    now(),
    now(),
    '00000000-0000-0000-0000-000000000000',
    'authenticated',
    'authenticated'
  )
on conflict (id) do nothing;

insert into auth.identities (
  id,
  user_id,
  identity_data,
  provider,
  provider_id,
  last_sign_in_at,
  created_at,
  updated_at
)
values
  (
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    jsonb_build_object(
      'sub', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
      'email', 'dev-active@test.local',
      'email_verified', true
    ),
    'email',
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    now(),
    now(),
    now()
  ),
  (
    'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
    'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
    jsonb_build_object(
      'sub', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
      'email', 'dev-onboarding@test.local',
      'email_verified', true
    ),
    'email',
    'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
    now(),
    now(),
    now()
  ),
  (
    'cccccccc-cccc-cccc-cccc-cccccccccccc',
    'cccccccc-cccc-cccc-cccc-cccccccccccc',
    jsonb_build_object(
      'sub', 'cccccccc-cccc-cccc-cccc-cccccccccccc',
      'email', 'dev-restricted@test.local',
      'email_verified', true
    ),
    'email',
    'cccccccc-cccc-cccc-cccc-cccccccccccc',
    now(),
    now(),
    now()
  )
on conflict (id) do nothing;

-- handle_new_user trigger creates accounts rows; set dev fixture statuses
update public.accounts
set
  status = 'active',
  adult_attested_at = now(),
  terms_version = '2026-07-08',
  privacy_version = '2026-07-08',
  community_standards_version = '2026-07-08'
where auth_user_id = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa';

update public.accounts
set status = 'onboarding'
where auth_user_id = 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb';

update public.accounts
set status = 'restricted'
where auth_user_id = 'cccccccc-cccc-cccc-cccc-cccccccccccc';

-- Complete profile for dev-active fixture
update public.accounts
set time_zone = 'America/Los_Angeles'
where auth_user_id = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa';

update public.gamer_profiles
set
  display_name = 'DevActive',
  communication_modes = array['same_lobby_text', 'voice_chat']::public.communication_mode[],
  onboarding_step = 'preview',
  onboarding_completed_at = now()
where account_id = (
  select id from public.accounts where auth_user_id = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'
);

insert into public.user_games (account_id, game_id, platform_id, is_active, sort_order)
select
  a.id,
  g.id,
  p.id,
  true,
  0
from public.accounts a
cross join public.games g
cross join public.platforms p
where a.auth_user_id = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'
  and g.slug = 'fortnite'
  and p.slug = 'pc'
on conflict (account_id, game_id, platform_id) do nothing;

insert into public.current_intents (account_id, goal, status, expires_at)
select
  a.id,
  'gaming_friendship'::public.intent_goal,
  'active'::public.intent_status,
  now() + interval '14 days'
from public.accounts a
where a.auth_user_id = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'
  and not exists (
    select 1 from public.current_intents ci where ci.account_id = a.id and ci.status = 'active'
  );

