begin;
select plan(1);

insert into public.audit_events (action, resource_type, resource_id, metadata)
values ('test.immutable', 'test', '1', '{}'::jsonb);

select throws_ok(
  $$ update public.audit_events set action = 'tampered' where action = 'test.immutable' $$,
  '42501',
  null,
  'audit events cannot be updated by default roles'
);

select * from finish();
rollback;
