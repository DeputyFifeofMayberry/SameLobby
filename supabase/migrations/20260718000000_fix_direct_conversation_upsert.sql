-- Fix direct conversation upsert after partial unique index replaced table constraint.

create or replace function public.create_conversation_for_connection(
  p_connection_id uuid
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_conn public.connections%rowtype;
  v_conversation_id uuid;
begin
  select * into v_conn
  from public.connections
  where id = p_connection_id;

  if not found then
    raise exception 'connection not found';
  end if;

  insert into public.conversations (connection_id, kind, permission)
  values (p_connection_id, 'direct', 'open')
  on conflict (connection_id) where (kind = 'direct' and connection_id is not null)
  do update set updated_at = now()
  returning id into v_conversation_id;

  insert into public.conversation_members (conversation_id, account_id)
  values
    (v_conversation_id, v_conn.user_a_id),
    (v_conversation_id, v_conn.user_b_id)
  on conflict do nothing;

  return v_conversation_id;
end;
$$;

grant execute on function public.create_conversation_for_connection(uuid) to authenticated;
