begin;
select plan(1);

\set owner 'e5111111-1111-1111-1111-111111111111'

select tests.as_postgres();

insert into auth.users (id, email, encrypted_password, email_confirmed_at, created_at, updated_at, instance_id, aud, role)
values
  (:'owner', 'gos-owner@test.local', crypt('test', gen_salt('bf')), now(), now(), now(), '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated')
on conflict (id) do nothing;

insert into auth.identities (id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at)
values
  (:'owner', :'owner', jsonb_build_object('sub', :'owner', 'email', 'gos-owner@test.local'), 'email', :'owner', now(), now(), now())
on conflict (id) do nothing;

update public.accounts
set status = 'active', adult_attested_at = now()
where auth_user_id = :'owner'::uuid;

select tests.set_auth(:'owner'::uuid);

select lives_ok(
  $$
  with g as (
    select public.create_private_group('Open Seat Squad', 3, 'bolt', null) as id
  )
  update public.private_groups
  set status = 'active'
  where id = (select id from g);
  with g as (
    select id from public.private_groups where name = 'Open Seat Squad' limit 1
  ),
  owner_account as (
    select id from public.accounts where auth_user_id = 'e5111111-1111-1111-1111-111111111111'
  )
  insert into public.group_open_seats (
    group_id,
    created_by_account_id,
    unavailable_account_id,
    kind,
    status
  )
  select g.id, owner_account.id, owner_account.id, 'temporary', 'open'
  from g, owner_account
  $$,
  'group member can create open seat'
);

select tests.clear_auth();
select * from finish();
rollback;
