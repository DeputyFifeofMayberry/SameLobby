-- SL-T019:db @p0
begin;
select plan(5);

\set user_a 'c9111111-1111-1111-1111-111111111111'
\set user_b 'c9222222-2222-2222-2222-222222222222'

select tests.as_postgres();

insert into auth.users (id, email, encrypted_password, email_confirmed_at, created_at, updated_at, instance_id, aud, role)
values
  (:'user_a', 'ug-a@test.local', crypt('test', gen_salt('bf')), now(), now(), now(), '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated'),
  (:'user_b', 'ug-b@test.local', crypt('test', gen_salt('bf')), now(), now(), now(), '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated')
on conflict (id) do nothing;

insert into auth.identities (id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at)
values
  (:'user_a', :'user_a', jsonb_build_object('sub', :'user_a', 'email', 'ug-a@test.local'), 'email', :'user_a', now(), now(), now()),
  (:'user_b', :'user_b', jsonb_build_object('sub', :'user_b', 'email', 'ug-b@test.local'), 'email', :'user_b', now(), now(), now())
on conflict (id) do nothing;

update public.accounts
set status = 'active', adult_attested_at = now()
where auth_user_id in (:'user_a'::uuid, :'user_b'::uuid);

select tests.set_auth(:'user_a'::uuid);

select lives_ok(
  $$
  insert into public.user_games (account_id, game_id, platform_id, is_active, sort_order)
  select a.id, g.id, p.id, true, 0
  from public.accounts a
  cross join public.games g
  cross join public.platforms p
  where a.auth_user_id = 'c9111111-1111-1111-1111-111111111111'::uuid
    and g.slug = 'fortnite'
    and p.slug = 'pc'
  on conflict (account_id, game_id, platform_id) do update set is_active = true
  $$,
  'owner can upsert own user_games row'
);

select is(
  (
    select count(*)::int
    from public.user_games ug
    join public.accounts a on a.id = ug.account_id
    where a.auth_user_id = :'user_a'::uuid
  ),
  1,
  'owner sees own user_games'
);

select tests.set_auth(:'user_b'::uuid);

select is(
  (
    select count(*)::int
    from public.user_games ug
    join public.accounts a on a.id = ug.account_id
    where a.auth_user_id = :'user_a'::uuid
  ),
  0,
  'other user cannot read user_games'
);

select results_eq(
  $$ with deleted as (
       delete from public.user_games ug
       using public.accounts a
       where ug.account_id = a.id
         and a.auth_user_id = 'c9111111-1111-1111-1111-111111111111'::uuid
       returning 1
     ) select count(*)::int from deleted $$,
  ARRAY[0],
  'other user cannot delete user_games'
);

select tests.set_auth(:'user_a'::uuid);

select lives_ok(
  $$
  update public.user_games ug
  set sort_order = 1
  from public.accounts a
  where ug.account_id = a.id
    and a.auth_user_id = 'c9111111-1111-1111-1111-111111111111'::uuid
  $$,
  'owner can update own user_games'
);

select * from finish();
rollback;
