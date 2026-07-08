-- Transactional account mutations (service role only)
create or replace function public.complete_account_attestation(
  p_account_id uuid,
  p_adult_attested_at timestamptz,
  p_terms_version text,
  p_privacy_version text,
  p_community_standards_version text,
  p_adult_attestation_version text,
  p_ip_hash text,
  p_user_agent_hash text
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.consent_events (account_id, event_type, policy_version, ip_hash, user_agent_hash)
  values
    (p_account_id, 'adult_attestation', p_adult_attestation_version, p_ip_hash, p_user_agent_hash),
    (p_account_id, 'terms_accepted', p_terms_version, p_ip_hash, p_user_agent_hash),
    (p_account_id, 'privacy_accepted', p_privacy_version, p_ip_hash, p_user_agent_hash),
    (p_account_id, 'community_standards_accepted', p_community_standards_version, p_ip_hash, p_user_agent_hash);

  update public.accounts
  set
    status = 'active',
    adult_attested_at = p_adult_attested_at,
    terms_version = p_terms_version,
    privacy_version = p_privacy_version,
    community_standards_version = p_community_standards_version
  where id = p_account_id;
end;
$$;

create or replace function public.request_account_deletion(
  p_account_id uuid,
  p_scheduled_purge_at timestamptz
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not exists (
    select 1
    from public.deletion_requests
    where account_id = p_account_id
      and status in ('requested', 'confirmed', 'processing')
  ) then
    insert into public.deletion_requests (account_id, status, scheduled_purge_at)
    values (p_account_id, 'requested', p_scheduled_purge_at);
  end if;

  update public.accounts
  set status = 'deletion_pending'
  where id = p_account_id
    and status not in ('deletion_pending', 'deleted');
end;
$$;

revoke all on function public.complete_account_attestation(
  uuid, timestamptz, text, text, text, text, text, text
) from public;
revoke all on function public.request_account_deletion(uuid, timestamptz) from public;

grant execute on function public.complete_account_attestation(
  uuid, timestamptz, text, text, text, text, text, text
) to service_role;
grant execute on function public.request_account_deletion(uuid, timestamptz) to service_role;

-- Reject new auth users when registration_open is false
create or replace function public.hook_before_user_created(event jsonb)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
begin
  if not exists (
    select 1
    from public.feature_flags
    where key = 'registration_open'
      and enabled = true
  ) then
    return jsonb_build_object(
      'error', jsonb_build_object(
        'http_code', 403,
        'message', 'Registration is temporarily paused.'
      )
    );
  end if;

  return '{}'::jsonb;
end;
$$;

revoke all on function public.hook_before_user_created(jsonb) from public;
grant execute on function public.hook_before_user_created(jsonb) to supabase_auth_admin;
