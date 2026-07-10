-- Persist connection request expiry when accept is attempted on an expired pending row.
-- Raising an exception rolled back the status update; return null so the update commits.

create or replace function public.accept_connection_request(p_request_id uuid)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_account_id uuid;
  v_req public.connection_requests%rowtype;
  v_connection_id uuid;
begin
  v_account_id := public.current_account_id();
  if v_account_id is null then
    raise exception 'not authenticated';
  end if;

  select * into v_req
  from public.connection_requests
  where id = p_request_id
  for update;

  if not found then
    raise exception 'request not found';
  end if;

  if v_req.recipient_account_id <> v_account_id then
    raise exception 'forbidden';
  end if;

  if v_req.status <> 'pending' then
    raise exception 'request not pending';
  end if;

  if v_req.expires_at < now() then
    update public.connection_requests
    set status = 'expired', updated_at = now()
    where id = p_request_id;
    return null;
  end if;

  if public.accounts_blocked(v_req.sender_account_id, v_req.recipient_account_id) then
    raise exception 'blocked';
  end if;

  update public.connection_requests
  set
    status = 'accepted',
    responded_at = now(),
    updated_at = now()
  where id = p_request_id;

  insert into public.connections (user_a_id, user_b_id, connection_request_id)
  values (
    least(v_req.sender_account_id, v_req.recipient_account_id),
    greatest(v_req.sender_account_id, v_req.recipient_account_id),
    p_request_id
  )
  on conflict (user_a_id, user_b_id) do update
    set status = 'connected', updated_at = now()
  returning id into v_connection_id;

  perform public.create_conversation_for_connection(v_connection_id);

  return v_connection_id;
end;
$$;
