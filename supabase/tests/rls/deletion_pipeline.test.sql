begin;
select plan(3);

\set user_id 'a8111111-1111-1111-1111-111111111111'
\set held_user_id 'a8222222-2222-2222-2222-222222222222'

select tests.as_postgres();

insert into auth.users (id, email, encrypted_password, email_confirmed_at, created_at, updated_at, instance_id, aud, role)
values
  (:'user_id', 'delete-pipe@test.local', crypt('test', gen_salt('bf')), now(), now(), now(), '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated'),
  (:'held_user_id', 'delete-held@test.local', crypt('test', gen_salt('bf')), now(), now(), now(), '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated')
on conflict (id) do nothing;

insert into auth.identities (id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at)
values
  (:'user_id', :'user_id', jsonb_build_object('sub', :'user_id', 'email', 'delete-pipe@test.local'), 'email', :'user_id', now(), now(), now()),
  (:'held_user_id', :'held_user_id', jsonb_build_object('sub', :'held_user_id', 'email', 'delete-held@test.local'), 'email', :'held_user_id', now(), now(), now())
on conflict (id) do nothing;

update public.accounts
set status = 'deletion_pending', adult_attested_at = now()
where auth_user_id in (:'user_id'::uuid, :'held_user_id'::uuid);

insert into public.gamer_profiles (account_id, display_name, onboarding_step)
select id, 'Delete Me', 'preview'
from public.accounts
where auth_user_id in (:'user_id'::uuid, :'held_user_id'::uuid)
on conflict (account_id) do update set display_name = 'Delete Me';

insert into public.deletion_requests (account_id, status, scheduled_purge_at, requested_at)
select id, 'confirmed', now() + interval '30 days', now()
from public.accounts
where auth_user_id = :'user_id'::uuid;

select is(
  public.process_deletion_stage(5) >= 1,
  true,
  'deletion pipeline processes confirmed request'
);

select is(
  (select status::text from public.accounts where auth_user_id = :'user_id'::uuid),
  'deleted',
  'account status becomes deleted after pipeline'
);

insert into public.legal_holds (account_id, reason, active)
select id, 'Retention test hold', true
from public.accounts
where auth_user_id = :'held_user_id'::uuid;

insert into public.deletion_requests (account_id, status, scheduled_purge_at, requested_at)
select id, 'confirmed', now() + interval '30 days', now()
from public.accounts
where auth_user_id = :'held_user_id'::uuid;

select is(
  (select status::text from public.accounts where auth_user_id = :'held_user_id'::uuid),
  'deletion_pending',
  'legal hold blocks deletion pipeline from finalizing account'
);

select * from finish();
rollback;
