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

-- Enable discovery for local dev
update public.feature_flags set enabled = true where key = 'discovery_enabled';
update public.feature_flags set enabled = true where key = 'connection_requests_enabled';

-- Additional discoverable fixtures (same cohort as dev-active)
insert into auth.users (id, email, encrypted_password, email_confirmed_at, created_at, updated_at, instance_id, aud, role)
values
  ('d1111111-1111-1111-1111-111111111111', 'dev-peer-1@test.local', crypt('TestPass123!', gen_salt('bf')), now(), now(), now(), '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated'),
  ('d2222222-2222-2222-2222-222222222222', 'dev-peer-2@test.local', crypt('TestPass123!', gen_salt('bf')), now(), now(), now(), '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated'),
  ('d3333333-3333-3333-3333-333333333333', 'dev-peer-3@test.local', crypt('TestPass123!', gen_salt('bf')), now(), now(), now(), '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated')
on conflict (id) do nothing;

insert into auth.identities (id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at)
values
  ('d1111111-1111-1111-1111-111111111111', 'd1111111-1111-1111-1111-111111111111', jsonb_build_object('sub', 'd1111111-1111-1111-1111-111111111111', 'email', 'dev-peer-1@test.local', 'email_verified', true), 'email', 'd1111111-1111-1111-1111-111111111111', now(), now(), now()),
  ('d2222222-2222-2222-2222-222222222222', 'd2222222-2222-2222-2222-222222222222', jsonb_build_object('sub', 'd2222222-2222-2222-2222-222222222222', 'email', 'dev-peer-2@test.local', 'email_verified', true), 'email', 'd2222222-2222-2222-2222-222222222222', now(), now(), now()),
  ('d3333333-3333-3333-3333-333333333333', 'd3333333-3333-3333-3333-333333333333', jsonb_build_object('sub', 'd3333333-3333-3333-3333-333333333333', 'email', 'dev-peer-3@test.local', 'email_verified', true), 'email', 'd3333333-3333-3333-3333-333333333333', now(), now(), now())
on conflict (id) do nothing;

update public.accounts
set
  status = 'active',
  adult_attested_at = now(),
  terms_version = '2026-07-08',
  privacy_version = '2026-07-08',
  community_standards_version = '2026-07-08',
  time_zone = 'America/Los_Angeles',
  locale = 'en'
where auth_user_id in (
  'd1111111-1111-1111-1111-111111111111',
  'd2222222-2222-2222-2222-222222222222',
  'd3333333-3333-3333-3333-333333333333'
);

update public.gamer_profiles gp
set
  display_name = v.name,
  communication_modes = array['same_lobby_text', 'voice_chat']::public.communication_mode[],
  onboarding_step = 'preview',
  onboarding_completed_at = now()
from (
  values
    ('d1111111-1111-1111-1111-111111111111'::uuid, 'PeerOne'),
    ('d2222222-2222-2222-2222-222222222222'::uuid, 'PeerTwo'),
    ('d3333333-3333-3333-3333-333333333333'::uuid, 'PeerThree')
) as v(auth_user_id, name)
join public.accounts a on a.auth_user_id = v.auth_user_id
where gp.account_id = a.id;

insert into public.user_games (account_id, game_id, platform_id, is_active, sort_order)
select a.id, g.id, p.id, true, 0
from public.accounts a
cross join public.games g
cross join public.platforms p
where a.auth_user_id in (
  'd1111111-1111-1111-1111-111111111111',
  'd2222222-2222-2222-2222-222222222222',
  'd3333333-3333-3333-3333-333333333333'
)
  and g.slug = 'fortnite'
  and p.slug = 'pc'
on conflict (account_id, game_id, platform_id) do nothing;

insert into public.current_intents (account_id, goal, status, expires_at)
select a.id, 'gaming_friendship'::public.intent_goal, 'active'::public.intent_status, now() + interval '14 days'
from public.accounts a
where a.auth_user_id in (
  'd1111111-1111-1111-1111-111111111111',
  'd2222222-2222-2222-2222-222222222222',
  'd3333333-3333-3333-3333-333333333333'
)
  and not exists (
    select 1 from public.current_intents ci where ci.account_id = a.id and ci.status = 'active'
  );

-- Force active discovery for local dev cohort (still shows density UI until 40 users)
insert into public.cohort_activation_status (cohort_key, status)
values ('en:America:fortnite', 'active_discovery')
on conflict (cohort_key) do update set status = excluded.status;

update public.feature_flags set enabled = true where key = 'messaging_enabled';

-- Dev connection + conversation between dev-active and PeerOne for messaging smoke tests
insert into public.connections (user_a_id, user_b_id, status)
select least(a1.id, a2.id), greatest(a1.id, a2.id), 'connected'::public.connection_status
from public.accounts a1
cross join public.accounts a2
where a1.auth_user_id = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'
  and a2.auth_user_id = 'd1111111-1111-1111-1111-111111111111'
on conflict (user_a_id, user_b_id) do nothing;

select public.create_conversation_for_connection(c.id)
from public.connections c
where (c.user_a_id, c.user_b_id) = (
  select least(a1.id, a2.id), greatest(a1.id, a2.id)
  from public.accounts a1
  cross join public.accounts a2
  where a1.auth_user_id = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'
    and a2.auth_user_id = 'd1111111-1111-1111-1111-111111111111'
);

update public.feature_flags set enabled = true where key = 'play_invitations_enabled';

-- Sample proposed play invitation for local dev smoke tests
insert into public.play_invitations (
  conversation_id,
  proposer_account_id,
  recipient_account_id,
  game_id,
  platform_id,
  scheduling_mode,
  session_length_minutes,
  voice_preferred,
  note,
  status,
  expires_at
)
select
  conv.id,
  proposer.id,
  recipient.id,
  ug.game_id,
  ug.platform_id,
  'scheduled'::public.play_scheduling_mode,
  90,
  true,
  'Fortnite duo when you are free?',
  'proposed'::public.play_invitation_status,
  now() + interval '14 days'
from public.conversations conv
join public.connections conn on conn.id = conv.connection_id
join public.accounts proposer on proposer.auth_user_id = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'
join public.accounts recipient on recipient.auth_user_id = 'd1111111-1111-1111-1111-111111111111'
join public.user_games ug on ug.account_id = proposer.id and ug.is_active = true
where not exists (
  select 1 from public.play_invitations pi
  where pi.conversation_id = conv.id and pi.status = 'proposed'
)
limit 1;

insert into public.play_time_options (invitation_id, proposed_start_at, sort_order)
select pi.id, now() + interval '2 days', 0
from public.play_invitations pi
where pi.status = 'proposed'
  and not exists (
    select 1 from public.play_time_options pto where pto.invitation_id = pi.id
  )
limit 1;

update public.feature_flags set enabled = true where key = 'teammates_enabled';
update public.feature_flags set enabled = true where key = 'private_groups_enabled';

-- Completed session between dev-active and PeerOne for teammate smoke tests
update public.play_invitations
set status = 'accepted'::public.play_invitation_status,
    responded_at = now(),
    updated_at = now()
where id in (
  select pi.id
  from public.play_invitations pi
  join public.accounts proposer on proposer.id = pi.proposer_account_id
  where proposer.auth_user_id = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'
    and pi.status = 'proposed'
  limit 1
);

insert into public.gaming_sessions (
  invitation_id,
  conversation_id,
  game_id,
  platform_id,
  status,
  confirmed_start_at,
  session_length_minutes,
  started_at,
  completed_at,
  participant_a_id,
  participant_b_id,
  occurred_a,
  occurred_b
)
select
  pi.id,
  pi.conversation_id,
  pi.game_id,
  pi.platform_id,
  'completed'::public.gaming_session_status,
  now() - interval '1 day',
  pi.session_length_minutes,
  now() - interval '1 day',
  now() - interval '23 hours',
  least(proposer.id, recipient.id),
  greatest(proposer.id, recipient.id),
  true,
  true
from public.play_invitations pi
join public.accounts proposer on proposer.id = pi.proposer_account_id
join public.accounts recipient on recipient.id = pi.recipient_account_id
where proposer.auth_user_id = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'
  and recipient.auth_user_id = 'd1111111-1111-1111-1111-111111111111'
  and pi.status = 'accepted'
  and not exists (
    select 1 from public.gaming_sessions gs where gs.invitation_id = pi.id
  )
limit 1;

-- Sample proposed teammate relationship (dev-active → PeerOne)
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
  least(proposer.id, recipient.id),
  greatest(proposer.id, recipient.id),
  conn.id,
  'proposed'::public.teammate_status,
  proposer.id,
  true,
  false
from public.accounts proposer
cross join public.accounts recipient
join public.connections conn
  on conn.user_a_id = least(proposer.id, recipient.id)
 and conn.user_b_id = greatest(proposer.id, recipient.id)
where proposer.auth_user_id = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'
  and recipient.auth_user_id = 'd1111111-1111-1111-1111-111111111111'
  and conn.status = 'connected'
on conflict (user_a_id, user_b_id) do nothing;

-- Slice 8: reporting, admin, sample moderation case
update public.feature_flags set enabled = true where key = 'reporting_enabled';

insert into public.admin_users (account_id, scopes, mfa_enrolled_at)
select id, array['safety_review', 'support', 'security_break_glass', 'catalog']::text[], now()
from public.accounts
where auth_user_id = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'
on conflict (account_id) do update
  set scopes = excluded.scopes,
      mfa_enrolled_at = excluded.mfa_enrolled_at,
      disabled_at = null;

with rep as (
  insert into public.reports (
    reporter_account_id,
    reported_account_id,
    category,
    description,
    status,
    severity
  )
  select reporter.id, reported.id, 'harassment', 'Seed report for admin queue smoke test', 'case_opened', 'p1'
  from public.accounts reporter
  cross join public.accounts reported
  where reporter.auth_user_id = 'd1111111-1111-1111-1111-111111111111'
    and reported.auth_user_id = 'cccccccc-cccc-cccc-cccc-cccccccccccc'
    and not exists (
      select 1 from public.reports r2
      where r2.reporter_account_id = reporter.id
        and r2.reported_account_id = reported.id
        and r2.description = 'Seed report for admin queue smoke test'
    )
  returning id
),
new_case as (
  insert into public.moderation_cases (report_id, status, severity)
  select id, 'open', 'p1' from rep
  returning id, report_id
)
update public.reports r
set moderation_case_id = new_case.id
from new_case
where r.id = new_case.report_id;

-- Slice 9: billing plans seeded in migration; enable Stripe only after smoke test
-- Set stripe_price_id on plans to match Stripe Dashboard test mode prices before enabling checkout.
-- update public.plans set stripe_price_id = 'price_...' where key = 'plus_monthly';

-- Launch phase: capped beta defaults (staging/local; adjust via /admin/feature-controls)
update public.feature_flags
set enabled = false
where key = 'registration_open';

update public.feature_flags
set enabled = true,
    metadata = '{"max_accounts": 100}'::jsonb
where key = 'registration_cap';

