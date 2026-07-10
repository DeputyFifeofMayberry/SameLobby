-- SL-T012:db @p0
begin;
select plan(5);

\set user_id 'f2222222-2222-2222-2222-222222222222'

select tests.as_postgres();

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
values (
  :'user_id',
  'attest-user@test.local',
  crypt('TestPass123!', gen_salt('bf')),
  now(),
  now(),
  now(),
  '00000000-0000-0000-0000-000000000000',
  'authenticated',
  'authenticated'
)
on conflict (id) do nothing;

select is(
  (select status::text from public.accounts where auth_user_id = :'user_id'::uuid),
  'onboarding',
  'account begins onboarding before attestation'
);

select tests.as_postgres();

select lives_ok(
  $$
  select public.complete_account_attestation(
    (select id from public.accounts where auth_user_id = 'f2222222-2222-2222-2222-222222222222'::uuid),
    now(),
    '2026-07-08',
    '2026-07-08',
    '2026-07-08',
    '2026-07-08',
    'ip-hash',
    'ua-hash'
  )
  $$,
  'service role can complete account attestation'
);

select is(
  (select status::text from public.accounts where auth_user_id = :'user_id'::uuid),
  'active',
  'attestation activates account'
);

select is(
  (
    select count(*)::int
    from public.consent_events ce
    join public.accounts a on a.id = ce.account_id
    where a.auth_user_id = :'user_id'::uuid
  ),
  4,
  'attestation records four consent events'
);

select tests.set_auth(:'user_id'::uuid);

select throws_ok(
  $$ update public.accounts set status = 'restricted' where auth_user_id = 'f2222222-2222-2222-2222-222222222222'::uuid $$,
  '42501',
  null,
  'authenticated user cannot mutate protected status field'
);

select * from finish();
rollback;
