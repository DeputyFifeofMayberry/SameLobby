-- SL-T091:db @p0
begin;
select plan(5);

\set admin_user 'c5111111-1111-1111-1111-111111111111'
\set reporter 'c5222222-2222-2222-2222-222222222222'
\set reported 'c5333333-3333-3333-3333-333333333333'

select tests.as_postgres();

insert into auth.users (id, email, encrypted_password, email_confirmed_at, created_at, updated_at, instance_id, aud, role)
values
  (:'admin_user', 'admin-case@test.local', crypt('test', gen_salt('bf')), now(), now(), now(), '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated'),
  (:'reporter', 'case-reporter@test.local', crypt('test', gen_salt('bf')), now(), now(), now(), '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated'),
  (:'reported', 'case-reported@test.local', crypt('test', gen_salt('bf')), now(), now(), now(), '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated')
on conflict (id) do nothing;

insert into auth.identities (id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at)
values
  (:'admin_user', :'admin_user', jsonb_build_object('sub', :'admin_user', 'email', 'admin-case@test.local'), 'email', :'admin_user', now(), now(), now()),
  (:'reporter', :'reporter', jsonb_build_object('sub', :'reporter', 'email', 'case-reporter@test.local'), 'email', :'reporter', now(), now(), now()),
  (:'reported', :'reported', jsonb_build_object('sub', :'reported', 'email', 'case-reported@test.local'), 'email', :'reported', now(), now(), now())
on conflict (id) do nothing;

update public.accounts
set status = 'active', adult_attested_at = now()
where auth_user_id in (:'admin_user'::uuid, :'reporter'::uuid, :'reported'::uuid);

insert into public.admin_users (account_id, scopes)
select id, array['safety_review']::text[]
from public.accounts
where auth_user_id = :'admin_user'::uuid
on conflict (account_id) do update set scopes = excluded.scopes, disabled_at = null;

insert into public.reports (reporter_account_id, reported_account_id, category, description)
select reporter.id, reported.id, 'spam', 'Admin case action test'
from public.accounts reporter
cross join public.accounts reported
where reporter.auth_user_id = :'reporter'::uuid
  and reported.auth_user_id = :'reported'::uuid;

select tests.set_auth(:'reporter'::uuid);

select lives_ok(
  $$
  select public.create_moderation_case_from_report(
    (select id from public.reports
     where reporter_account_id = (
       select id from public.accounts where auth_user_id = 'c5222222-2222-2222-2222-222222222222'::uuid
     )
     limit 1)
  )
  $$,
  'reporter opens moderation case'
);

select tests.set_auth(:'admin_user'::uuid);

select lives_ok(
  $$
  select public.claim_moderation_case(
    (select mc.id
     from public.moderation_cases mc
     join public.reports r on r.id = mc.report_id
     join public.accounts reporter on reporter.id = r.reporter_account_id
     where reporter.auth_user_id = 'c5222222-2222-2222-2222-222222222222'::uuid
     limit 1)
  )
  $$,
  'safety admin can claim case'
);

select tests.as_postgres();

select set_config(
  'test.case_id',
  (select mc.id::text
   from public.moderation_cases mc
   join public.reports r on r.id = mc.report_id
   join public.accounts reporter on reporter.id = r.reporter_account_id
   where reporter.auth_user_id = 'c5222222-2222-2222-2222-222222222222'::uuid
   limit 1),
  true
);

select set_config(
  'test.subject_account_id',
  (select reported.id::text
   from public.accounts reported
   where reported.auth_user_id = 'c5333333-3333-3333-3333-333333333333'::uuid
   limit 1),
  true
);

select tests.set_auth(:'admin_user'::uuid);

select lives_ok(
  $$
  select public.apply_moderation_action(
    current_setting('test.case_id')::uuid,
    'restrict_discovery'::public.moderation_action_type,
    current_setting('test.subject_account_id')::uuid,
    'policy_violation'
  )
  $$,
  'safety admin can apply moderation action'
);

select ok(
  exists (
    select 1
    from public.moderation_actions ma
    where ma.case_id = current_setting('test.case_id')::uuid
      and ma.action_type = 'restrict_discovery'
      and ma.subject_account_id = current_setting('test.subject_account_id')::uuid
  ),
  'restrict_discovery action is recorded on the case'
);

select tests.set_auth(:'reporter'::uuid);

select throws_ok(
  $$
  select public.claim_moderation_case(
    (select mc.id
     from public.moderation_cases mc
     join public.reports r on r.id = mc.report_id
     limit 1)
  )
  $$,
  'P0001',
  null,
  'non-admin cannot claim moderation case'
);

select * from finish();
rollback;
