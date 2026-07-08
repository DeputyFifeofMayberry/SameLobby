begin;
select plan(2);

\set reporter 'c1111111-1111-1111-1111-111111111111'
\set reported 'c2222222-2222-2222-2222-222222222222'

insert into auth.users (id, email, encrypted_password, email_confirmed_at, created_at, updated_at, instance_id, aud, role)
values
  (:'reporter', 'report-reporter@test.local', crypt('test', gen_salt('bf')), now(), now(), now(), '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated'),
  (:'reported', 'report-reported@test.local', crypt('test', gen_salt('bf')), now(), now(), now(), '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated')
on conflict (id) do nothing;

insert into auth.identities (id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at)
values
  (:'reporter', :'reporter', jsonb_build_object('sub', :'reporter', 'email', 'report-reporter@test.local'), 'email', :'reporter', now(), now(), now()),
  (:'reported', :'reported', jsonb_build_object('sub', :'reported', 'email', 'report-reported@test.local'), 'email', :'reported', now(), now(), now())
on conflict (id) do nothing;

update public.accounts
set status = 'active', adult_attested_at = now()
where auth_user_id in (:'reporter'::uuid, :'reported'::uuid);

select tests.set_auth(:'reporter'::uuid);

insert into public.reports (
  reporter_account_id,
  reported_account_id,
  category,
  description
)
select r.id, t.id, 'spam', 'Repeated unwanted messages in chat'
from public.accounts r
cross join public.accounts t
where r.auth_user_id = :'reporter'::uuid
  and t.auth_user_id = :'reported'::uuid;

select is(
  (select count(*)::int from public.reports where reporter_account_id = (
    select id from public.accounts where auth_user_id = :'reporter'::uuid
  )),
  1,
  'reporter can insert own report'
);

select tests.set_auth(:'reported'::uuid);

select is(
  (select count(*)::int from public.reports),
  0,
  'reported user cannot read reports'
);

select * from finish();
rollback;
