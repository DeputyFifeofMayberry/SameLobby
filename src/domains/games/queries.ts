import "server-only";
import { createClient } from "@/lib/supabase/server";
import type { Game, Platform, UserGameRow } from "@/domains/games/types";

export async function listPlatforms(): Promise<Platform[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("platforms")
    .select("id, slug, name, sort_order")
    .eq("is_active", true)
    .order("sort_order");

  if (error || !data) return [];
  return data as Platform[];
}

export async function listGames(): Promise<Game[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("games")
    .select("id, slug, name, is_anchor, sort_order")
    .eq("is_active", true)
    .order("sort_order");

  if (error || !data) return [];
  return data as Game[];
}

export async function listGamePlatforms(): Promise<
  { game_id: string; platform_id: string }[]
> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("game_platforms")
    .select("game_id, platform_id");

  if (error || !data) return [];
  return data;
}

export async function getUserGamesForAccount(
  accountId: string,
): Promise<UserGameRow[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("user_games")
    .select(
      "id, account_id, game_id, platform_id, is_active, sort_order, game:games(id, slug, name, is_anchor, sort_order), platform:platforms(id, slug, name, sort_order)",
    )
    .eq("account_id", accountId)
    .eq("is_active", true)
    .order("sort_order");

  if (error || !data) return [];
  return data as unknown as UserGameRow[];
}

export async function getPlatformsForGame(
  gameId: string,
): Promise<Platform[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("game_platforms")
    .select("platform:platforms(id, slug, name, sort_order)")
    .eq("game_id", gameId);

  if (error || !data) return [];
  return data
    .map((row) => row.platform as unknown as Platform | null)
    .filter((p): p is Platform => p !== null)
    .sort((a, b) => a.sort_order - b.sort_order);
}
