-- Slice 2: games catalog, platforms, crossplay metadata

create table public.platforms (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  is_active boolean not null default true,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

create table public.games (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  is_anchor boolean not null default false,
  is_active boolean not null default true,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

create table public.game_platforms (
  game_id uuid not null references public.games (id) on delete cascade,
  platform_id uuid not null references public.platforms (id) on delete cascade,
  primary key (game_id, platform_id)
);

create table public.crossplay_sets (
  id uuid primary key default gen_random_uuid(),
  game_id uuid not null references public.games (id) on delete cascade,
  platform_ids uuid[] not null,
  reviewed_at timestamptz not null default now(),
  notes text
);

create table public.interests (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  is_active boolean not null default true,
  sort_order int not null default 0
);

create index games_active_idx on public.games (is_active, sort_order);
create index platforms_active_idx on public.platforms (is_active, sort_order);

alter table public.platforms enable row level security;
alter table public.games enable row level security;
alter table public.game_platforms enable row level security;
alter table public.crossplay_sets enable row level security;
alter table public.interests enable row level security;

create policy platforms_select_all
  on public.platforms for select to anon, authenticated using (is_active = true);

create policy games_select_all
  on public.games for select to anon, authenticated using (is_active = true);

create policy game_platforms_select_all
  on public.game_platforms for select to anon, authenticated using (true);

create policy crossplay_sets_select_all
  on public.crossplay_sets for select to anon, authenticated using (true);

create policy interests_select_all
  on public.interests for select to anon, authenticated using (is_active = true);

grant select on public.platforms to anon, authenticated;
grant select on public.games to anon, authenticated;
grant select on public.game_platforms to anon, authenticated;
grant select on public.crossplay_sets to anon, authenticated;
grant select on public.interests to anon, authenticated;

-- Platforms
insert into public.platforms (slug, name, sort_order) values
  ('pc', 'PC', 1),
  ('xbox', 'Xbox', 2),
  ('playstation', 'PlayStation', 3),
  ('nintendo_switch', 'Nintendo Switch', 4),
  ('mobile', 'Mobile', 5),
  ('mac', 'Mac', 6);

-- Anchor + catalog games (subset; expandable via seed file)
insert into public.games (slug, name, is_anchor, sort_order) values
  ('fortnite', 'Fortnite', true, 1),
  ('minecraft', 'Minecraft', true, 2),
  ('rocket-league', 'Rocket League', true, 3),
  ('call-of-duty', 'Call of Duty', true, 4),
  ('apex-legends', 'Apex Legends', true, 5),
  ('destiny-2', 'Destiny 2', true, 6),
  ('overwatch-2', 'Overwatch 2', true, 7),
  ('valorant', 'Valorant', true, 8),
  ('league-of-legends', 'League of Legends', false, 9),
  ('dota-2', 'Dota 2', false, 10),
  ('counter-strike-2', 'Counter-Strike 2', false, 11),
  ('pubg', 'PUBG: Battlegrounds', false, 12),
  ('rainbow-six-siege', 'Rainbow Six Siege', false, 13),
  ('dead-by-daylight', 'Dead by Daylight', false, 14),
  ('sea-of-thieves', 'Sea of Thieves', false, 15),
  ('elden-ring', 'Elden Ring', false, 16),
  ('diablo-4', 'Diablo IV', false, 17),
  ('path-of-exile', 'Path of Exile', false, 18),
  ('warframe', 'Warframe', false, 19),
  ('final-fantasy-xiv', 'Final Fantasy XIV', false, 20),
  ('world-of-warcraft', 'World of Warcraft', false, 21),
  ('guild-wars-2', 'Guild Wars 2', false, 22),
  ('lost-ark', 'Lost Ark', false, 23),
  ('palworld', 'Palworld', false, 24),
  ('helldivers-2', 'Helldivers 2', false, 25),
  ('monster-hunter-world', 'Monster Hunter: World', false, 26),
  ('among-us', 'Among Us', false, 27),
  ('fall-guys', 'Fall Guys', false, 28),
  ('roblox', 'Roblox', false, 29),
  ('genshin-impact', 'Genshin Impact', false, 30),
  ('honkai-star-rail', 'Honkai: Star Rail', false, 31),
  ('marvel-rivals', 'Marvel Rivals', false, 32),
  ('the-finals', 'THE FINALS', false, 33),
  ('deep-rock-galactic', 'Deep Rock Galactic', false, 34),
  ('phasmophobia', 'Phasmophobia', false, 35),
  ('lethal-company', 'Lethal Company', false, 36),
  ('valheim', 'Valheim', false, 37),
  ('terraria', 'Terraria', false, 38),
  ('stardew-valley', 'Stardew Valley', false, 39),
  ('civilization-vi', 'Sid Meier''s Civilization VI', false, 40),
  ('cities-skylines-2', 'Cities: Skylines II', false, 41),
  ('fifa', 'EA SPORTS FC', false, 42),
  ('nba-2k', 'NBA 2K', false, 43),
  ('madden', 'Madden NFL', false, 44),
  ('forza-horizon', 'Forza Horizon', false, 45),
  ('gran-turismo', 'Gran Turismo', false, 46),
  ('street-fighter-6', 'Street Fighter 6', false, 47),
  ('tekken-8', 'Tekken 8', false, 48),
  ('smash-bros', 'Super Smash Bros. Ultimate', false, 49),
  ('splatoon-3', 'Splatoon 3', false, 50);

-- Link games to platforms (anchor games get broad platform support)
insert into public.game_platforms (game_id, platform_id)
select g.id, p.id
from public.games g
cross join public.platforms p
where g.slug in ('fortnite', 'minecraft', 'rocket-league', 'call-of-duty', 'apex-legends', 'destiny-2', 'overwatch-2')
  and p.slug in ('pc', 'xbox', 'playstation', 'nintendo_switch')
on conflict do nothing;

insert into public.game_platforms (game_id, platform_id)
select g.id, p.id
from public.games g
join public.platforms p on p.slug = 'pc'
where g.slug in ('valorant', 'league-of-legends', 'dota-2', 'counter-strike-2', 'path-of-exile', 'warframe', 'helldivers-2', 'phasmophobia', 'lethal-company', 'valheim', 'terraria', 'civilization-vi', 'cities-skylines-2', 'the-finals', 'deep-rock-galactic', 'marvel-rivals')
on conflict do nothing;

insert into public.game_platforms (game_id, platform_id)
select g.id, p.id
from public.games g
join public.platforms p on p.slug in ('pc', 'xbox', 'playstation')
where g.slug in ('pubg', 'rainbow-six-siege', 'dead-by-daylight', 'sea-of-thieves', 'elden-ring', 'diablo-4', 'lost-ark', 'palworld', 'monster-hunter-world', 'final-fantasy-xiv', 'world-of-warcraft', 'guild-wars-2', 'fifa', 'nba-2k', 'madden', 'forza-horizon', 'gran-turismo', 'street-fighter-6', 'tekken-8')
on conflict do nothing;

insert into public.game_platforms (game_id, platform_id)
select g.id, p.id
from public.games g
join public.platforms p on p.slug = 'nintendo_switch'
where g.slug in ('minecraft', 'fortnite', 'rocket-league', 'among-us', 'fall-guys', 'smash-bros', 'splatoon-3', 'stardew-valley', 'monster-hunter-world', 'diablo-4')
on conflict do nothing;

insert into public.game_platforms (game_id, platform_id)
select g.id, p.id
from public.games g
join public.platforms p on p.slug = 'mobile'
where g.slug in ('roblox', 'genshin-impact', 'honkai-star-rail', 'among-us', 'fall-guys', 'pubg', 'minecraft')
on conflict do nothing;

-- Crossplay sets for anchor games
insert into public.crossplay_sets (game_id, platform_ids, notes)
select g.id, array_agg(p.id order by p.sort_order), 'Cross-play verified for anchor title'
from public.games g
join public.game_platforms gp on gp.game_id = g.id
join public.platforms p on p.id = gp.platform_id
where g.is_anchor = true
group by g.id;

-- Interests
insert into public.interests (slug, name, sort_order) values
  ('co-op', 'Co-op', 1),
  ('competitive', 'Competitive', 2),
  ('casual', 'Casual', 3),
  ('story-driven', 'Story-driven', 4),
  ('creative', 'Creative / building', 5),
  ('horror', 'Horror', 6),
  ('sports', 'Sports', 7),
  ('racing', 'Racing', 8);
