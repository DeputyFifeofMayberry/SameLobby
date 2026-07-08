begin;
create extension if not exists pgtap with schema extensions;

select plan(4);

-- Synthetic auth user IDs (no auth.users row required for SELECT policy tests)
\set user_a 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'
\set user_b 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb'

insert into auth.users (id, email, encrypted_password, email_confirmed_at, created_at, updated_at, instance_id, aud, role)
values
  (:'user_a', 'synthetic-a@test.local', crypt('test', gen_salt('bf')), now(), now(), now(), '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated'),
  (:'user_b', 'synthetic-b@test.local', crypt('test', gen_salt('bf')), now(), now(), now(), '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated')
on conflict (id) do nothing;

-- Trigger creates accounts rows
select tests.set_auth(:'user_a');

select results_eq(
  $$ select count(*)::int from public.accounts where auth_user_id = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'::uuid $$,
  ARRAY[1],
  'User A can read own account'
);

select tests.set_auth(:'user_b');

select results_eq(
  $$ select count(*)::int from public.accounts where auth_user_id = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'::uuid $$,
  ARRAY[0],
  'User B cannot read User A account'
);

select tests.set_auth(:'user_a');

select lives_ok(
  $$ update public.accounts set locale = 'en-US' where auth_user_id = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'::uuid $$,
  'User A can update own account'
);

select tests.set_auth(:'user_b');

select results_eq(
  $$ with updated as (
       update public.accounts set locale = 'en-GB'
       where auth_user_id = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'::uuid
       returning 1
     ) select count(*)::int from updated $$,
  ARRAY[0],
  'User B cannot update User A account'
);

select * from finish();
rollback;
