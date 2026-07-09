begin;
select plan(1);

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
  'audit events cannot be updated by default roles'
);

select * from finish();
rollback;
