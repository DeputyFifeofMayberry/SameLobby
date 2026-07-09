begin;
select plan(1);

\set owner 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'

select tests.set_auth(:'owner'::uuid);

select lives_ok(
  $$
  with g as (
    select public.create_private_group('Open Seat Squad', 3, 'bolt', null) as id
  ),
  owner_account as (
    select id from public.accounts where auth_user_id = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'
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
