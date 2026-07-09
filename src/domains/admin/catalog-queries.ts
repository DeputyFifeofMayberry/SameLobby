import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";

export type CatalogGameRow = {
  id: string;
  slug: string;
  name: string;
  isAnchor: boolean;
  isActive: boolean;
  sortOrder: number;
  platformCount: number;
  platformIds: string[];
  crossplayReviewedAt: string | null;
};

export type CatalogPlatform = {
  id: string;
  name: string;
};

export async function listCatalogPlatforms(): Promise<CatalogPlatform[]> {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("platforms")
    .select("id, name")
    .eq("is_active", true)
    .order("sort_order");
  if (error) throw error;
  return (data ?? []).map((platform) => ({
    id: platform.id as string,
    name: platform.name as string,
  }));
}

export async function listCatalogGames(): Promise<CatalogGameRow[]> {
  const admin = createAdminClient();
  const { data: games } = await admin
    .from("games")
    .select("id, slug, name, is_anchor, is_active, sort_order")
    .order("sort_order");

  if (!games?.length) return [];

  const gameIds = games.map((g) => g.id as string);
  const [{ data: platformCounts }, { data: crossplay }] = await Promise.all([
    admin
      .from("game_platforms")
      .select("game_id, platform_id")
      .in("game_id", gameIds),
    admin
      .from("crossplay_sets")
      .select("game_id, reviewed_at")
      .in("game_id", gameIds),
  ]);

  const countByGame = new Map<string, number>();
  const platformIdsByGame = new Map<string, string[]>();
  for (const row of platformCounts ?? []) {
    const id = row.game_id as string;
    countByGame.set(id, (countByGame.get(id) ?? 0) + 1);
    const ids = platformIdsByGame.get(id) ?? [];
    ids.push(row.platform_id as string);
    platformIdsByGame.set(id, ids);
  }

  const crossplayByGame = new Map<string, string>();
  for (const row of crossplay ?? []) {
    crossplayByGame.set(row.game_id as string, row.reviewed_at as string);
  }

  return games.map((g) => ({
    id: g.id as string,
    slug: g.slug as string,
    name: g.name as string,
    isAnchor: g.is_anchor === true,
    isActive: g.is_active === true,
    sortOrder: g.sort_order as number,
    platformCount: countByGame.get(g.id as string) ?? 0,
    platformIds: platformIdsByGame.get(g.id as string) ?? [],
    crossplayReviewedAt: crossplayByGame.get(g.id as string) ?? null,
  }));
}

export async function getCatalogStats() {
  const admin = createAdminClient();
  const [
    { count: totalGames },
    { count: anchorGames },
    { count: activeGames },
  ] = await Promise.all([
    admin.from("games").select("*", { count: "exact", head: true }),
    admin
      .from("games")
      .select("*", { count: "exact", head: true })
      .eq("is_anchor", true),
    admin
      .from("games")
      .select("*", { count: "exact", head: true })
      .eq("is_active", true),
  ]);

  return {
    totalGames: totalGames ?? 0,
    anchorGames: anchorGames ?? 0,
    activeGames: activeGames ?? 0,
  };
}
