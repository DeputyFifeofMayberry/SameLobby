begin;
create extension if not exists pgtap with schema extensions;

select plan(6);

select ok(
  (select relrowsecurity from pg_class where relname = 'accounts' and relnamespace = 'public'::regnamespace),
  'accounts has RLS enabled'
);

select ok(
  (select relrowsecurity from pg_class where relname = 'consent_events' and relnamespace = 'public'::regnamespace),
  'consent_events has RLS enabled'
);

select ok(
  (select relrowsecurity from pg_class where relname = 'admin_users' and relnamespace = 'public'::regnamespace),
  'admin_users has RLS enabled'
);

select ok(
  (select relrowsecurity from pg_class where relname = 'audit_events' and relnamespace = 'public'::regnamespace),
  'audit_events has RLS enabled'
);

select ok(
  (select relrowsecurity from pg_class where relname = 'feature_flags' and relnamespace = 'public'::regnamespace),
  'feature_flags has RLS enabled'
);

select ok(
  (select relrowsecurity from pg_class where relname = 'deletion_requests' and relnamespace = 'public'::regnamespace),
  'deletion_requests has RLS enabled'
);

select * from finish();
rollback;
