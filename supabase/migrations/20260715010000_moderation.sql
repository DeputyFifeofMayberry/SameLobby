-- Slice 8a part 2: moderation schema, RPCs, and RLS (migration 020)

create or replace function public.assign_report_severity(
  p_category public.report_category,
  p_description text
)
returns public.moderation_severity
language plpgsql
immutable
as $$
declare
  v_lower text := lower(coalesce(p_description, ''));
begin
  if v_lower ~ '(kill|murder|suicide|doxx|dox |csam|child abuse|rape threat)' then
    return 'p0';
  end if;

  if p_category in ('harassment', 'scam') then
    return 'p1';
  end if;

  if p_category = 'inappropriate_content' then
    return 'p2';
  end if;

  return 'p3';
end;
$$;

alter table public.reports
  add column if not exists group_id uuid references public.private_groups (id) on delete set null,
  add column if not exists play_invitation_id uuid references public.play_invitations (id) on delete set null,
  add column if not exists severity public.moderation_severity,
  add column if not exists include_message_context boolean not null default false;

create table public.moderation_cases (
  id uuid primary key default gen_random_uuid(),
  report_id uuid not null unique references public.reports (id) on delete cascade,
  status public.moderation_case_status not null default 'open',
  severity public.moderation_severity not null,
  assigned_reviewer_account_id uuid references public.accounts (id) on delete set null,
  policy_reference text,
  claimed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.reports
  add column if not exists moderation_case_id uuid references public.moderation_cases (id) on delete set null;

create index moderation_cases_status_idx
  on public.moderation_cases (status, severity, created_at desc);

create trigger moderation_cases_set_updated_at
  before update on public.moderation_cases
  for each row execute function public.set_updated_at();

create table public.moderation_evidence (
  id uuid primary key default gen_random_uuid(),
  case_id uuid not null references public.moderation_cases (id) on delete cascade,
  kind public.moderation_evidence_kind not null,
  body text not null,
  source_message_id uuid references public.messages (id) on delete set null,
  captured_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create index moderation_evidence_case_idx
  on public.moderation_evidence (case_id, created_at);

create table public.moderation_actions (
  id uuid primary key default gen_random_uuid(),
  case_id uuid not null references public.moderation_cases (id) on delete cascade,
  action_type public.moderation_action_type not null,
  subject_account_id uuid not null references public.accounts (id) on delete cascade,
  reason_code text not null,
  effective_at timestamptz not null default now(),
  expires_at timestamptz,
  appeal_deadline_at timestamptz,
  created_by_account_id uuid not null references public.accounts (id) on delete restrict,
  created_at timestamptz not null default now()
);

create index moderation_actions_case_idx
  on public.moderation_actions (case_id, created_at desc);

create table public.appeals (
  id uuid primary key default gen_random_uuid(),
  moderation_action_id uuid not null unique references public.moderation_actions (id) on delete cascade,
  appellant_account_id uuid not null references public.accounts (id) on delete cascade,
  body text not null,
  status public.appeal_status not null default 'submitted',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint appeals_body_length check (
    char_length(body) >= 10 and char_length(body) <= 2000
  )
);

create trigger appeals_set_updated_at
  before update on public.appeals
  for each row execute function public.set_updated_at();

create or replace function public.admin_has_scope(p_scope text)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.admin_users au
    where au.account_id = public.current_account_id()
      and au.disabled_at is null
      and (
        p_scope = any(au.scopes)
        or 'security_break_glass' = any(au.scopes)
      )
  );
$$;

create or replace function public.admin_can_access_case(p_case_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.admin_has_scope('safety_review');
$$;

create or replace function public.create_moderation_case_from_report(p_report_id uuid)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_report public.reports%rowtype;
  v_case_id uuid;
  v_severity public.moderation_severity;
  v_msg record;
begin
  select * into v_report
  from public.reports
  where id = p_report_id;

  if not found then
    raise exception 'report not found';
  end if;

  if v_report.reporter_account_id <> public.current_account_id() then
    raise exception 'forbidden';
  end if;

  if v_report.moderation_case_id is not null then
    return v_report.moderation_case_id;
  end if;

  v_severity := public.assign_report_severity(v_report.category, v_report.description);

  insert into public.moderation_cases (
    report_id,
    status,
    severity
  )
  values (
    p_report_id,
    'open',
    v_severity
  )
  returning id into v_case_id;

  update public.reports
  set
    moderation_case_id = v_case_id,
    severity = v_severity,
    status = 'case_opened'
  where id = p_report_id;

  insert into public.moderation_evidence (case_id, kind, body)
  values (v_case_id, 'report_description', v_report.description);

  if v_report.include_message_context
    and v_report.conversation_id is not null
    and public.is_conversation_member(v_report.conversation_id, v_report.reporter_account_id) then
    for v_msg in
      select m.id, m.body
      from public.messages m
      where m.conversation_id = v_report.conversation_id
      order by m.created_at desc
      limit 5
    loop
      insert into public.moderation_evidence (
        case_id,
        kind,
        body,
        source_message_id
      )
      values (
        v_case_id,
        'message_excerpt',
        v_msg.body,
        v_msg.id
      );
    end loop;
  end if;

  if v_severity in ('p0', 'p1') then
    update public.accounts
    set status = 'restricted', updated_at = now()
    where id = v_report.reported_account_id
      and status = 'active';
  end if;

  return v_case_id;
end;
$$;

create or replace function public.claim_moderation_case(p_case_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.admin_can_access_case(p_case_id) then
    raise exception 'forbidden';
  end if;

  update public.moderation_cases
  set
    assigned_reviewer_account_id = public.current_account_id(),
    status = 'investigating',
    claimed_at = now(),
    updated_at = now()
  where id = p_case_id;
end;
$$;

create or replace function public.apply_moderation_action(
  p_case_id uuid,
  p_action_type public.moderation_action_type,
  p_subject_account_id uuid,
  p_reason_code text
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_action_id uuid;
  v_reviewer uuid := public.current_account_id();
begin
  if not public.admin_can_access_case(p_case_id) then
    raise exception 'forbidden';
  end if;

  insert into public.moderation_actions (
    case_id,
    action_type,
    subject_account_id,
    reason_code,
    created_by_account_id,
    appeal_deadline_at
  )
  values (
    p_case_id,
    p_action_type,
    p_subject_account_id,
    p_reason_code,
    v_reviewer,
    case
      when p_action_type in ('warn', 'restrict_messaging', 'restrict_discovery', 'suspend')
        then now() + interval '30 days'
      else null
    end
  )
  returning id into v_action_id;

  if p_action_type = 'restrict_discovery' then
    update public.accounts
    set status = 'restricted', updated_at = now()
    where id = p_subject_account_id;
  elsif p_action_type = 'restrict_messaging' then
    update public.accounts
    set status = 'restricted', updated_at = now()
    where id = p_subject_account_id;
  elsif p_action_type = 'suspend' then
    update public.accounts
    set status = 'suspended', updated_at = now()
    where id = p_subject_account_id;
  elsif p_action_type = 'close_no_action' then
    null;
  end if;

  update public.moderation_cases
  set status = 'action_taken', updated_at = now()
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
    'moderation_action_applied',
    'moderation_case',
    p_case_id::text,
    jsonb_build_object(
      'action_type', p_action_type,
      'subject_account_id', p_subject_account_id
    )
  );

  return v_action_id;
end;
$$;

create or replace function public.submit_appeal(
  p_action_id uuid,
  p_body text
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_action public.moderation_actions%rowtype;
  v_appeal_id uuid;
begin
  select * into v_action
  from public.moderation_actions
  where id = p_action_id;

  if not found then
    raise exception 'action not found';
  end if;

  if v_action.subject_account_id <> public.current_account_id() then
    raise exception 'forbidden';
  end if;

  if v_action.appeal_deadline_at is null or v_action.appeal_deadline_at < now() then
    raise exception 'appeal window closed';
  end if;

  insert into public.appeals (
    moderation_action_id,
    appellant_account_id,
    body
  )
  values (
    p_action_id,
    public.current_account_id(),
    p_body
  )
  returning id into v_appeal_id;

  update public.moderation_cases
  set status = 'appealed', updated_at = now()
  where id = v_action.case_id;

  return v_appeal_id;
end;
$$;

alter table public.moderation_cases enable row level security;
alter table public.moderation_evidence enable row level security;
alter table public.moderation_actions enable row level security;
alter table public.appeals enable row level security;

drop policy if exists reports_insert_own on public.reports;

create policy reports_insert_own
  on public.reports for insert to authenticated
  with check (reporter_account_id = public.current_account_id());

create policy reports_insert_not_blocked
  on public.reports as restrictive for insert to authenticated
  with check (
    not public.accounts_blocked(reporter_account_id, reported_account_id)
  );

create policy moderation_cases_admin_select
  on public.moderation_cases for select to authenticated
  using (public.admin_can_access_case(id));

create policy moderation_evidence_admin_select
  on public.moderation_evidence for select to authenticated
  using (public.admin_can_access_case(case_id));

create policy moderation_actions_admin_select
  on public.moderation_actions for select to authenticated
  using (public.admin_can_access_case(case_id));

create policy moderation_actions_subject_select
  on public.moderation_actions for select to authenticated
  using (subject_account_id = public.current_account_id());

create policy appeals_select_own
  on public.appeals for select to authenticated
  using (appellant_account_id = public.current_account_id());

create policy appeals_insert_own
  on public.appeals for insert to authenticated
  with check (appellant_account_id = public.current_account_id());

insert into public.feature_flags (key, enabled)
values ('reporting_enabled', false)
on conflict (key) do nothing;

grant execute on function public.assign_report_severity(public.report_category, text) to authenticated;
grant execute on function public.admin_has_scope(text) to authenticated;
grant execute on function public.admin_can_access_case(uuid) to authenticated;
grant execute on function public.create_moderation_case_from_report(uuid) to authenticated;
grant execute on function public.claim_moderation_case(uuid) to authenticated;
grant execute on function public.apply_moderation_action(uuid, public.moderation_action_type, uuid, text) to authenticated;
grant execute on function public.submit_appeal(uuid, text) to authenticated;
