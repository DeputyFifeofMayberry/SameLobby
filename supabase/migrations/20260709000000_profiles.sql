-- Slice 2: gamer profiles and disclosure settings

create type public.visibility_level as enum (
  'public',
  'match_only',
  'connection_only',
  'private'
);

create type public.onboarding_step as enum (
  'identity',
  'games',
  'communication',
  'goal',
  'availability',
  'preview'
);

create type public.communication_mode as enum (
  'same_lobby_text',
  'in_game_text',
  'voice_chat',
  'discord'
);

create type public.intent_goal as enum (
  'gaming_friendship',
  'specific_game_duo',
  'teammates',
  'casual_sessions',
  'cross_platform_play'
);

create table public.gamer_profiles (
  id uuid primary key default gen_random_uuid(),
  account_id uuid not null unique references public.accounts (id) on delete cascade,
  display_name text,
  communication_modes public.communication_mode[] not null default '{}',
  introduction text,
  onboarding_step public.onboarding_step not null default 'identity',
  onboarding_completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint gamer_profiles_display_name_length check (
    display_name is null
    or (char_length(display_name) >= 3 and char_length(display_name) <= 24)
  )
);

create unique index gamer_profiles_display_name_active_idx
  on public.gamer_profiles (lower(display_name))
  where display_name is not null and onboarding_completed_at is not null;

create index gamer_profiles_account_id_idx on public.gamer_profiles (account_id);

create table public.disclosure_settings (
  id uuid primary key default gen_random_uuid(),
  account_id uuid not null references public.accounts (id) on delete cascade,
  field_key text not null,
  visibility public.visibility_level not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (account_id, field_key)
);

create index disclosure_settings_account_id_idx on public.disclosure_settings (account_id);

create trigger gamer_profiles_set_updated_at
  before update on public.gamer_profiles
  for each row
  execute function public.set_updated_at();

create trigger disclosure_settings_set_updated_at
  before update on public.disclosure_settings
  for each row
  execute function public.set_updated_at();

-- Provision empty profile row for each account
create or replace function public.handle_new_account_profile()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.gamer_profiles (account_id)
  values (new.id)
  on conflict (account_id) do nothing;

  insert into public.disclosure_settings (account_id, field_key, visibility)
  values
    (new.id, 'general_availability', 'match_only'),
    (new.id, 'environment_preferences', 'match_only'),
    (new.id, 'compatibility_preferences', 'match_only')
  on conflict (account_id, field_key) do nothing;

  return new;
end;
$$;

create trigger on_account_created_profile
  after insert on public.accounts
  for each row
  execute function public.handle_new_account_profile();

-- Backfill profiles for existing accounts
insert into public.gamer_profiles (account_id)
select id from public.accounts
on conflict (account_id) do nothing;

insert into public.disclosure_settings (account_id, field_key, visibility)
select a.id, d.field_key, d.visibility
from public.accounts a
cross join (
  values
    ('general_availability', 'match_only'::public.visibility_level),
    ('environment_preferences', 'match_only'::public.visibility_level),
    ('compatibility_preferences', 'match_only'::public.visibility_level)
) as d(field_key, visibility)
on conflict (account_id, field_key) do nothing;

alter table public.gamer_profiles enable row level security;
alter table public.disclosure_settings enable row level security;

create policy gamer_profiles_select_own
  on public.gamer_profiles
  for select
  to authenticated
  using (
    account_id in (
      select id from public.accounts where auth_user_id = auth.uid()
    )
  );

create policy gamer_profiles_insert_own
  on public.gamer_profiles
  for insert
  to authenticated
  with check (
    account_id in (
      select id from public.accounts where auth_user_id = auth.uid()
    )
  );

create policy gamer_profiles_update_own
  on public.gamer_profiles
  for update
  to authenticated
  using (
    account_id in (
      select id from public.accounts where auth_user_id = auth.uid()
    )
  )
  with check (
    account_id in (
      select id from public.accounts where auth_user_id = auth.uid()
    )
  );

create policy disclosure_settings_select_own
  on public.disclosure_settings
  for select
  to authenticated
  using (
    account_id in (
      select id from public.accounts where auth_user_id = auth.uid()
    )
  );

create policy disclosure_settings_insert_own
  on public.disclosure_settings
  for insert
  to authenticated
  with check (
    account_id in (
      select id from public.accounts where auth_user_id = auth.uid()
    )
  );

create policy disclosure_settings_update_own
  on public.disclosure_settings
  for update
  to authenticated
  using (
    account_id in (
      select id from public.accounts where auth_user_id = auth.uid()
    )
  )
  with check (
    account_id in (
      select id from public.accounts where auth_user_id = auth.uid()
    )
  );

grant select, insert, update on public.gamer_profiles to authenticated;
grant select, insert, update on public.disclosure_settings to authenticated;
