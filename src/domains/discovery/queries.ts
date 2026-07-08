import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import {
  buildCohortKey,
  cohortStatusFromCount,
  pickAnchorGameSlug,
} from "@/domains/discovery/cohort";
import { checkEligibility } from "@/domains/discovery/eligibility";
import { rankEligibleCandidates } from "@/domains/discovery/recommend";
import { REASON_CODE_LABELS } from "@/domains/discovery/constants";
import type {
  CohortSnapshot,
  DiscoveryCandidate,
  DiscoveryRecommendation,
  RecommendationCard,
} from "@/domains/discovery/types";
import type { CommunicationMode, IntentGoal } from "@/domains/profile/types";
import { getCurrentIntent, getGamerProfileForAccount } from "@/domains/profile/queries";

type RawCandidateRow = {
  account_id: string;
  locale: string;
  time_zone: string;
  display_name: string;
  communication_modes: CommunicationMode[];
  introduction: string | null;
  goal: IntentGoal;
  intent_game_id: string | null;
  intent_platform_id: string | null;
};

async function loadCrossplayMap(): Promise<Map<string, Set<string>[]>> {
  const admin = createAdminClient();
  const { data } = await admin.from("crossplay_sets").select("game_id, platform_ids");
  const map = new Map<string, Set<string>[]>();
  for (const row of data ?? []) {
    const sets = map.get(row.game_id) ?? [];
    sets.push(new Set(row.platform_ids as string[]));
    map.set(row.game_id, sets);
  }
  return map;
}

async function loadBlockedPairs(viewerAccountId: string): Promise<Set<string>> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("blocks")
    .select("blocker_account_id, blocked_account_id")
    .or(
      `blocker_account_id.eq.${viewerAccountId},blocked_account_id.eq.${viewerAccountId}`,
    );

  const pairs = new Set<string>();
  for (const row of data ?? []) {
    pairs.add(`${row.blocker_account_id}:${row.blocked_account_id}`);
  }
  return pairs;
}

async function loadAvailability(accountId: string) {
  const admin = createAdminClient();
  const { data } = await admin
    .from("availability_windows")
    .select("day_of_week, start_time, end_time")
    .eq("account_id", accountId);
  return (data ?? []).map((w) => ({
    dayOfWeek: w.day_of_week as number,
    startTime: w.start_time as string,
    endTime: w.end_time as string,
  }));
}

async function loadUserGamesForCandidate(accountId: string) {
  const admin = createAdminClient();
  const { data } = await admin
    .from("user_games")
    .select(
      "game_id, platform_id, game:games(name, slug, is_anchor), platform:platforms(name)",
    )
    .eq("account_id", accountId)
    .eq("is_active", true);

  return (data ?? []).map((row) => {
    const game = row.game as unknown as {
      name: string;
      slug: string;
      is_anchor: boolean;
    } | null;
    const platform = row.platform as unknown as { name: string } | null;
    return {
      gameId: row.game_id as string,
      platformId: row.platform_id as string,
      gameName: game?.name ?? "Game",
      platformName: platform?.name ?? "Platform",
      gameSlug: game?.slug ?? "",
      isAnchor: game?.is_anchor ?? false,
    };
  });
}

async function rowToCandidate(row: RawCandidateRow): Promise<DiscoveryCandidate> {
  const [userGames, availability] = await Promise.all([
    loadUserGamesForCandidate(row.account_id),
    loadAvailability(row.account_id),
  ]);

  return {
    accountId: row.account_id,
    locale: row.locale,
    timeZone: row.time_zone,
    displayName: row.display_name,
    communicationModes: row.communication_modes,
    introduction: row.introduction,
    goal: row.goal,
    intentGameId: row.intent_game_id,
    intentPlatformId: row.intent_platform_id,
    userGames: userGames.map((g) => ({
      gameId: g.gameId,
      platformId: g.platformId,
      gameName: g.gameName,
      platformName: g.platformName,
    })),
    availability,
  };
}

async function loadDiscoverableCandidates(
  excludeAccountId: string,
): Promise<RawCandidateRow[]> {
  const admin = createAdminClient();
  const { data: accounts } = await admin
    .from("accounts")
    .select("id, locale, time_zone")
    .eq("status", "active")
    .not("adult_attested_at", "is", null)
    .neq("id", excludeAccountId);

  if (!accounts?.length) return [];

  const accountIds = accounts.map((a) => a.id);
  const { data: profiles } = await admin
    .from("gamer_profiles")
    .select(
      "account_id, display_name, communication_modes, introduction, onboarding_completed_at, discovery_paused_at",
    )
    .in("account_id", accountIds)
    .not("onboarding_completed_at", "is", null)
    .is("discovery_paused_at", null);

  const profileByAccount = new Map(
    (profiles ?? []).map((p) => [p.account_id as string, p]),
  );

  const eligibleIds = accountIds.filter((id) => profileByAccount.has(id));
  if (!eligibleIds.length) return [];

  const { data: intents } = await admin
    .from("current_intents")
    .select("account_id, goal, game_id, platform_id")
    .in("account_id", eligibleIds)
    .eq("status", "active");

  const intentByAccount = new Map(
    (intents ?? []).map((i) => [i.account_id as string, i]),
  );

  const rows: RawCandidateRow[] = [];
  for (const account of accounts) {
    const profile = profileByAccount.get(account.id);
    const intent = intentByAccount.get(account.id);
    if (!profile || !intent) continue;

    rows.push({
      account_id: account.id,
      locale: account.locale as string,
      time_zone: (account.time_zone as string) ?? "UTC",
      display_name: (profile.display_name as string) ?? "Player",
      communication_modes: profile.communication_modes as CommunicationMode[],
      introduction: profile.introduction as string | null,
      goal: intent.goal as IntentGoal,
      intent_game_id: intent.game_id as string | null,
      intent_platform_id: intent.platform_id as string | null,
    });
  }

  return rows;
}

export async function buildViewerCandidate(
  accountId: string,
): Promise<DiscoveryCandidate | null> {
  const admin = createAdminClient();
  const { data: account } = await admin
    .from("accounts")
    .select("id, locale, time_zone, status, adult_attested_at")
    .eq("id", accountId)
    .maybeSingle();

  if (!account || account.status !== "active" || !account.adult_attested_at) {
    return null;
  }

  const profile = await getGamerProfileForAccount(accountId);
  const intent = await getCurrentIntent(accountId);
  if (!profile?.onboarding_completed_at || !intent) return null;

  return rowToCandidate({
    account_id: accountId,
    locale: account.locale as string,
    time_zone: (account.time_zone as string) ?? "UTC",
    display_name: profile.display_name ?? "Player",
    communication_modes: profile.communication_modes,
    introduction: profile.introduction,
    goal: intent.goal,
    intent_game_id: intent.game_id ?? null,
    intent_platform_id: intent.platform_id ?? null,
  });
}

export async function getCohortSnapshot(
  accountId: string,
): Promise<CohortSnapshot | null> {
  const viewer = await buildViewerCandidate(accountId);
  if (!viewer) return null;

  const userGames = await loadUserGamesForCandidate(accountId);
  const anchorSlug = pickAnchorGameSlug(userGames);
  const cohortKey = buildCohortKey(
    viewer.locale,
    viewer.timeZone,
    anchorSlug,
  );

  const admin = createAdminClient();
  const allRows = await loadDiscoverableCandidates(accountId);
  const region = viewer.timeZone.split("/")[0];
  const qualifiedCount =
    allRows.filter(
      (r) =>
        r.locale === viewer.locale &&
        r.time_zone.startsWith(`${region}/`) &&
        r.account_id !== accountId,
    ).length + 1;

  const supabase = await createClient();
  const { data: demand } = await supabase
    .from("demand_signals")
    .select("id")
    .eq("account_id", accountId)
    .eq("cohort_key", cohortKey)
    .maybeSingle();

  const hasDemandSignal = Boolean(demand);

  let status = cohortStatusFromCount(qualifiedCount, hasDemandSignal);

  const { data: stored } = await supabase
    .from("cohort_activation_status")
    .select("status")
    .eq("cohort_key", cohortKey)
    .maybeSingle();

  if (stored?.status) {
    status = stored.status as CohortSnapshot["status"];
  }

  return { cohortKey, status, qualifiedCount, hasDemandSignal };
}

export async function refreshRecommendations(
  accountId: string,
): Promise<void> {
  const viewer = await buildViewerCandidate(accountId);
  if (!viewer) return;

  const [rawCandidates, blockedPairs, crossplayByGame] = await Promise.all([
    loadDiscoverableCandidates(accountId),
    loadBlockedPairs(accountId),
    loadCrossplayMap(),
  ]);

  const candidates = await Promise.all(rawCandidates.map(rowToCandidate));
  const ranked = rankEligibleCandidates(
    viewer,
    candidates,
    blockedPairs,
    crossplayByGame,
  );

  const admin = createAdminClient();
  const expiresAt = new Date();
  expiresAt.setHours(expiresAt.getHours() + 24);

  await admin
    .from("discovery_recommendations")
    .delete()
    .eq("viewer_account_id", accountId);

  if (ranked.length === 0) return;

  await admin.from("discovery_recommendations").insert(
    ranked.map((r) => ({
      viewer_account_id: accountId,
      recommended_account_id: r.target.accountId,
      reason_codes: r.reasonCodes,
      expires_at: expiresAt.toISOString(),
    })),
  );
}

export async function getActiveRecommendations(
  accountId: string,
): Promise<RecommendationCard[]> {
  const supabase = await createClient();
  const now = new Date().toISOString();

  const { data: recs } = await supabase
    .from("discovery_recommendations")
    .select("id, recommended_account_id, reason_codes, expires_at")
    .eq("viewer_account_id", accountId)
    .gt("expires_at", now)
    .order("created_at", { ascending: true });

  if (!recs?.length) return [];

  const admin = createAdminClient();
  const accountIds = recs.map((r) => r.recommended_account_id as string);

  const { data: profiles } = await admin
    .from("gamer_profiles")
    .select("account_id, display_name")
    .in("account_id", accountIds);

  const { data: intents } = await admin
    .from("current_intents")
    .select("account_id, goal")
    .in("account_id", accountIds)
    .eq("status", "active");

  const profileMap = new Map(
    (profiles ?? []).map((p) => [p.account_id as string, p.display_name as string]),
  );
  const intentMap = new Map(
    (intents ?? []).map((i) => [i.account_id as string, i.goal as IntentGoal]),
  );

  return recs.map((rec) => {
    const reasonLabels = (rec.reason_codes as string[]).map(
      (code) => REASON_CODE_LABELS[code] ?? code,
    );
    return {
      recommendationId: rec.id as string,
      accountId: rec.recommended_account_id as string,
      displayName: profileMap.get(rec.recommended_account_id as string) ?? "Player",
      reasonLabels,
      sharedGameLabel: reasonLabels.includes("Shared game") ? "Shared game" : null,
      goal: intentMap.get(rec.recommended_account_id as string) ?? "gaming_friendship",
    };
  });
}

export async function searchDiscoverableProfiles(
  accountId: string,
  filters: { gameId?: string; platformId?: string; goal?: IntentGoal; query?: string },
): Promise<RecommendationCard[]> {
  const viewer = await buildViewerCandidate(accountId);
  if (!viewer) return [];

  const [rawCandidates, blockedPairs, crossplayByGame] = await Promise.all([
    loadDiscoverableCandidates(accountId),
    loadBlockedPairs(accountId),
    loadCrossplayMap(),
  ]);

  let candidates = await Promise.all(rawCandidates.map(rowToCandidate));

  if (filters.query?.trim()) {
    const q = filters.query.trim().toLowerCase();
    candidates = candidates.filter((c) =>
      c.displayName.toLowerCase().includes(q),
    );
  }

  if (filters.gameId) {
    candidates = candidates.filter((c) =>
      c.userGames.some((g) => g.gameId === filters.gameId),
    );
  }

  if (filters.platformId) {
    candidates = candidates.filter((c) =>
      c.userGames.some((g) => g.platformId === filters.platformId),
    );
  }

  if (filters.goal) {
    candidates = candidates.filter((c) => c.goal === filters.goal);
  }

  const ranked = rankEligibleCandidates(
    viewer,
    candidates,
    blockedPairs,
    crossplayByGame,
  );

  return ranked.map((r) => ({
    recommendationId: r.target.accountId,
    accountId: r.target.accountId,
    displayName: r.target.displayName,
    reasonLabels: r.reasonCodes.map((code) => REASON_CODE_LABELS[code] ?? code),
    sharedGameLabel: null,
    goal: r.target.goal,
  }));
}

export async function canViewProfile(
  viewerAccountId: string,
  targetAccountId: string,
): Promise<boolean> {
  if (viewerAccountId === targetAccountId) return true;

  const [viewer, targetRows] = await Promise.all([
    buildViewerCandidate(viewerAccountId),
    loadDiscoverableCandidates(viewerAccountId),
  ]);

  if (!viewer) return false;

  const targetRow = targetRows.find((r) => r.account_id === targetAccountId);
  if (!targetRow) return false;

  const [target, blockedPairs, crossplayByGame] = await Promise.all([
    rowToCandidate(targetRow),
    loadBlockedPairs(viewerAccountId),
    loadCrossplayMap(),
  ]);

  const result = checkEligibility({
    viewer,
    target,
    blockedPairs,
    crossplayByGame,
  });

  return result.eligible;
}

export async function getDiscoverableProfileBundle(targetAccountId: string) {
  const admin = createAdminClient();
  const [{ data: account }, { data: profile }, { data: userGamesRaw }, { data: intent }] =
    await Promise.all([
      admin
        .from("accounts")
        .select("id, locale, time_zone")
        .eq("id", targetAccountId)
        .maybeSingle(),
      admin
        .from("gamer_profiles")
        .select("*")
        .eq("account_id", targetAccountId)
        .maybeSingle(),
      admin
        .from("user_games")
        .select(
          "id, account_id, game_id, platform_id, is_active, sort_order, game:games(id, slug, name, is_anchor, sort_order), platform:platforms(id, slug, name, sort_order)",
        )
        .eq("account_id", targetAccountId)
        .eq("is_active", true)
        .order("sort_order"),
      admin
        .from("current_intents")
        .select("*")
        .eq("account_id", targetAccountId)
        .eq("status", "active")
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle(),
    ]);

  return {
    account,
    profile,
    userGames: userGamesRaw ?? [],
    intent,
  };
}

export async function isDiscoveryPaused(accountId: string): Promise<boolean> {
  const admin = createAdminClient();
  const { data } = await admin
    .from("gamer_profiles")
    .select("discovery_paused_at")
    .eq("account_id", accountId)
    .maybeSingle();

  return Boolean(data?.discovery_paused_at);
}

export type { DiscoveryRecommendation };
