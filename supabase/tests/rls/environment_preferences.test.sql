begin;
create extension if not exists pgtap with schema extensions;

select plan(2);

\set user_a 'e3333333-3333-3333-3333-333333333333'
\set user_b 'e4444444-4444-4444-4444-444444444444'

select tests.as_postgres();

insert into auth.users (id, email, encrypted_password, email_confirmed_at, created_at, updated_at, instance_id, aud, role)
values
  (:'user_a', 'env-a@test.local', crypt('test', gen_salt('bf')), now(), now(), now(), '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated'),
  (:'user_b', 'env-b@test.local', crypt('test', gen_salt('bf')), now(), now(), now(), '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated')
on conflict (id) do nothing;

insert into public.environment_preferences (account_id, boundaries, accommodation_notes)
select id, 'No late nights', 'Prefer text-first'
from public.accounts where auth_user_id = :'user_a'::uuid;

select tests.set_auth(:'user_b');

select results_eq(
  $$ select count(*)::int from public.environment_preferences $$,
  ARRAY[0],
  'User B cannot read other environment preferences'
);

select tests.set_auth(:'user_a');

select results_eq(
  $$ select count(*)::int from public.environment_preferences where boundaries = 'No late nights' $$,
  ARRAY[1],
  'User A can read own environment preferences'
);

select * from finish();
rollback;
