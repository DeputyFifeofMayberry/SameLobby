begin;
create extension if not exists pgtap with schema extensions;

select plan(4);

\set user_a 'd1111111-1111-1111-1111-111111111111'
\set user_b 'd2222222-2222-2222-2222-222222222222'

insert into auth.users (id, email, encrypted_password, email_confirmed_at, created_at, updated_at, instance_id, aud, role)
values
  (:'user_a', 'rls-accounts-a@test.local', crypt('test', gen_salt('bf')), now(), now(), now(), '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated'),
  (:'user_b', 'rls-accounts-b@test.local', crypt('test', gen_salt('bf')), now(), now(), now(), '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated')
on conflict (id) do nothing;

select tests.set_auth(:'user_a');

select results_eq(
  $$ select count(*)::int from public.accounts where auth_user_id = 'd1111111-1111-1111-1111-111111111111'::uuid $$,
  ARRAY[1],
  'User A can read own account'
);

select tests.set_auth(:'user_b');

select results_eq(
  $$ select count(*)::int from public.accounts where auth_user_id = 'd1111111-1111-1111-1111-111111111111'::uuid $$,
  ARRAY[0],
  'User B cannot read User A account'
);

select tests.set_auth(:'user_a');

select lives_ok(
  $$ update public.accounts set locale = 'en-US' where auth_user_id = 'd1111111-1111-1111-1111-111111111111'::uuid $$,
  'User A can update own safe fields'
);

select tests.set_auth(:'user_b');

select results_eq(
  $$ with updated as (
       update public.accounts set locale = 'en-GB'
       where auth_user_id = 'd1111111-1111-1111-1111-111111111111'::uuid
       returning 1
     ) select count(*)::int from updated $$,
  ARRAY[0],
  'User B cannot update User A account'
);

select * from finish();
rollback;
