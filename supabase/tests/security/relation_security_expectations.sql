-- SL-T109:db @p0 — relation security expectations manifest
begin;

\ir relation_security_expectations.inc

select plan(1);

select ok(
  (select count(*)::int from _test.relation_security_expectations) >= 58,
  'relation security manifest covers all public tables'
);

select * from finish();
rollback;
