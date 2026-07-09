begin;
select plan(2);

\set subject 'f1111111-1111-1111-1111-111111111111'
\set reviewer 'f2222222-2222-2222-2222-222222222222'

insert into auth.users (id, email, encrypted_password, email_confirmed_at, created_at, updated_at, instance_id, aud, role)
values
  (:'subject', 'appeal-subject@test.local', crypt('test', gen_salt('bf')), now(), now(), now(), '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated'),
  (:'reviewer', 'appeal-reviewer@test.local', crypt('test', gen_salt('bf')), now(), now(), now(), '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated')
on conflict (id) do nothing;

insert into auth.identities (id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at)
values
  (:'subject', :'subject', jsonb_build_object('sub', :'subject', 'email', 'appeal-subject@test.local'), 'email', :'subject', now(), now(), now()),
  (:'reviewer', :'reviewer', jsonb_build_object('sub', :'reviewer', 'email', 'appeal-reviewer@test.local'), 'email', :'reviewer', now(), now(), now())
on conflict (id) do nothing;

update public.accounts
set status = 'active', adult_attested_at = now()
where auth_user_id in (:'subject'::uuid, :'reviewer'::uuid);

insert into public.admin_users (account_id, scopes, mfa_enrolled_at)
select id, array['safety_review']::text[], now()
from public.accounts
where auth_user_id = :'reviewer'::uuid
on conflict (account_id) do update set scopes = excluded.scopes;

with rep as (
  insert into public.reports (
    reporter_account_id,
    reported_account_id,
    category,
    description,
    status,
    severity
  )
  select reviewer.id, subject.id, 'harassment', 'Test harassment report', 'case_opened', 'p1'
  from public.accounts reviewer
  cross join public.accounts subject
  where reviewer.auth_user_id = :'reviewer'::uuid
    and subject.auth_user_id = :'subject'::uuid
  returning id
),
new_case as (
  insert into public.moderation_cases (report_id, status, severity)
  select id, 'action_taken', 'p1' from rep
  returning id
),
action_row as (
  insert into public.moderation_actions (
    case_id,
    action_type,
    subject_account_id,
    reason_code,
    appeal_deadline_at,
    created_by_account_id
  )
  select
    new_case.id,
    'warn',
    subject.id,
    'policy_violation',
    now() + interval '30 days',
    reviewer.id
  from new_case
  cross join public.accounts subject
  where subject.auth_user_id = :'subject'::uuid
  returning id
)
select 1 from action_row;

select tests.set_auth(:'subject'::uuid);

select lives_ok(
  $$ select public.submit_appeal(
       (select ma.id
        from public.moderation_actions ma
        join public.accounts a on a.id = ma.subject_account_id
        where a.auth_user_id = 'f1111111-1111-1111-1111-111111111111'::uuid
        limit 1),
       'I disagree with this warning'
     ) $$,
  'subject can submit one appeal'
);

select throws_ok(
  $$ select public.submit_appeal(
       (select ma.id
        from public.moderation_actions ma
        join public.accounts a on a.id = ma.subject_account_id
        where a.auth_user_id = 'f1111111-1111-1111-1111-111111111111'::uuid
        limit 1),
       'Duplicate appeal attempt'
     ) $$,
  '23505',
  null,
  'second appeal on same action is rejected'
);

select * from finish();
rollback;
