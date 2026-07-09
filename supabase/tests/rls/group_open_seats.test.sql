begin;
select plan(1);

\set owner 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'

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
