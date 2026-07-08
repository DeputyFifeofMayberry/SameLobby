begin;
create extension if not exists pgtap with schema extensions;

select plan(3);

\set user_a 'e1111111-1111-1111-1111-111111111111'
\set user_b 'e2222222-2222-2222-2222-222222222222'

insert into auth.users (id, email, encrypted_password, email_confirmed_at, created_at, updated_at, instance_id, aud, role)
values
  (:'user_a', 'profile-a@test.local', crypt('test', gen_salt('bf')), now(), now(), now(), '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated'),
  (:'user_b', 'profile-b@test.local', crypt('test', gen_salt('bf')), now(), now(), now(), '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated')
on conflict (id) do nothing;

insert into auth.identities (id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at)
values
  (:'user_a', :'user_a', jsonb_build_object('sub', :'user_a', 'email', 'profile-a@test.local'), 'email', :'user_a', now(), now(), now()),
  (:'user_b', :'user_b', jsonb_build_object('sub', :'user_b', 'email', 'profile-b@test.local'), 'email', :'user_b', now(), now(), now())
on conflict (id) do nothing;

update public.gamer_profiles
set display_name = 'PlayerA', communication_modes = array['voice_chat']::public.communication_mode[]
where account_id = (select id from public.accounts where auth_user_id = :'user_a'::uuid);

update public.gamer_profiles
set display_name = 'PlayerB'
where account_id = (select id from public.accounts where auth_user_id = :'user_b'::uuid);

select tests.set_auth(:'user_a');

select results_eq(
  $$ select count(*)::int from public.gamer_profiles where display_name = 'PlayerA' $$,
  ARRAY[1],
  'User A can read own gamer profile'
);

select tests.set_auth(:'user_b');

select results_eq(
  $$ select count(*)::int from public.gamer_profiles where display_name = 'PlayerA' $$,
  ARRAY[0],
  'User B cannot read User A gamer profile'
);

select tests.clear_auth();

select results_eq(
  $$ select count(*)::int from public.games where slug = 'fortnite' $$,
  ARRAY[1],
  'Anonymous user can read catalog games'
);

select * from finish();
rollback;
