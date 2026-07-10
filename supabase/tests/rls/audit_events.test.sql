begin;
-- SL-T098:db @p0
select plan(3);

select tests.as_postgres();

insert into public.audit_events (action, resource_type, resource_id, metadata)
values ('test.immutable', 'test', '1', '{}'::jsonb);

select tests.set_auth('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'::uuid);

select results_eq(
  $$ with updated as (
       update public.audit_events set action = 'tampered' where action = 'test.immutable'
       returning 1
     ) select count(*)::int from updated $$,
  ARRAY[0],
  'audit events cannot be updated by authenticated role (RLS deny)'
);

select tests.as_postgres();

select ok(
  not has_table_privilege('authenticated', 'public.audit_events', 'DELETE'),
  'authenticated role lacks DELETE on audit_events'
);

select ok(
  not has_table_privilege('authenticated', 'public.audit_events', 'INSERT'),
  'authenticated role lacks INSERT on audit_events'
);

select * from finish();
rollback;
