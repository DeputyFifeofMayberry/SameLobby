-- Slice 2: compatibility preferences, interests, environment boundaries

create table public.compatibility_preferences (
  id uuid primary key default gen_random_uuid(),
  account_id uuid not null unique references public.accounts (id) on delete cascade,
  social_energy text,
  group_size_preference text,
  playstyle_notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.user_interests (
  account_id uuid not null references public.accounts (id) on delete cascade,
  interest_id uuid not null references public.interests (id) on delete cascade,
  primary key (account_id, interest_id)
);

create table public.environment_preferences (
  id uuid primary key default gen_random_uuid(),
  account_id uuid not null unique references public.accounts (id) on delete cascade,
  boundaries text,
  accommodation_notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger compatibility_preferences_set_updated_at
  before update on public.compatibility_preferences
  for each row
  execute function public.set_updated_at();

create trigger environment_preferences_set_updated_at
  before update on public.environment_preferences
  for each row
  execute function public.set_updated_at();

alter table public.compatibility_preferences enable row level security;
alter table public.user_interests enable row level security;
alter table public.environment_preferences enable row level security;

create policy compatibility_preferences_select_own
  on public.compatibility_preferences for select to authenticated
  using (account_id in (select id from public.accounts where auth_user_id = auth.uid()));

create policy compatibility_preferences_insert_own
  on public.compatibility_preferences for insert to authenticated
  with check (account_id in (select id from public.accounts where auth_user_id = auth.uid()));

create policy compatibility_preferences_update_own
  on public.compatibility_preferences for update to authenticated
  using (account_id in (select id from public.accounts where auth_user_id = auth.uid()))
  with check (account_id in (select id from public.accounts where auth_user_id = auth.uid()));

create policy user_interests_select_own
  on public.user_interests for select to authenticated
  using (account_id in (select id from public.accounts where auth_user_id = auth.uid()));

create policy user_interests_insert_own
  on public.user_interests for insert to authenticated
  with check (account_id in (select id from public.accounts where auth_user_id = auth.uid()));

create policy user_interests_delete_own
  on public.user_interests for delete to authenticated
  using (account_id in (select id from public.accounts where auth_user_id = auth.uid()));

create policy environment_preferences_select_own
  on public.environment_preferences for select to authenticated
  using (account_id in (select id from public.accounts where auth_user_id = auth.uid()));

create policy environment_preferences_insert_own
  on public.environment_preferences for insert to authenticated
  with check (account_id in (select id from public.accounts where auth_user_id = auth.uid()));

create policy environment_preferences_update_own
  on public.environment_preferences for update to authenticated
  using (account_id in (select id from public.accounts where auth_user_id = auth.uid()))
  with check (account_id in (select id from public.accounts where auth_user_id = auth.uid()));

grant select, insert, update on public.compatibility_preferences to authenticated;
grant select, insert, delete on public.user_interests to authenticated;
grant select, insert, update on public.environment_preferences to authenticated;
