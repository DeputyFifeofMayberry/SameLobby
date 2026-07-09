-- auth.sessions.user_id is uuid in local/CI; compare without text cast.

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
        introduction = null,
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
        and rt.user_id::text = a.auth_user_id::text;

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
