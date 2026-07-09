begin;
select plan(2);

\set owner 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'
\set member 'd1111111-1111-1111-1111-111111111111'

select tests.set_auth(:'owner'::uuid);

select lives_ok(
  $$
  with g as (
    select public.create_private_group('Chat Squad', 3, 'leaf', null) as id
  )
  update public.private_groups
  set status = 'active'
  where id = (select id from g);
  with g as (
    select id from public.private_groups where name = 'Chat Squad' limit 1
  )
  select public.create_conversation_for_group((select id from g))
  $$,
  'active group can get a conversation'
);

select tests.set_auth(:'member'::uuid);

select is(
  (
    select count(*)::int
    from public.conversations c
    join public.private_groups g on g.id = c.group_id
    where c.kind = 'group'
      and g.name = 'Chat Squad'
  ),
  0,
  'non-member cannot read group conversation before joining'
);

select tests.clear_auth();
select * from finish();
rollback;
