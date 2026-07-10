-- SL-T025:db @p0
begin;
select plan(6);

\set user_a 'c8111111-1111-1111-1111-111111111111'
\set user_b 'c8222222-2222-2222-2222-222222222222'

select tests.as_postgres();

insert into auth.users (id, email, encrypted_password, email_confirmed_at, created_at, updated_at, instance_id, aud, role)
values
  (:'user_a', 'matrix-a@test.local', crypt('test', gen_salt('bf')), now(), now(), now(), '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated'),
  (:'user_b', 'matrix-b@test.local', crypt('test', gen_salt('bf')), now(), now(), now(), '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated')
on conflict (id) do nothing;

insert into auth.identities (id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at)
values
  (:'user_a', :'user_a', jsonb_build_object('sub', :'user_a', 'email', 'matrix-a@test.local'), 'email', :'user_a', now(), now(), now()),
  (:'user_b', :'user_b', jsonb_build_object('sub', :'user_b', 'email', 'matrix-b@test.local'), 'email', :'user_b', now(), now(), now())
on conflict (id) do nothing;

update public.accounts
set status = 'active', adult_attested_at = now()
where auth_user_id in (:'user_a'::uuid, :'user_b'::uuid);

update public.gamer_profiles
set display_name = 'MatrixA', communication_modes = array['voice_chat']::public.communication_mode[]
where account_id = (select id from public.accounts where auth_user_id = :'user_a'::uuid);

update public.gamer_profiles
set display_name = 'MatrixB'
where account_id = (select id from public.accounts where auth_user_id = :'user_b'::uuid);

select tests.set_auth(:'user_a'::uuid);

select is(
  (select count(*)::int from public.gamer_profiles where display_name = 'MatrixA'),
  1,
  'owner reads own gamer_profile'
);

select is(
  (select count(*)::int from public.disclosure_settings ds
   join public.accounts a on a.id = ds.account_id
   where a.auth_user_id = :'user_a'::uuid),
  3,
  'owner reads own disclosure_settings rows'
);

select tests.set_auth(:'user_b'::uuid);

select is(
  (select count(*)::int from public.gamer_profiles where display_name = 'MatrixA'),
  0,
  'non-owner cannot read other gamer_profile'
);

select is(
  (select count(*)::int from public.disclosure_settings ds
   join public.accounts a on a.id = ds.account_id
   where a.auth_user_id = :'user_a'::uuid),
  0,
  'non-owner cannot read other disclosure_settings'
);

select results_eq(
  $$ with updated as (
       update public.gamer_profiles gp
       set display_name = 'Hacked'
       from public.accounts a
       where gp.account_id = a.id
         and a.auth_user_id = 'c8111111-1111-1111-1111-111111111111'::uuid
       returning 1
     ) select count(*)::int from updated $$,
  ARRAY[0],
  'non-owner cannot update other gamer_profile'
);

select tests.clear_auth();

select is(
  (select count(*)::int from public.games where slug = 'fortnite'),
  1,
  'anonymous user can read catalog for profile context'
);

select * from finish();
rollback;
