begin;
-- SL-T026:db @p1
select plan(6);

select is(
  (select count(*)::int from public.games where is_active = true),
  150,
  'catalog has 150 active games'
);

select is(
  (select count(*)::int from public.games where is_anchor = true),
  8,
  'catalog retains 8 anchor games'
);

select ok(
  (select count(*) = 8 from public.games where is_anchor = true and slug in (
    'fortnite', 'minecraft', 'rocket-league', 'call-of-duty',
    'apex-legends', 'destiny-2', 'overwatch-2', 'valorant'
  )),
  'anchor slugs match expected set'
);

select ok(
  not exists (
    select 1 from public.games g
    left join public.game_platforms gp on gp.game_id = g.id
    where g.is_active = true and gp.game_id is null
  ),
  'every active game has at least one platform'
);

select ok(
  (select count(*)::int from public.crossplay_sets) >= 8,
  'crossplay sets exist for anchor titles'
);

select ok(
  (select count(distinct slug)::int from public.games) = 150,
  'game slugs are unique'
);

select * from finish();
rollback;
