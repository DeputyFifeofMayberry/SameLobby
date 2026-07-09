begin;
select plan(3);

select tests.set_auth('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'::uuid);

select lives_ok(
  $$ select public.set_catalog_game_platforms(
       (select id from public.games where slug = 'halo-infinite'),
       array[
         (select id from public.platforms where slug = 'pc'),
         (select id from public.platforms where slug = 'xbox')
       ]::uuid[]
     ) $$,
  'catalog-scoped admin can replace game platforms'
);

select is(
  (
    select count(*)::int
    from public.game_platforms gp
    join public.games g on g.id = gp.game_id
    where g.slug = 'halo-infinite'
  ),
  2,
  'catalog platform replacement persists the selected set'
);

select tests.set_auth('d1111111-1111-1111-1111-111111111111'::uuid);

select throws_ok(
  $$ select public.set_catalog_game_platforms(
       (select id from public.games where slug = 'halo-infinite'),
       array[(select id from public.platforms where slug = 'pc')]::uuid[]
     ) $$,
  'P0001',
  'forbidden',
  'non-admin cannot edit catalog game platforms'
);

select * from finish();
rollback;
