-- Prevent authenticated users from mutating protected account fields via direct API calls.
create or replace function public.guard_accounts_sensitive_fields()
returns trigger
language plpgsql
as $$
declare
  jwt_role text;
begin
  jwt_role := coalesce(auth.jwt() ->> 'role', current_setting('role', true));

  if jwt_role in ('service_role', 'supabase_admin') then
    return new;
  end if;

  if tg_op = 'UPDATE' then
    if new.status is distinct from old.status
       or new.adult_attested_at is distinct from old.adult_attested_at
       or new.terms_version is distinct from old.terms_version
       or new.privacy_version is distinct from old.privacy_version
       or new.community_standards_version is distinct from old.community_standards_version
       or new.email is distinct from old.email
       or new.deleted_at is distinct from old.deleted_at
    then
      raise exception 'protected account fields cannot be updated directly'
        using errcode = '42501';
    end if;
  end if;

  return new;
end;
$$;

create trigger accounts_guard_sensitive_fields
  before update on public.accounts
  for each row
  execute function public.guard_accounts_sensitive_fields();

-- One active deletion request per account
create unique index deletion_requests_one_active_per_account
  on public.deletion_requests (account_id)
  where status in ('requested', 'confirmed', 'processing');
