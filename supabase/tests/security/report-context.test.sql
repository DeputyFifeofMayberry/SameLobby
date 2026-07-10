-- SL-T087:db @p0
begin;
select plan(4);

\set reporter 'c6111111-1111-1111-1111-111111111111'
\set reported 'c6222222-2222-2222-2222-222222222222'
\set outsider 'c6333333-3333-3333-3333-333333333333'

select tests.as_postgres();

insert into auth.users (id, email, encrypted_password, email_confirmed_at, created_at, updated_at, instance_id, aud, role)
values
  (:'reporter', 'ctx-reporter@test.local', crypt('test', gen_salt('bf')), now(), now(), now(), '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated'),
  (:'reported', 'ctx-reported@test.local', crypt('test', gen_salt('bf')), now(), now(), now(), '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated'),
  (:'outsider', 'ctx-outsider@test.local', crypt('test', gen_salt('bf')), now(), now(), now(), '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated')
on conflict (id) do nothing;

insert into auth.identities (id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at)
values
  (:'reporter', :'reporter', jsonb_build_object('sub', :'reporter', 'email', 'ctx-reporter@test.local'), 'email', :'reporter', now(), now(), now()),
  (:'reported', :'reported', jsonb_build_object('sub', :'reported', 'email', 'ctx-reported@test.local'), 'email', :'reported', now(), now(), now()),
  (:'outsider', :'outsider', jsonb_build_object('sub', :'outsider', 'email', 'ctx-outsider@test.local'), 'email', :'outsider', now(), now(), now())
on conflict (id) do nothing;

update public.accounts
set status = 'active', adult_attested_at = now()
where auth_user_id in (:'reporter'::uuid, :'reported'::uuid, :'outsider'::uuid);

insert into public.connections (user_a_id, user_b_id, status)
select least(r.id, t.id), greatest(r.id, t.id), 'connected'
from public.accounts r
cross join public.accounts t
where r.auth_user_id = :'reporter'::uuid
  and t.auth_user_id = :'reported'::uuid
on conflict do nothing;

select public.create_conversation_for_connection(c.id)
from public.connections c
join public.accounts r on r.id in (c.user_a_id, c.user_b_id)
join public.accounts t on t.id in (c.user_a_id, c.user_b_id)
where r.auth_user_id = :'reporter'::uuid
  and t.auth_user_id = :'reported'::uuid
limit 1;

insert into public.messages (conversation_id, sender_account_id, body, retention_at)
select conv.id, reporter.id, 'report context message', now() + interval '12 months'
from public.conversations conv
join public.connections conn on conn.id = conv.connection_id
join public.accounts reporter on reporter.auth_user_id = :'reporter'::uuid
join public.accounts reported on reported.auth_user_id = :'reported'::uuid
where conn.user_a_id = least(reporter.id, reported.id)
  and conn.user_b_id = greatest(reporter.id, reported.id)
limit 1;

insert into public.reports (
  reporter_account_id,
  reported_account_id,
  category,
  description,
  include_message_context,
  conversation_id
)
select
  reporter.id,
  reported.id,
  'harassment',
  'Message context attached',
  true,
  conv.id
from public.accounts reporter
cross join public.accounts reported
join public.conversations conv on conv.connection_id in (
  select c.id
  from public.connections c
  join public.accounts a on a.auth_user_id = 'c6111111-1111-1111-1111-111111111111'::uuid
  join public.accounts b on b.auth_user_id = 'c6222222-2222-2222-2222-222222222222'::uuid
  where c.user_a_id = least(a.id, b.id)
    and c.user_b_id = greatest(a.id, b.id)
)
where reporter.auth_user_id = :'reporter'::uuid
  and reported.auth_user_id = :'reported'::uuid
limit 1;

select tests.set_auth(:'reporter'::uuid);

select is(
  (
    select count(*)::int
    from public.reports r
    join public.accounts reporter on reporter.id = r.reporter_account_id
    where reporter.auth_user_id = :'reporter'::uuid
  ),
  1,
  'reporter can submit report with message context flag'
);

select lives_ok(
  $$
  select public.create_moderation_case_from_report(
    (select id from public.reports
     where reporter_account_id = (
       select id from public.accounts where auth_user_id = 'c6111111-1111-1111-1111-111111111111'::uuid
     )
     order by created_at desc
     limit 1)
  )
  $$,
  'reporter can open moderation case from own report'
);

select tests.as_postgres();

select cmp_ok(
  (
    select count(*)::int
    from public.moderation_evidence me
    join public.moderation_cases mc on mc.id = me.case_id
    join public.reports r on r.id = mc.report_id
    join public.accounts reporter on reporter.id = r.reporter_account_id
    where reporter.auth_user_id = :'reporter'::uuid
      and me.kind = 'message_excerpt'
  ),
  '>=',
  1,
  'message excerpts captured as moderation evidence'
);

select tests.set_auth(:'outsider'::uuid);

select throws_ok(
  $$
  select public.create_moderation_case_from_report(
    (select id from public.reports
     where reporter_account_id = (
       select id from public.accounts where auth_user_id = 'c6111111-1111-1111-1111-111111111111'::uuid
     )
     limit 1)
  )
  $$,
  'P0001',
  null,
  'outsider cannot open case from another users report'
);

select * from finish();
rollback;
