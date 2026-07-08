export type Platform = {
  id: string;
  slug: string;
  name: string;
  sort_order: number;
};

export type Game = {
  id: string;
  slug: string;
  name: string;
  is_anchor: boolean;
  sort_order: number;
};

export type GamePlatform = {
  game_id: string;
  platform_id: string;
};

export type UserGameRow = {
  id: string;
  account_id: string;
  game_id: string;
  platform_id: string;
  is_active: boolean;
  sort_order: number;
  game?: Game;
  platform?: Platform;
};
