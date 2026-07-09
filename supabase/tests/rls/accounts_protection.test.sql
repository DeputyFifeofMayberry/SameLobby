begin;
create extension if not exists pgtap with schema extensions;

select plan(1);

\set user_onboarding 'a9333333-3333-3333-3333-333333333333'

select tests.as_postgres();

insert into auth.users (id, email, encrypted_password, email_confirmed_at, created_at, updated_at, instance_id, aud, role)
values
  (:'user_onboarding', 'protection-onboarding@test.local', crypt('TestPass123!', gen_salt('bf')), now(), now(), now(), '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated')
on conflict (id) do nothing;

select tests.set_auth(:'user_onboarding');

select throws_ok(
  $$ update public.accounts set status = 'active' where auth_user_id = 'a9333333-3333-3333-3333-333333333333'::uuid $$,
  '42501',
  'protected account fields cannot be updated directly',
  'Authenticated user cannot self-escalate onboarding to active'
);

select * from finish();
rollback;
