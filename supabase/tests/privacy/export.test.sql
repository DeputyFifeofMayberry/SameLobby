-- SL-T097:db @p0
begin;
select plan(4);

\set owner 'c4111111-1111-1111-1111-111111111111'
\set outsider 'c4222222-2222-2222-2222-222222222222'

select tests.as_postgres();

insert into auth.users (id, email, encrypted_password, email_confirmed_at, created_at, updated_at, instance_id, aud, role)
values
  (:'owner', 'export-owner@test.local', crypt('test', gen_salt('bf')), now(), now(), now(), '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated'),
  (:'outsider', 'export-outsider@test.local', crypt('test', gen_salt('bf')), now(), now(), now(), '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated')
on conflict (id) do nothing;

insert into auth.identities (id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at)
values
  (:'owner', :'owner', jsonb_build_object('sub', :'owner', 'email', 'export-owner@test.local'), 'email', :'owner', now(), now(), now()),
  (:'outsider', :'outsider', jsonb_build_object('sub', :'outsider', 'email', 'export-outsider@test.local'), 'email', :'outsider', now(), now(), now())
on conflict (id) do nothing;

update public.accounts
set status = 'active', adult_attested_at = now(), locale = 'en-GB', time_zone = 'Europe/London'
where auth_user_id = :'owner'::uuid;

update public.gamer_profiles
set display_name = 'ExportUser', onboarding_completed_at = now()
where account_id = (select id from public.accounts where auth_user_id = :'owner'::uuid);

insert into public.user_games (account_id, game_id, platform_id, is_active, sort_order)
select a.id, g.id, p.id, true, 0
from public.accounts a
cross join public.games g
cross join public.platforms p
where a.auth_user_id = :'owner'::uuid
  and g.slug = 'fortnite'
  and p.slug = 'pc'
on conflict (account_id, game_id, platform_id) do update set is_active = true;

select tests.set_auth(:'owner'::uuid);

select ok(
  (public.export_account_data(
    (select id from public.accounts where auth_user_id = 'c4111111-1111-1111-1111-111111111111'::uuid)
  ) ->> 'locale') = 'en-GB',
  'owner export includes account locale'
);

select ok(
  jsonb_array_length(
    public.export_account_data(
      (select id from public.accounts where auth_user_id = 'c4111111-1111-1111-1111-111111111111'::uuid)
    ) -> 'games'
  ) >= 1,
  'owner export includes active games'
);

select ok(
  (public.export_account_data(
    (select id from public.accounts where auth_user_id = 'c4111111-1111-1111-1111-111111111111'::uuid)
  ) -> 'profile' ->> 'display_name') = 'ExportUser',
  'owner export includes profile display name'
);

select tests.set_auth(:'outsider'::uuid);

select ok(
  public.export_account_data(
    (select id from public.accounts where auth_user_id = 'c4111111-1111-1111-1111-111111111111'::uuid)
  ) is null,
  'outsider export call returns no payload for another account'
);

select * from finish();
rollback;
