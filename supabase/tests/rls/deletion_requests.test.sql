begin;
create extension if not exists pgtap with schema extensions;

select plan(3);

\set user_a 'd6666666-6666-6666-6666-666666666666'
\set user_b 'd7777777-7777-7777-7777-777777777777'

insert into auth.users (id, email, encrypted_password, email_confirmed_at, created_at, updated_at, instance_id, aud, role)
values
  (:'user_a', 'delete-a@test.local', crypt('TestPass123!', gen_salt('bf')), now(), now(), now(), '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated'),
  (:'user_b', 'delete-b@test.local', crypt('TestPass123!', gen_salt('bf')), now(), now(), now(), '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated')
on conflict (id) do nothing;

select tests.set_auth(:'user_a');

select lives_ok(
  $$ insert into public.deletion_requests (account_id, status, scheduled_purge_at)
     select id, 'requested', now() + interval '30 days'
     from public.accounts where auth_user_id = 'd6666666-6666-6666-6666-666666666666'::uuid $$,
  'User A can insert own deletion request'
);

select throws_ok(
  $$ insert into public.deletion_requests (account_id, status, scheduled_purge_at)
     select id, 'requested', now() + interval '30 days'
     from public.accounts where auth_user_id = 'd6666666-6666-6666-6666-666666666666'::uuid $$,
  '23505',
  null,
  'Duplicate active deletion request is rejected'
);

select tests.set_auth(:'user_b');

select results_eq(
  $$ with inserted as (
       insert into public.deletion_requests (account_id, status, scheduled_purge_at)
       select id, 'requested', now() + interval '30 days'
       from public.accounts where auth_user_id = 'd6666666-6666-6666-6666-666666666666'::uuid
       returning 1
     ) select count(*)::int from inserted $$,
  ARRAY[0],
  'User B cannot insert deletion request for User A'
);

select * from finish();
rollback;
