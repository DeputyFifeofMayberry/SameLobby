begin;
select plan(1);

select tests.as_postgres();

insert into public.audit_events (action, resource_type, resource_id, metadata)
values ('test.immutable', 'test', '1', '{}'::jsonb);

select tests.set_auth('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'::uuid);

select throws_ok(
  $$ update public.audit_events set action = 'tampered' where action = 'test.immutable' $$,
  '42501',
  null,
  'audit events cannot be updated by default roles'
);

select * from finish();
rollback;
