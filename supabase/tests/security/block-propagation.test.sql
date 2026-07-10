-- SL-T042:db @p0
begin;
select plan(5);

\set blocker 'c7111111-1111-1111-1111-111111111111'
\set blocked 'c7222222-2222-2222-2222-222222222222'

select tests.as_postgres();

insert into auth.users (id, email, encrypted_password, email_confirmed_at, created_at, updated_at, instance_id, aud, role)
values
  (:'blocker', 'block-a@test.local', crypt('test', gen_salt('bf')), now(), now(), now(), '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated'),
  (:'blocked', 'block-b@test.local', crypt('test', gen_salt('bf')), now(), now(), now(), '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated')
on conflict (id) do nothing;

insert into auth.identities (id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at)
values
  (:'blocker', :'blocker', jsonb_build_object('sub', :'blocker', 'email', 'block-a@test.local'), 'email', :'blocker', now(), now(), now()),
  (:'blocked', :'blocked', jsonb_build_object('sub', :'blocked', 'email', 'block-b@test.local'), 'email', :'blocked', now(), now(), now())
on conflict (id) do nothing;

update public.accounts
set status = 'active', adult_attested_at = now()
where auth_user_id in (:'blocker'::uuid, :'blocked'::uuid);

select tests.set_auth(:'blocker'::uuid);

select tests.as_postgres();

select lives_ok(
  $$ insert into public.blocks (blocker_account_id, blocked_account_id)
     select blocker.id, blocked.id
     from public.accounts blocker
     cross join public.accounts blocked
     where blocker.auth_user_id = 'c7111111-1111-1111-1111-111111111111'::uuid
       and blocked.auth_user_id = 'c7222222-2222-2222-2222-222222222222'::uuid $$,
  'block row can be inserted for enforcement sync'
);

select tests.as_postgres();

select is(
  (
    select count(*)::int
    from public.block_enforcement_keys bek
    join public.accounts blocker on blocker.enforcement_key = bek.blocker_key
    join public.accounts blocked on blocked.enforcement_key = bek.blocked_key
    where blocker.auth_user_id = :'blocker'::uuid
      and blocked.auth_user_id = :'blocked'::uuid
  ),
  1,
  'block trigger syncs enforcement keys'
);

select is(
  public.accounts_blocked(
    (select id from public.accounts where auth_user_id = :'blocker'::uuid),
    (select id from public.accounts where auth_user_id = :'blocked'::uuid)
  ),
  true,
  'accounts_blocked reflects active block'
);

select tests.set_auth(:'blocked'::uuid);

select results_eq(
  $$ with attempted as (
       insert into public.connection_requests (
         sender_account_id,
         recipient_account_id,
         status,
         expires_at
       )
       select blocked.id, blocker.id, 'pending', now() + interval '14 days'
       from public.accounts blocker
       cross join public.accounts blocked
       where blocker.auth_user_id = 'c7111111-1111-1111-1111-111111111111'::uuid
         and blocked.auth_user_id = 'c7222222-2222-2222-2222-222222222222'::uuid
       returning 1
     ) select count(*)::int from attempted $$,
  ARRAY[0],
  'blocked user cannot send connection request to blocker'
);

select tests.as_postgres();

update public.accounts
set status = 'deleted', deleted_at = now()
where auth_user_id = :'blocker'::uuid;

select is(
  (
    select count(*)::int
    from public.block_enforcement_keys bek
    join public.accounts blocked on blocked.enforcement_key = bek.blocked_key
    where blocked.auth_user_id = :'blocked'::uuid
  ),
  1,
  'enforcement keys survive blocker account deletion'
);

select * from finish();
rollback;
