-- Slice 8d part 1: retention, legal holds, deletion job runs (migration 021)

create table public.retention_policies (
  severity public.moderation_severity primary key,
  retention_days int not null check (retention_days > 0)
);

insert into public.retention_policies (severity, retention_days)
values
  ('p0', 1095),
  ('p1', 730),
  ('p2', 365),
  ('p3', 90)
on conflict (severity) do nothing;

create table public.legal_holds (
  id uuid primary key default gen_random_uuid(),
  account_id uuid not null references public.accounts (id) on delete cascade,
  case_id uuid references public.moderation_cases (id) on delete set null,
  reason text not null,
  active boolean not null default true,
  created_by_account_id uuid references public.accounts (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index legal_holds_account_active_idx
  on public.legal_holds (account_id)
  where active = true;

create trigger legal_holds_set_updated_at
  before update on public.legal_holds
  for each row execute function public.set_updated_at();

create type public.deletion_job_stage as enum (
  'anonymize_profile',
  'revoke_sessions',
  'purge_messages',
  'finalize_account'
);

create type public.deletion_job_status as enum (
  'pending',
  'running',
  'completed',
  'failed'
);

create table public.deletion_job_runs (
  id uuid primary key default gen_random_uuid(),
  deletion_request_id uuid not null references public.deletion_requests (id) on delete cascade,
  stage public.deletion_job_stage not null,
  status public.deletion_job_status not null default 'pending',
  error text,
  started_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  unique (deletion_request_id, stage)
);

alter table public.legal_holds enable row level security;

create or replace function public.account_has_legal_hold(p_account_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.legal_holds lh
    where lh.account_id = p_account_id
      and lh.active = true
  );
$$;

create or replace function public.confirm_account_deletion(p_account_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if p_account_id <> public.current_account_id() then
    raise exception 'forbidden';
  end if;

  update public.deletion_requests
  set status = 'confirmed', updated_at = now()
  where account_id = p_account_id
    and status = 'requested';
end;
$$;

create or replace function public.messages_set_retention_at()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  new.retention_at := now() + interval '12 months';
  return new;
end;
$$;

create or replace function public.purge_expired_messages(p_batch_size int default 500)
returns int
language plpgsql
security definer
set search_path = public
as $$
declare
  v_deleted int;
begin
  with doomed as (
    select m.id
    from public.messages m
    where m.retention_at < now()
      and not exists (
        select 1
        from public.legal_holds lh
        where lh.active = true
          and lh.account_id = m.sender_account_id
      )
    limit p_batch_size
  )
  delete from public.messages m
  using doomed d
  where m.id = d.id;

  get diagnostics v_deleted = row_count;
  return v_deleted;
end;
$$;

create or replace function public.process_deletion_stage(p_batch_size int default 10)
returns int
language plpgsql
security definer
set search_path = public
as $$
declare
  v_req public.deletion_requests%rowtype;
  v_processed int := 0;
begin
  for v_req in
    select *
    from public.deletion_requests dr
    where dr.status in ('confirmed', 'processing')
    order by dr.requested_at
    limit p_batch_size
  loop
    if public.account_has_legal_hold(v_req.account_id) then
      continue;
    end if;

    update public.deletion_requests
    set status = 'processing', updated_at = now()
    where id = v_req.id;

    if not exists (
      select 1 from public.deletion_job_runs
      where deletion_request_id = v_req.id
        and stage = 'anonymize_profile'
        and status = 'completed'
    ) then
      insert into public.deletion_job_runs (deletion_request_id, stage, status, started_at, completed_at)
      values (v_req.id, 'anonymize_profile', 'running', now(), null)
      on conflict (deletion_request_id, stage) do update
        set status = 'running', started_at = now();

      update public.gamer_profiles
      set
        display_name = 'Deleted user',
        bio = null,
        updated_at = now()
      where account_id = v_req.account_id;

      update public.deletion_job_runs
      set status = 'completed', completed_at = now()
      where deletion_request_id = v_req.id
        and stage = 'anonymize_profile';
    end if;

    if not exists (
      select 1 from public.deletion_job_runs
      where deletion_request_id = v_req.id
        and stage = 'revoke_sessions'
        and status = 'completed'
    ) then
      insert into public.deletion_job_runs (deletion_request_id, stage, status, started_at, completed_at)
      values (v_req.id, 'revoke_sessions', 'running', now(), null)
      on conflict (deletion_request_id, stage) do update
        set status = 'running', started_at = now();

      delete from auth.sessions s
      using public.accounts a
      where a.id = v_req.account_id
        and s.user_id = a.auth_user_id;

      delete from auth.refresh_tokens rt
      using public.accounts a
      where a.id = v_req.account_id
        and rt.user_id = a.auth_user_id;

      update public.deletion_job_runs
      set status = 'completed', completed_at = now()
      where deletion_request_id = v_req.id
        and stage = 'revoke_sessions';
    end if;

    if not exists (
      select 1 from public.deletion_job_runs
      where deletion_request_id = v_req.id
        and stage = 'purge_messages'
        and status = 'completed'
    ) then
      insert into public.deletion_job_runs (deletion_request_id, stage, status, started_at, completed_at)
      values (v_req.id, 'purge_messages', 'running', now(), null)
      on conflict (deletion_request_id, stage) do update
        set status = 'running', started_at = now();

      delete from public.messages
      where sender_account_id = v_req.account_id;

      update public.deletion_job_runs
      set status = 'completed', completed_at = now()
      where deletion_request_id = v_req.id
        and stage = 'purge_messages';
    end if;

    if not exists (
      select 1 from public.deletion_job_runs
      where deletion_request_id = v_req.id
        and stage = 'finalize_account'
        and status = 'completed'
    ) then
      insert into public.deletion_job_runs (deletion_request_id, stage, status, started_at, completed_at)
      values (v_req.id, 'finalize_account', 'running', now(), null)
      on conflict (deletion_request_id, stage) do update
        set status = 'running', started_at = now();

      update public.accounts
      set status = 'deleted', updated_at = now()
      where id = v_req.account_id;

      update public.deletion_requests
      set status = 'completed', updated_at = now()
      where id = v_req.id;

      update public.deletion_job_runs
      set status = 'completed', completed_at = now()
      where deletion_request_id = v_req.id
        and stage = 'finalize_account';
    end if;

    v_processed := v_processed + 1;
  end loop;

  return v_processed;
end;
$$;

create or replace function public.export_account_data(p_account_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_result jsonb;
begin
  if p_account_id <> public.current_account_id() then
    raise exception 'forbidden';
  end if;

  select jsonb_build_object(
    'account_id', a.id,
    'status', a.status,
    'time_zone', a.time_zone,
    'locale', a.locale,
    'profile', (
      select jsonb_build_object(
        'display_name', gp.display_name,
        'onboarding_completed_at', gp.onboarding_completed_at
      )
      from public.gamer_profiles gp
      where gp.account_id = a.id
    ),
    'games', coalesce((
      select jsonb_agg(jsonb_build_object('game_id', ug.game_id, 'platform_id', ug.platform_id))
      from public.user_games ug
      where ug.account_id = a.id and ug.is_active = true
    ), '[]'::jsonb),
    'reports_submitted', coalesce((
      select jsonb_agg(jsonb_build_object('id', r.id, 'status', r.status, 'created_at', r.created_at))
      from public.reports r
      where r.reporter_account_id = a.id
    ), '[]'::jsonb),
    'connections', coalesce((
      select jsonb_agg(jsonb_build_object(
        'connection_id', c.id,
        'other_account_id',
          case when c.user_a_id = a.id then c.user_b_id else c.user_a_id end,
        'status', c.status
      ))
      from public.connections c
      where c.user_a_id = a.id or c.user_b_id = a.id
    ), '[]'::jsonb)
  ) into v_result
  from public.accounts a
  where a.id = p_account_id;

  return v_result;
end;
$$;

revoke all on function public.process_deletion_stage(int) from public;
revoke all on function public.purge_expired_messages(int) from public;
grant execute on function public.confirm_account_deletion(uuid) to authenticated;
grant execute on function public.export_account_data(uuid) to authenticated;
grant execute on function public.process_deletion_stage(int) to service_role;
grant execute on function public.purge_expired_messages(int) to service_role;
