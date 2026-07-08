begin;
create extension if not exists pgtap with schema extensions;

select plan(4);

\set user_a 'd4444444-4444-4444-4444-444444444444'
\set user_b 'd5555555-5555-5555-5555-555555555555'

insert into auth.users (id, email, encrypted_password, email_confirmed_at, created_at, updated_at, instance_id, aud, role)
values
  (:'user_a', 'consent-a@test.local', crypt('TestPass123!', gen_salt('bf')), now(), now(), now(), '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated'),
  (:'user_b', 'consent-b@test.local', crypt('TestPass123!', gen_salt('bf')), now(), now(), now(), '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated')
on conflict (id) do nothing;

select tests.set_auth(:'user_a');

select results_eq(
  $$ select count(*)::int from public.consent_events ce
     join public.accounts a on a.id = ce.account_id
     where a.auth_user_id = 'd4444444-4444-4444-4444-444444444444'::uuid $$,
  ARRAY[0],
  'User A starts with no consent events'
);

select lives_ok(
  $$ insert into public.consent_events (account_id, event_type, policy_version, ip_hash, user_agent_hash)
     select id, 'terms_accepted', '2026-07-08', 'hash', 'hash'
     from public.accounts where auth_user_id = 'd4444444-4444-4444-4444-444444444444'::uuid $$,
  'User A can insert own consent event'
);

select tests.set_auth(:'user_b');

select results_eq(
  $$ with inserted as (
       insert into public.consent_events (account_id, event_type, policy_version, ip_hash, user_agent_hash)
       select id, 'terms_accepted', '2026-07-08', 'hash', 'hash'
       from public.accounts where auth_user_id = 'd4444444-4444-4444-4444-444444444444'::uuid
       returning 1
     ) select count(*)::int from inserted $$,
  ARRAY[0],
  'User B cannot insert consent for User A account'
);

select results_eq(
  $$ select count(*)::int from public.consent_events ce
     join public.accounts a on a.id = ce.account_id
     where a.auth_user_id = 'd4444444-4444-4444-4444-444444444444'::uuid $$,
  ARRAY[0],
  'User B cannot read User A consent events'
);

select * from finish();
rollback;
