begin;
select plan(3);

\set owner 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'
\set member 'd1111111-1111-1111-1111-111111111111'
\set outsider 'b2222222-2222-2222-2222-222222222222'

select tests.set_auth(:'owner'::uuid);

select lives_ok(
  $$
  select public.create_private_group('Dev Squad', 4, 'star', null)
  $$,
  'owner can create private group'
);

update public.private_groups
set status = 'active'
where name = 'Dev Squad';

select tests.set_auth(:'outsider'::uuid);

select is(
  (select count(*)::int from public.private_groups),
  0,
  'non-member cannot read private group'
);

select tests.set_auth(:'owner'::uuid);

select throws_ok(
  $$ select public.create_private_group('Second Squad', 4, 'bolt', null) $$,
  null,
  null,
  'free tier blocks second active owned group'
);

select tests.clear_auth();
select * from finish();
rollback;
