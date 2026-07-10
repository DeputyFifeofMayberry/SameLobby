-- SL-T109:db @p0 — service_role fixture grant allowlist (migrations 20260718050000 + 20260719010000)
begin;

\ir relation_security_expectations.inc

select plan(8);

create temporary table expected_service_role_grants (
  relation text primary key,
  grants text not null
);

insert into expected_service_role_grants (relation, grants)
select relation, service_role_grants
from _test.relation_security_expectations
where coalesce(service_role_grants, '') <> '';

create or replace function _test.dml_grants(p_relation text, p_role name)
returns text
language sql
stable
as $$
  select nullif(
    string_agg(distinct lower(g.privilege_type), ',' order by lower(g.privilege_type)),
    ''
  )
  from information_schema.role_table_grants g
  where g.table_schema = 'public'
    and g.table_name = p_relation
    and g.grantee = p_role
    and g.privilege_type in ('SELECT', 'INSERT', 'UPDATE', 'DELETE');
$$;

select set_eq(
  $$
  select e.relation || ':' || coalesce(_test.dml_grants(e.relation, 'service_role'), '')
  from expected_service_role_grants e
  order by e.relation
  $$,
  $$
  select relation || ':' || grants
  from expected_service_role_grants
  order by relation
  $$,
  'service_role fixture allowlist matches integration fixture grants'
);

select is(
  (
    select count(*)::int
    from expected_service_role_grants e
    join pg_class c on c.relname = e.relation
    join pg_namespace n on n.oid = c.relnamespace and n.nspname = 'public'
    where not c.relrowsecurity
  ),
  0,
  'allowlisted relations keep RLS enabled'
);

select ok(
  has_table_privilege('service_role', 'public.accounts', 'SELECT'),
  'service_role can select accounts for fixture seeding'
);

select ok(
  has_table_privilege('service_role', 'public.accounts', 'UPDATE'),
  'service_role can update accounts for integration fixtures'
);

select ok(
  has_table_privilege('service_role', 'public.feature_flags', 'UPDATE'),
  'service_role can update feature_flags for fixture toggles'
);

select ok(
  has_table_privilege('service_role', 'public.gamer_profiles', 'UPDATE'),
  'service_role can update gamer_profiles during fixture setup'
);

select ok(
  has_table_privilege('service_role', 'public.platforms', 'SELECT'),
  'service_role can read platforms for discovery fixtures'
);

select ok(
  has_table_privilege('service_role', 'public.user_games', 'UPDATE'),
  'service_role can update user_games during fixture setup'
);

select * from finish();
rollback;
