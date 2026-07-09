begin;
select plan(3);

\set reporter 'e1111111-1111-1111-1111-111111111111'
\set reported 'e2222222-2222-2222-2222-222222222222'
\set bystander 'e3333333-3333-3333-3333-333333333333'
\set admin_user 'e4444444-4444-4444-4444-444444444444'

insert into auth.users (id, email, encrypted_password, email_confirmed_at, created_at, updated_at, instance_id, aud, role)
values
  (:'reporter', 'ev-reporter@test.local', crypt('test', gen_salt('bf')), now(), now(), now(), '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated'),
  (:'reported', 'ev-reported@test.local', crypt('test', gen_salt('bf')), now(), now(), now(), '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated'),
  (:'bystander', 'ev-bystander@test.local', crypt('test', gen_salt('bf')), now(), now(), now(), '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated'),
  (:'admin_user', 'ev-admin@test.local', crypt('test', gen_salt('bf')), now(), now(), now(), '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated')
on conflict (id) do nothing;

insert into auth.identities (id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at)
values
  (:'reporter', :'reporter', jsonb_build_object('sub', :'reporter', 'email', 'ev-reporter@test.local'), 'email', :'reporter', now(), now(), now()),
  (:'reported', :'reported', jsonb_build_object('sub', :'reported', 'email', 'ev-reported@test.local'), 'email', :'reported', now(), now(), now()),
  (:'bystander', :'bystander', jsonb_build_object('sub', :'bystander', 'email', 'ev-bystander@test.local'), 'email', :'bystander', now(), now(), now()),
  (:'admin_user', :'admin_user', jsonb_build_object('sub', :'admin_user', 'email', 'ev-admin@test.local'), 'email', :'admin_user', now(), now(), now())
on conflict (id) do nothing;

update public.accounts
set status = 'active', adult_attested_at = now()
where auth_user_id in (:'reporter'::uuid, :'reported'::uuid, :'bystander'::uuid, :'admin_user'::uuid);

insert into public.admin_users (account_id, scopes, mfa_enrolled_at)
select id, array['safety_review']::text[], now()
from public.accounts
where auth_user_id = :'admin_user'::uuid
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
  select r.id, t.id, 'spam', 'Unwanted messages in chat', 'case_opened', 'p3'
  from public.accounts r
  cross join public.accounts t
  where r.auth_user_id = :'reporter'::uuid
    and t.auth_user_id = :'reported'::uuid
  returning id
),
new_case as (
  insert into public.moderation_cases (report_id, status, severity)
  select id, 'open', 'p3' from rep
  returning id
)
insert into public.moderation_evidence (case_id, kind, body)
select id, 'report_description', 'Reporter says spam in chat'
from new_case;

select tests.set_auth(:'bystander'::uuid);

select is(
  (select count(*)::int from public.moderation_evidence),
  0,
  'non-admin cannot read moderation evidence'
);

select tests.set_auth(:'reporter'::uuid);

select is(
  (select count(*)::int from public.moderation_evidence),
  0,
  'reporter cannot read moderation evidence'
);

select tests.set_auth(:'admin_user'::uuid);

select is(
  (select count(*)::int from public.moderation_evidence),
  1,
  'safety_review admin can read case-scoped evidence'
);

select * from finish();
rollback;
