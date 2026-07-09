-- Slice 10: expand catalog toward 150 games (8 anchors preserved)

insert into public.games (slug, name, is_anchor, sort_order) values
  ('halo-infinite', 'Halo Infinite', false, 51),
  ('gears-5', 'Gears 5', false, 52),
  ('borderlands-3', 'Borderlands 3', false, 53),
  ('borderlands-4', 'Borderlands 4', false, 54),
  ('payday-3', 'PAYDAY 3', false, 55),
  ('left-4-dead-2', 'Left 4 Dead 2', false, 56),
  ('back-4-blood', 'Back 4 Blood', false, 57),
  ('warhammer-40k-space-marine-2', 'Warhammer 40,000: Space Marine 2', false, 58),
  ('remnant-2', 'Remnant 2', false, 59),
  ('outriders', 'Outriders', false, 60),
  ('division-2', 'Tom Clancy''s The Division 2', false, 61),
  ('ghost-recon-breakpoint', 'Ghost Recon Breakpoint', false, 62),
  ('no-mans-sky', 'No Man''s Sky', false, 63),
  ('ark-survival-ascended', 'ARK: Survival Ascended', false, 64),
  ('rust', 'Rust', false, 65),
  ('dayz', 'DayZ', false, 66),
  ('satisfactory', 'Satisfactory', false, 67),
  ('factorio', 'Factorio', false, 68),
  ('rimworld', 'RimWorld', false, 69),
  ('project-zomboid', 'Project Zomboid', false, 70),
  ('dont-starve-together', 'Don''t Starve Together', false, 71),
  ('grounded', 'Grounded', false, 72),
  ('it-takes-two', 'It Takes Two', false, 73),
  ('a-way-out', 'A Way Out', false, 74),
  ('dying-light-2', 'Dying Light 2', false, 75),
  ('the-forest', 'The Forest', false, 76),
  ('sons-of-the-forest', 'Sons of the Forest', false, 77),
  ('payday-2', 'PAYDAY 2', false, 78),
  ('risk-of-rain-2', 'Risk of Rain 2', false, 79),
  ('baldurs-gate-3', 'Baldur''s Gate 3', false, 80),
  ('divinity-original-sin-2', 'Divinity: Original Sin 2', false, 81),
  ('pillars-of-eternity-2', 'Pillars of Eternity II', false, 82),
  ('hades-2', 'Hades II', false, 83),
  ('hades', 'Hades', false, 84),
  ('slay-the-spire', 'Slay the Spire', false, 85),
  ('dead-cells', 'Dead Cells', false, 86),
  ('hollow-knight', 'Hollow Knight', false, 87),
  ('celeste', 'Celeste', false, 88),
  ('cuphead', 'Cuphead', false, 89),
  ('overcooked-2', 'Overcooked! 2', false, 90),
  ('moving-out-2', 'Moving Out 2', false, 91),
  ('plateup', 'PlateUp!', false, 92),
  ('unrailed-2', 'Unrailed 2', false, 93),
  ('human-fall-flat', 'Human: Fall Flat', false, 94),
  ('gang-beasts', 'Gang Beasts', false, 95),
  ('powerwash-simulator', 'PowerWash Simulator', false, 96),
  ('snowrunner', 'SnowRunner', false, 97),
  ('euro-truck-simulator-2', 'Euro Truck Simulator 2', false, 98),
  ('american-truck-simulator', 'American Truck Simulator', false, 99),
  ('farming-simulator-22', 'Farming Simulator 22', false, 100),
  ('flight-simulator', 'Microsoft Flight Simulator', false, 101),
  ('assetto-corsa', 'Assetto Corsa', false, 102),
  ('iracing', 'iRacing', false, 103),
  ('rocket-league-sideswipe', 'Rocket League Sideswipe', false, 104),
  ('brawlhalla', 'Brawlhalla', false, 105),
  ('multiversus', 'MultiVersus', false, 106),
  ('guilty-gear-strive', 'Guilty Gear -Strive-', false, 107),
  ('mortal-kombat-1', 'Mortal Kombat 1', false, 108),
  ('dragon-ball-sparking-zero', 'DRAGON BALL: Sparking! ZERO', false, 109),
  ('elden-ring-nightreign', 'Elden Ring Nightreign', false, 110),
  ('dark-souls-3', 'Dark Souls III', false, 111),
  ('bloodborne', 'Bloodborne', false, 112),
  ('sekiro', 'Sekiro: Shadows Die Twice', false, 113),
  ('lies-of-p', 'Lies of P', false, 114),
  ('black-myth-wukong', 'Black Myth: Wukong', false, 115),
  ('starfield', 'Starfield', false, 116),
  ('cyberpunk-2077', 'Cyberpunk 2077', false, 117),
  ('mass-effect-legendary', 'Mass Effect Legendary Edition', false, 118),
  ('dragon-age-veilguard', 'Dragon Age: The Veilguard', false, 119),
  ('borderlands-2', 'Borderlands 2', false, 120),
  ('tiny-tinas-wonderlands', 'Tiny Tina''s Wonderlands', false, 121),
  ('doom-eternal', 'DOOM Eternal', false, 122),
  ('doom-the-dark-ages', 'DOOM: The Dark Ages', false, 123),
  ('metro-exodus', 'Metro Exodus', false, 124),
  ('resident-evil-4', 'Resident Evil 4', false, 125),
  ('resident-evil-village', 'Resident Evil Village', false, 126),
  ('dead-space', 'Dead Space', false, 127),
  ('the-outlast-trials', 'The Outlast Trials', false, 128),
  ('content-warning', 'Content Warning', false, 129),
  ('v-rising', 'V Rising', false, 130),
  ('core-keeper', 'Core Keeper', false, 131),
  ('enshrouded', 'Enshrouded', false, 132),
  ('last-epoch', 'Last Epoch', false, 133),
  ('torchlight-infinite', 'Torchlight: Infinite', false, 134),
  ('new-world', 'New World: Aeternum', false, 135),
  ('elder-scrolls-online', 'The Elder Scrolls Online', false, 136),
  ('star-wars-the-old-republic', 'Star Wars: The Old Republic', false, 137),
  ('eve-online', 'EVE Online', false, 138),
  ('albion-online', 'Albion Online', false, 139),
  ('runescape', 'RuneScape', false, 140),
  ('old-school-runescape', 'Old School RuneScape', false, 141),
  ('team-fortress-2', 'Team Fortress 2', false, 142),
  ('half-life-alyx', 'Half-Life: Alyx', false, 143),
  ('garrys-mod', 'Garry''s Mod', false, 144),
  ('minecraft-legends', 'Minecraft Legends', false, 145),
  ('lego-fortnite', 'LEGO Fortnite', false, 146),
  ('fortnite-rocket-racing', 'Fortnite Rocket Racing', false, 147),
  ('the-crew-motorfest', 'The Crew Motorfest', false, 148),
  ('need-for-speed-unbound', 'Need for Speed Unbound', false, 149),
  ('wreckfest', 'Wreckfest', false, 150)
on conflict (slug) do nothing;

-- Default PC platform links for expanded catalog
insert into public.game_platforms (game_id, platform_id)
select g.id, p.id
from public.games g
join public.platforms p on p.slug = 'pc'
where g.sort_order between 51 and 150
on conflict do nothing;

-- Console links for select titles
insert into public.game_platforms (game_id, platform_id)
select g.id, p.id
from public.games g
join public.platforms p on p.slug in ('xbox', 'playstation')
where g.slug in (
  'halo-infinite', 'gears-5', 'borderlands-3', 'borderlands-4',
  'payday-3', 'the-division-2', 'no-mans-sky', 'ark-survival-ascended',
  'it-takes-two', 'dying-light-2', 'sons-of-the-forest', 'starfield',
  'elden-ring-nightreign', 'mortal-kombat-1', 'fifa', 'forza-horizon'
)
on conflict do nothing;

insert into public.game_platforms (game_id, platform_id)
select g.id, p.id
from public.games g
join public.platforms p on p.slug = 'nintendo_switch'
where g.slug in (
  'overcooked-2', 'moving-out-2', 'human-fall-flat', 'hollow-knight',
  'celeste', 'minecraft-legends', 'smash-bros'
)
on conflict do nothing;
