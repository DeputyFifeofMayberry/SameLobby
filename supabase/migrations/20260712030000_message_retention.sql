-- Slice 5: message retention_at default on insert (purge job in Slice 10)

create or replace function public.messages_set_retention_at()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.retention_at is null then
    new.retention_at := now() + interval '12 months';
  end if;
  return new;
end;
$$;

create trigger messages_set_retention_at
  before insert on public.messages
  for each row execute function public.messages_set_retention_at();
