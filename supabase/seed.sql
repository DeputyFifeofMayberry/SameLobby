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
