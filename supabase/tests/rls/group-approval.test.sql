-- SL-T079:db @p0
begin;
select plan(5);

\set owner 'c3111111-1111-1111-1111-111111111111'
\set member 'c3222222-2222-2222-2222-222222222222'
\set invitee 'c3333333-3333-3333-3333-333333333333'

select tests.as_postgres();

insert into auth.users (id, email, encrypted_password, email_confirmed_at, created_at, updated_at, instance_id, aud, role)
values
  (:'owner', 'grp-owner@test.local', crypt('test', gen_salt('bf')), now(), now(), now(), '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated'),
  (:'member', 'grp-member@test.local', crypt('test', gen_salt('bf')), now(), now(), now(), '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated'),
  (:'invitee', 'grp-invitee@test.local', crypt('test', gen_salt('bf')), now(), now(), now(), '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated')
on conflict (id) do nothing;

insert into auth.identities (id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at)
values
  (:'owner', :'owner', jsonb_build_object('sub', :'owner', 'email', 'grp-owner@test.local'), 'email', :'owner', now(), now(), now()),
  (:'member', :'member', jsonb_build_object('sub', :'member', 'email', 'grp-member@test.local'), 'email', :'member', now(), now(), now()),
  (:'invitee', :'invitee', jsonb_build_object('sub', :'invitee', 'email', 'grp-invitee@test.local'), 'email', :'invitee', now(), now(), now())
on conflict (id) do nothing;

update public.accounts
set status = 'active', adult_attested_at = now()
where auth_user_id in (:'owner'::uuid, :'member'::uuid, :'invitee'::uuid);

select tests.set_auth(:'owner'::uuid);

select lives_ok(
  $$ select public.create_private_group('Approval Squad', 4, 'star', null) $$,
  'owner creates private group'
);

select tests.as_postgres();

insert into public.group_memberships (group_id, account_id, role, status, joined_at)
select g.id, member.id, 'member', 'active', now()
from public.private_groups g
cross join public.accounts member
where g.name = 'Approval Squad'
  and member.auth_user_id = :'member'::uuid
on conflict do nothing;

insert into public.group_invitations (
  group_id,
  inviter_account_id,
  invitee_account_id,
  status,
  expires_at
)
select
  g.id,
  owner.id,
  invitee.id,
  'pending',
  now() + interval '14 days'
from public.private_groups g
cross join public.accounts owner
cross join public.accounts invitee
where g.name = 'Approval Squad'
  and owner.auth_user_id = :'owner'::uuid
  and invitee.auth_user_id = :'invitee'::uuid;

insert into public.group_memberships (group_id, account_id, role, status)
select g.id, invitee.id, 'member', 'pending_approval'
from public.private_groups g
cross join public.accounts invitee
where g.name = 'Approval Squad'
  and invitee.auth_user_id = :'invitee'::uuid
on conflict (group_id, account_id) do update
set status = 'pending_approval', updated_at = now();

insert into public.group_invitation_approvals (invitation_id, voter_account_id, approved)
select gi.id, gm.account_id, false
from public.group_invitations gi
join public.private_groups g on g.id = gi.group_id
join public.group_memberships gm on gm.group_id = g.id
where g.name = 'Approval Squad'
  and gm.status = 'active'
  and gm.account_id <> gi.invitee_account_id
on conflict do nothing;

select tests.as_postgres();

select is(
  (
    select gm.status::text
    from public.group_memberships gm
    join public.private_groups g on g.id = gm.group_id
    join public.accounts invitee on invitee.id = gm.account_id
    where g.name = 'Approval Squad'
      and invitee.auth_user_id = :'invitee'::uuid
  ),
  'pending_approval',
  'invitee membership stays pending before approvals'
);

select tests.set_auth(:'member'::uuid);

select is(
  (
    select public.vote_group_invitation(
      (select gi.id
       from public.group_invitations gi
       join public.private_groups g on g.id = gi.group_id
       where g.name = 'Approval Squad'
       limit 1),
      true
    )
  ),
  false,
  'single member approval vote does not activate invitee in small group'
);

select tests.set_auth(:'owner'::uuid);

select is(
  (
    select public.vote_group_invitation(
      (select gi.id
       from public.group_invitations gi
       join public.private_groups g on g.id = gi.group_id
       where g.name = 'Approval Squad'
       limit 1),
      true
    )
  ),
  true,
  'remaining member approval activates invitee when threshold met'
);

select tests.as_postgres();

select is(
  (
    select gm.status::text
    from public.group_memberships gm
    join public.private_groups g on g.id = gm.group_id
    join public.accounts invitee on invitee.id = gm.account_id
    where g.name = 'Approval Squad'
      and invitee.auth_user_id = :'invitee'::uuid
  ),
  'active',
  'invitee becomes active member after approval threshold met'
);

select * from finish();
rollback;
