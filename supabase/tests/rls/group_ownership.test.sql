begin;
select plan(1);

\set owner 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'

select tests.set_auth(:'owner'::uuid);

select lives_ok(
  $$
  with g as (
    select public.create_private_group('Ownership Squad', 3, 'shield', null) as id
  )
  select public.transfer_private_group_ownership((select id from g))
  $$,
  'ownership transfer rpc is callable'
);

select tests.clear_auth();
select * from finish();
rollback;
