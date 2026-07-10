begin;
-- SL-T094:db @p1
select plan(3);

\set reporter 'e6111111-1111-1111-1111-111111111111'
\set reported 'e6222222-2222-2222-2222-222222222222'
\set admin 'e6333333-3333-3333-3333-333333333333'

select tests.as_postgres();

insert into auth.users (id, email, encrypted_password, email_confirmed_at, created_at, updated_at, instance_id, aud, role)
values
  (:'reporter', 'release-reporter@test.local', crypt('test', gen_salt('bf')), now(), now(), now(), '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated'),
  (:'reported', 'release-reported@test.local', crypt('test', gen_salt('bf')), now(), now(), now(), '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated'),
  (:'admin', 'release-admin@test.local', crypt('test', gen_salt('bf')), now(), now(), now(), '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated')
on conflict (id) do nothing;

insert into auth.identities (id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at)
values
  (:'reporter', :'reporter', jsonb_build_object('sub', :'reporter', 'email', 'release-reporter@test.local'), 'email', :'reporter', now(), now(), now()),
  (:'reported', :'reported', jsonb_build_object('sub', :'reported', 'email', 'release-reported@test.local'), 'email', :'reported', now(), now(), now()),
  (:'admin', :'admin', jsonb_build_object('sub', :'admin', 'email', 'release-admin@test.local'), 'email', :'admin', now(), now(), now())
on conflict (id) do nothing;

update public.accounts
set status = 'active', adult_attested_at = now()
where auth_user_id in (:'reporter'::uuid, :'reported'::uuid, :'admin'::uuid);

with rep as (
  insert into public.reports (
    reporter_account_id,
    reported_account_id,
    category,
    description,
    status,
    severity
  )
  select reporter.id, reported.id, 'spam', 'Release eligibility test report', 'case_opened', 'p2'
  from public.accounts reporter
  cross join public.accounts reported
  where reporter.auth_user_id = :'reporter'::uuid
    and reported.auth_user_id = :'reported'::uuid
  returning id
)
insert into public.moderation_cases (report_id, status, severity)
select id, 'action_taken', 'p2' from rep;

create temporary table release_test_ids as
select
  c.id as case_id,
  r.reported_account_id as subject_account_id,
  admin.id as admin_account_id
from public.moderation_cases c
join public.reports r on r.id = c.report_id
join public.accounts admin on admin.auth_user_id = :'admin'::uuid
where r.description = 'Release eligibility test report'
limit 1;

select is(
  public.moderation_case_release_eligible(
    (select case_id from release_test_ids)
  ),
  false,
  'an open case without a successful appeal or expired penalty is not releasable'
);

insert into public.moderation_actions (
  case_id,
  action_type,
  subject_account_id,
  reason_code,
  expires_at,
  created_by_account_id
)
select
  case_id,
  'suspend',
  subject_account_id,
  'release-test-expired',
  now() - interval '1 minute',
  admin_account_id
from release_test_ids;

select is(
  public.moderation_case_release_eligible(
    (select case_id from release_test_ids)
  ),
  true,
  'an expired penalty makes the case releasable'
);

delete from public.moderation_actions
where reason_code = 'release-test-expired';

with action as (
  insert into public.moderation_actions (
    case_id,
    action_type,
    subject_account_id,
    reason_code,
    expires_at,
    created_by_account_id
  )
  select
    case_id,
    'suspend',
    subject_account_id,
    'release-test-appeal',
    now() + interval '7 days',
    admin_account_id
  from release_test_ids
  returning id, subject_account_id
)
insert into public.appeals (
  moderation_action_id,
  appellant_account_id,
  body,
  status
)
select
  id,
  subject_account_id,
  'The action was reversed after review.',
  'reversed'
from action;

select is(
  public.moderation_case_release_eligible(
    (select case_id from release_test_ids)
  ),
  true,
  'a reversed action after appeal makes the case releasable'
);

select * from finish();
rollback;
