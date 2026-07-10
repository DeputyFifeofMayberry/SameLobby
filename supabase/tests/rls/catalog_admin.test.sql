begin;
select plan(3);

\set admin 'e1111111-1111-1111-1111-111111111111'
\set outsider 'e2222222-2222-2222-2222-222222222222'

select tests.as_postgres();

insert into auth.users (id, email, encrypted_password, email_confirmed_at, created_at, updated_at, instance_id, aud, role)
values
  (:'admin', 'catalog-admin@test.local', crypt('test', gen_salt('bf')), now(), now(), now(), '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated'),
  (:'outsider', 'catalog-outsider@test.local', crypt('test', gen_salt('bf')), now(), now(), now(), '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated')
on conflict (id) do nothing;

insert into auth.identities (id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at)
values
  (:'admin', :'admin', jsonb_build_object('sub', :'admin', 'email', 'catalog-admin@test.local'), 'email', :'admin', now(), now(), now()),
  (:'outsider', :'outsider', jsonb_build_object('sub', :'outsider', 'email', 'catalog-outsider@test.local'), 'email', :'outsider', now(), now(), now())
on conflict (id) do nothing;

update public.accounts
set status = 'active', adult_attested_at = now()
where auth_user_id in (:'admin'::uuid, :'outsider'::uuid);

insert into public.admin_users (account_id, scopes, mfa_enrolled_at)
select id, array['catalog']::text[], now()
from public.accounts
where auth_user_id = :'admin'::uuid
on conflict (account_id) do update
  set scopes = excluded.scopes,
      disabled_at = null;

select tests.set_auth(:'admin'::uuid);

select lives_ok(
  $$ select public.set_catalog_game_platforms(
       (select id from public.games where slug = 'halo-infinite'),
       array[
         (select id from public.platforms where slug = 'pc'),
         (select id from public.platforms where slug = 'xbox')
       ]::uuid[]
     ) $$,
  'catalog-scoped admin can replace game platforms'
);

select is(
  (
    select count(*)::int
    from public.game_platforms gp
    join public.games g on g.id = gp.game_id
    where g.slug = 'halo-infinite'
  ),
  2,
  'catalog platform replacement persists the selected set'
);

select tests.set_auth(:'outsider'::uuid);

select throws_ok(
  $$ select public.set_catalog_game_platforms(
       (select id from public.games where slug = 'halo-infinite'),
       array[(select id from public.platforms where slug = 'pc')]::uuid[]
     ) $$,
  'P0001',
  'forbidden',
  'non-admin cannot edit catalog game platforms'
);

select * from finish();
rollback;
