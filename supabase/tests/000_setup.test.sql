create extension if not exists pgtap with schema extensions;

create schema if not exists tests;

grant usage on schema tests to authenticated, anon, service_role;
grant execute on all functions in schema tests to authenticated, service_role;

create or replace function tests.set_auth(user_id uuid)
returns void
language plpgsql
as $$
begin
  perform set_config('request.jwt.claims', json_build_object('sub', user_id::text)::text, true);
  perform set_config('request.jwt.claim.sub', user_id::text, true);
  perform set_config('role', 'authenticated', true);
end;
$$;

create or replace function tests.clear_auth()
returns void
language plpgsql
as $$
begin
  perform set_config('request.jwt.claims', '', true);
  perform set_config('request.jwt.claim.sub', '', true);
  perform set_config('role', 'anon', true);
end;
$$;

begin;
select plan(1);
select pass('test helpers installed');
select * from finish();
rollback;
