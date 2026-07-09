begin;
select plan(3);

create temporary table release_test_ids as
select
  c.id as case_id,
  r.reported_account_id as subject_account_id,
  (
    select id
    from public.accounts
    where auth_user_id = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'
  ) as admin_account_id
from public.moderation_cases c
join public.reports r on r.id = c.report_id
where r.description = 'Seed report for admin queue smoke test'
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
