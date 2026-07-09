-- Slice 10: moderation case internal notes + release action

create table public.moderation_case_notes (
  id uuid primary key default gen_random_uuid(),
  case_id uuid not null references public.moderation_cases (id) on delete cascade,
  author_account_id uuid not null references public.accounts (id) on delete restrict,
  body text not null,
  created_at timestamptz not null default now(),
  constraint moderation_case_notes_body_length check (
    char_length(body) >= 1 and char_length(body) <= 4000
  )
);

create index moderation_case_notes_case_idx
  on public.moderation_case_notes (case_id, created_at desc);

alter table public.moderation_case_notes enable row level security;

create policy moderation_case_notes_admin_all
  on public.moderation_case_notes for all to authenticated
  using (public.admin_has_scope('safety_review'))
  with check (public.admin_has_scope('safety_review'));

grant select, insert on public.moderation_case_notes to authenticated;

create or replace function public.moderation_case_release_eligible(p_case_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select
    exists (
      select 1
      from public.appeals a
      join public.moderation_actions ma
        on ma.id = a.moderation_action_id
      where ma.case_id = p_case_id
        and a.status = 'reversed'
    )
    or exists (
      select 1
      from public.moderation_actions ma
      where ma.case_id = p_case_id
        and ma.expires_at is not null
        and ma.expires_at <= now()
    );
$$;

create or replace function public.release_moderation_case(p_case_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_reviewer uuid := public.current_account_id();
  v_report public.reports%rowtype;
begin
  if not public.admin_can_access_case(p_case_id) then
    raise exception 'forbidden';
  end if;

  if not public.moderation_case_release_eligible(p_case_id) then
    raise exception 'case release requires a reversed appeal or expired penalty';
  end if;

  select r.* into v_report
  from public.reports r
  join public.moderation_cases c on c.report_id = r.id
  where c.id = p_case_id;

  if not found then
    raise exception 'case not found';
  end if;

  update public.accounts
  set status = 'active', updated_at = now()
  where id = v_report.reported_account_id
    and status in ('restricted', 'suspended');

  update public.moderation_cases
  set status = 'closed', updated_at = now()
  where id = p_case_id;

  insert into public.audit_events (
    actor_account_id,
    action,
    resource_type,
    resource_id,
    metadata
  )
  values (
    v_reviewer,
    'case.released',
    'moderation_case',
    p_case_id::text,
    jsonb_build_object('reported_account_id', v_report.reported_account_id)
  );
end;
$$;

revoke all on function public.moderation_case_release_eligible(uuid) from public;
revoke all on function public.release_moderation_case(uuid) from public;
grant execute on function public.moderation_case_release_eligible(uuid) to authenticated;
grant execute on function public.moderation_case_release_eligible(uuid) to service_role;
grant execute on function public.release_moderation_case(uuid) to authenticated;
