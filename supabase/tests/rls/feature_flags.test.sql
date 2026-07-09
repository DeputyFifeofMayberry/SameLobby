begin;
create extension if not exists pgtap with schema extensions;

select plan(2);

select tests.clear_auth();

select results_eq(
  $$ select count(*)::int from public.feature_flags where key = 'registration_open' $$,
  ARRAY[1],
  'Anonymous user can read feature flags'
);

\set user_a 'd8888888-8888-8888-8888-888888888888'

select tests.as_postgres();

insert into auth.users (id, email, encrypted_password, email_confirmed_at, created_at, updated_at, instance_id, aud, role)
values
  (:'user_a', 'flags-a@test.local', crypt('TestPass123!', gen_salt('bf')), now(), now(), now(), '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated')
on conflict (id) do nothing;

select tests.set_auth(:'user_a');

select results_eq(
  $$ select count(*)::int from public.feature_flags where key = 'registration_open' $$,
  ARRAY[1],
  'Authenticated user can read feature flags'
);

select * from finish();
rollback;
