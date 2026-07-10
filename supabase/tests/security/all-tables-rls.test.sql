-- SL-T109:db @p0
begin;

\ir relation_security_expectations.inc

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

create or replace function _test.auth_policy_ops(p_relation text)
returns text
language sql
stable
as $$
  select nullif(
    string_agg(
      distinct case when cmd = '*' then 'all' else lower(cmd) end,
      ',' order by case when cmd = '*' then 'all' else lower(cmd) end
    ),
    ''
  )
  from pg_policies
  where schemaname = 'public'
    and tablename = p_relation
    and 'authenticated' = any (roles);
$$;

select plan(7);

select is(
  (
    select count(*)::int
    from pg_class c
    join pg_namespace n on n.oid = c.relnamespace
    where n.nspname = 'public'
      and c.relkind = 'r'
      and not c.relispartition
      and c.relname not in (
        select relation from _test.relation_security_expectations
      )
  ),
  0,
  'no unclassified public relations'
);

select is(
  (
    select count(*)::int
    from _test.relation_security_expectations e
    join pg_class c on c.relname = e.relation
    join pg_namespace n on n.oid = c.relnamespace and n.nspname = 'public'
    where e.classification <> 'internal_no_rls'
      and not c.relrowsecurity
  ),
  0,
  'RLS enabled on all classified relations except internal_no_rls'
);

select is(
  (
    select count(*)::int
    from _test.relation_security_expectations e
    join pg_class c on c.relname = e.relation
    join pg_namespace n on n.oid = c.relnamespace and n.nspname = 'public'
    where e.classification = 'internal_no_rls'
      and c.relrowsecurity
  ),
  0,
  'internal_no_rls relations have RLS disabled'
);

select set_eq(
  $$
  select e.relation || ':' || coalesce(_test.dml_grants(e.relation, 'anon'), '')
  from _test.relation_security_expectations e
  order by e.relation
  $$,
  $$
  select relation || ':' || coalesce(nullif(anon_grants, ''), '')
  from _test.relation_security_expectations
  order by relation
  $$,
  'anon DML grants match manifest'
);

select set_eq(
  $$
  select e.relation || ':' || coalesce(_test.dml_grants(e.relation, 'authenticated'), '')
  from _test.relation_security_expectations e
  order by e.relation
  $$,
  $$
  select relation || ':' || coalesce(nullif(authenticated_grants, ''), '')
  from _test.relation_security_expectations
  order by relation
  $$,
  'authenticated DML grants match manifest'
);

select set_eq(
  $$
  select e.relation || ':' || coalesce(_test.auth_policy_ops(e.relation), '')
  from _test.relation_security_expectations e
  where coalesce(e.policy_ops, '') <> ''
  order by e.relation
  $$,
  $$
  select relation || ':' || policy_ops
  from _test.relation_security_expectations
  where coalesce(policy_ops, '') <> ''
  order by relation
  $$,
  'authenticated policy operations match manifest'
);

select set_eq(
  $$
  select e.relation || ':' || coalesce(_test.dml_grants(e.relation, 'service_role'), '')
  from _test.relation_security_expectations e
  where coalesce(e.service_role_grants, '') <> ''
  order by e.relation
  $$,
  $$
  select relation || ':' || service_role_grants
  from _test.relation_security_expectations
  where coalesce(service_role_grants, '') <> ''
  order by relation
  $$,
  'service_role DML grants match manifest where specified'
);

select * from finish();
rollback;
