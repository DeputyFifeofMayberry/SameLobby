"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import type { AdminActionResult } from "@/domains/admin/actions";
import { logAdminAudit, requireAdmin } from "@/domains/admin/permissions";
import { createClient } from "@/lib/supabase/server";

export type CatalogActionResult = AdminActionResult;

const gamePlatformsSchema = z.object({
  gameId: z.string().uuid(),
  platformIds: z.array(z.string().uuid()).min(1).max(20),
});

export async function toggleCatalogGameActive(
  gameId: string,
  isActive: boolean,
): Promise<CatalogActionResult> {
  const ctx = await requireAdmin("catalog");
  if (!ctx.ok) return { ok: false, error: ctx.error };

  const supabase = await createClient();
  const { error } = await supabase
    .from("games")
    .update({ is_active: isActive })
    .eq("id", gameId);

  if (error) return { ok: false, error: "Could not update game." };

  await logAdminAudit({
    actorAccountId: ctx.accountId,
    action: "catalog.game_toggled",
    resourceType: "game",
    resourceId: gameId,
    metadata: { isActive },
  });

  revalidatePath("/admin/catalog");
  return { ok: true };
}

export async function markCrossplayReviewed(
  gameId: string,
): Promise<CatalogActionResult> {
  const ctx = await requireAdmin("catalog");
  if (!ctx.ok) return { ok: false, error: ctx.error };

  const supabase = await createClient();
  const { error } = await supabase
    .from("crossplay_sets")
    .update({ reviewed_at: new Date().toISOString() })
    .eq("game_id", gameId);

  if (error) return { ok: false, error: "Could not update crossplay review." };

  await logAdminAudit({
    actorAccountId: ctx.accountId,
    action: "catalog.crossplay_reviewed",
    resourceType: "game",
    resourceId: gameId,
  });

  revalidatePath("/admin/catalog");
  return { ok: true };
}

export async function updateCatalogGamePlatforms(
  gameId: string,
  platformIds: string[],
): Promise<CatalogActionResult> {
  const ctx = await requireAdmin("catalog");
  if (!ctx.ok) return { ok: false, error: ctx.error };

  const parsed = gamePlatformsSchema.safeParse({
    gameId,
    platformIds: [...new Set(platformIds)],
  });
  if (!parsed.success) {
    return { ok: false, error: "Select at least one valid platform." };
  }

  const supabase = await createClient();
  const { error } = await supabase.rpc("set_catalog_game_platforms", {
    p_game_id: parsed.data.gameId,
    p_platform_ids: parsed.data.platformIds,
  });
  if (error) return { ok: false, error: "Could not update game platforms." };

  await logAdminAudit({
    actorAccountId: ctx.accountId,
    action: "catalog.game_platforms_updated",
    resourceType: "game",
    resourceId: parsed.data.gameId,
    metadata: { platformIds: parsed.data.platformIds },
  });

  revalidatePath("/admin/catalog");
  return { ok: true };
}
