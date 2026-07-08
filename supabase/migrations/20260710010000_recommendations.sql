-- Slice 3: recommendation snapshots and reason code catalog

create table public.recommendation_reason_codes (
  code text primary key,
  label text not null,
  description text
);

create table public.discovery_recommendations (
  id uuid primary key default gen_random_uuid(),
  viewer_account_id uuid not null references public.accounts (id) on delete cascade,
  recommended_account_id uuid not null references public.accounts (id) on delete cascade,
  reason_codes text[] not null,
  expires_at timestamptz not null,
  created_at timestamptz not null default now(),
  unique (viewer_account_id, recommended_account_id)
);

create index discovery_recommendations_viewer_idx
  on public.discovery_recommendations (viewer_account_id, expires_at desc);

alter table public.recommendation_reason_codes enable row level security;
alter table public.discovery_recommendations enable row level security;

create policy reason_codes_select_all
  on public.recommendation_reason_codes for select to anon, authenticated using (true);

create policy discovery_recommendations_select_own
  on public.discovery_recommendations for select to authenticated
  using (
    viewer_account_id in (
      select id from public.accounts where auth_user_id = auth.uid()
    )
  );

grant select on public.recommendation_reason_codes to anon, authenticated;
grant select on public.discovery_recommendations to authenticated;

insert into public.recommendation_reason_codes (code, label, description) values
  ('shared_game', 'Shared game: {game}', 'Both players list the same game'),
  ('playable_together', 'Playable together on {platform}', 'Compatible platform or cross-play path'),
  ('shared_goal', 'Similar current goal', 'Active intent goals align'),
  ('overlapping_availability', 'Overlapping availability', 'Schedule windows overlap'),
  ('shared_communication', 'Compatible communication', 'At least one shared communication mode'),
  ('time_zone_region', 'Similar time zone region', 'Broad region/time zone alignment')
on conflict (code) do nothing;
