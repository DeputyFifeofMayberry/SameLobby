begin;
select plan(2);

\set user_a 'e3333333-3333-3333-3333-333333333333'

select tests.as_postgres();

insert into auth.users (id, email, encrypted_password, email_confirmed_at, created_at, updated_at, instance_id, aud, role)
values
  (:'user_a', 'webhook-test@test.local', crypt('test', gen_salt('bf')), now(), now(), now(), '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated')
on conflict (id) do nothing;

insert into auth.identities (id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at)
values
  (:'user_a', :'user_a', jsonb_build_object('sub', :'user_a', 'email', 'webhook-test@test.local'), 'email', :'user_a', now(), now(), now())
on conflict (id) do nothing;

select tests.set_auth(:'user_a'::uuid);

select is(
  (select count(*)::int from public.stripe_webhook_events),
  0,
  'authenticated users cannot read webhook events'
);

select throws_ok(
  $$ insert into public.stripe_webhook_events (stripe_event_id, event_type)
     values ('evt_test', 'checkout.session.completed') $$,
  '42501',
  null,
  'authenticated users cannot insert webhook events'
);

select * from finish();
rollback;
