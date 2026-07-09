begin;
select plan(2);

update public.feature_flags
set enabled = true,
    metadata = jsonb_build_object(
      'max_accounts',
      (select count(*)::int + 1 from public.accounts where status <> 'deleted')
    )
where key = 'registration_cap';

select lives_ok(
  $$ insert into auth.users (
       id, email, encrypted_password, email_confirmed_at, created_at, updated_at,
       instance_id, aud, role
     )
     values (
       'ca000000-0000-0000-0000-000000000001',
       'cap-one@test.local',
       crypt('test', gen_salt('bf')),
       now(), now(), now(),
       '00000000-0000-0000-0000-000000000000',
       'authenticated', 'authenticated'
     ) $$,
  'the final account below the cap can be created'
);

select throws_ok(
  $$ insert into auth.users (
       id, email, encrypted_password, email_confirmed_at, created_at, updated_at,
       instance_id, aud, role
     )
     values (
       'ca000000-0000-0000-0000-000000000002',
       'cap-two@test.local',
       crypt('test', gen_salt('bf')),
       now(), now(), now(),
       '00000000-0000-0000-0000-000000000000',
       'authenticated', 'authenticated'
     ) $$,
  'P0001',
  'registration cap reached',
  'account creation is rejected once the cap is reached'
);

select * from finish();
rollback;
