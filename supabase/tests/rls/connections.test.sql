begin;
select plan(5);

\set sender 'a1111111-1111-1111-1111-111111111111'
\set recipient 'a2222222-2222-2222-2222-222222222222'

select tests.as_postgres();

insert into auth.users (id, email, encrypted_password, email_confirmed_at, created_at, updated_at, instance_id, aud, role)
values
  (:'sender', 'conn-sender@test.local', crypt('test', gen_salt('bf')), now(), now(), now(), '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated'),
  (:'recipient', 'conn-recipient@test.local', crypt('test', gen_salt('bf')), now(), now(), now(), '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated')
on conflict (id) do nothing;

insert into auth.identities (id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at)
values
  (:'sender', :'sender', jsonb_build_object('sub', :'sender', 'email', 'conn-sender@test.local'), 'email', :'sender', now(), now(), now()),
  (:'recipient', :'recipient', jsonb_build_object('sub', :'recipient', 'email', 'conn-recipient@test.local'), 'email', :'recipient', now(), now(), now())
on conflict (id) do nothing;

update public.accounts
set status = 'active', adult_attested_at = now(), locale = 'en', time_zone = 'America/Los_Angeles'
where auth_user_id in (:'sender'::uuid, :'recipient'::uuid);

select tests.as_postgres();

insert into public.connection_requests (
  sender_account_id,
  recipient_account_id,
  message,
  status,
  expires_at
)
select s.id, r.id, 'Want to play Fortnite', 'pending', now() + interval '14 days'
from public.accounts s
cross join public.accounts r
where s.auth_user_id = :'sender'::uuid
  and r.auth_user_id = :'recipient'::uuid;

select tests.set_auth(:'sender'::uuid);

select is(
  (select count(*)::int from public.connection_requests cr
   join public.accounts s on s.id = cr.sender_account_id
   where s.auth_user_id = :'sender'::uuid),
  1,
  'sender sees outgoing request'
);

select tests.set_auth(:'recipient'::uuid);

select is(
  (select count(*)::int from public.connection_requests cr
   join public.accounts r on r.id = cr.recipient_account_id
   where r.auth_user_id = :'recipient'::uuid),
  1,
  'recipient sees incoming request'
);

select lives_ok(
  $$
  select public.accept_connection_request(
    (select cr.id
     from public.connection_requests cr
     join public.accounts r on r.id = cr.recipient_account_id
     where r.auth_user_id = 'a2222222-2222-2222-2222-222222222222'::uuid
     limit 1)
  )
  $$,
  'recipient can accept pending request'
);

select is(
  (
    select count(*)::int
    from public.connections c
    join public.accounts s on s.auth_user_id = :'sender'::uuid
    join public.accounts r on r.auth_user_id = :'recipient'::uuid
    where c.user_a_id in (s.id, r.id)
      and c.user_b_id in (s.id, r.id)
  ),
  1,
  'accept creates mutual connection row'
);

select tests.as_postgres();

insert into public.blocks (blocker_account_id, blocked_account_id)
select s.id, r.id
from public.accounts s
cross join public.accounts r
where s.auth_user_id = :'recipient'::uuid
  and r.auth_user_id = :'sender'::uuid;

select tests.set_auth(:'sender'::uuid);

select results_eq(
  $$ with attempted as (
       insert into public.connection_requests (
         sender_account_id,
         recipient_account_id,
         status,
         expires_at
       )
       select s.id, r.id, 'pending', now() + interval '14 days'
       from public.accounts s
       cross join public.accounts r
       where s.auth_user_id = 'a1111111-1111-1111-1111-111111111111'::uuid
         and r.auth_user_id = 'a2222222-2222-2222-2222-222222222222'::uuid
       returning 1
     ) select count(*)::int from attempted $$,
  ARRAY[0],
  'blocked pair cannot create new request'
);

select * from finish();
rollback;
