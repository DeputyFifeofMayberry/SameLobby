import type { CommunicationMode, IntentGoal } from "@/domains/profile/types";
import { timeZoneRegion } from "@/domains/discovery/cohort";
import type { DiscoveryCandidate } from "@/domains/discovery/types";

export type EligibilityContext = {
  viewer: DiscoveryCandidate;
  target: DiscoveryCandidate;
  blockedPairs: Set<string>;
  crossplayByGame: Map<string, Set<string>[]>;
};

export type EligibilityResult =
  | { eligible: true }
  | { eligible: false; reason: string };

function blockKey(a: string, b: string): string {
  return `${a}:${b}`;
}

export function isBlocked(
  viewerAccountId: string,
  targetAccountId: string,
  blockedPairs: Set<string>,
): boolean {
  return (
    blockedPairs.has(blockKey(viewerAccountId, targetAccountId)) ||
    blockedPairs.has(blockKey(targetAccountId, viewerAccountId))
  );
}

function sharedGames(
  viewer: DiscoveryCandidate,
  target: DiscoveryCandidate,
): { gameId: string; gameName: string }[] {
  const targetByGame = new Map(
    target.userGames.map((g) => [g.gameId, g.gameName] as const),
  );
  const shared: { gameId: string; gameName: string }[] = [];
  for (const g of viewer.userGames) {
    if (targetByGame.has(g.gameId)) {
      shared.push({ gameId: g.gameId, gameName: g.gameName });
    }
  }
  return shared;
}

function platformsForGame(
  candidate: DiscoveryCandidate,
  gameId: string,
): Set<string> {
  return new Set(
    candidate.userGames
      .filter((g) => g.gameId === gameId)
      .map((g) => g.platformId),
  );
}

export function canPlayOnSharedGame(
  viewer: DiscoveryCandidate,
  target: DiscoveryCandidate,
  gameId: string,
  crossplayByGame: Map<string, Set<string>[]>,
): boolean {
  const viewerPlatforms = platformsForGame(viewer, gameId);
  const targetPlatforms = platformsForGame(target, gameId);

  for (const vp of viewerPlatforms) {
    if (targetPlatforms.has(vp)) return true;
  }

  const sets = crossplayByGame.get(gameId) ?? [];
  for (const set of sets) {
    let viewerIn = false;
    let targetIn = false;
    for (const vp of viewerPlatforms) {
      if (set.has(vp)) viewerIn = true;
    }
    for (const tp of targetPlatforms) {
      if (set.has(tp)) targetIn = true;
    }
    if (viewerIn && targetIn) return true;
  }

  return false;
}

function schedulesOverlap(
  a: DiscoveryCandidate["availability"],
  b: DiscoveryCandidate["availability"],
): boolean {
  for (const wa of a) {
    for (const wb of b) {
      if (wa.dayOfWeek !== wb.dayOfWeek) continue;
      if (wa.startTime < wb.endTime && wb.startTime < wa.endTime) {
        return true;
      }
    }
  }
  return false;
}

function sharedCommunication(
  viewerModes: CommunicationMode[],
  targetModes: CommunicationMode[],
): boolean {
  return viewerModes.some((m) => targetModes.includes(m));
}

function sameLocale(viewer: DiscoveryCandidate, target: DiscoveryCandidate): boolean {
  return viewer.locale === target.locale;
}

function sameTimeZoneRegion(
  viewer: DiscoveryCandidate,
  target: DiscoveryCandidate,
): boolean {
  return timeZoneRegion(viewer.timeZone) === timeZoneRegion(target.timeZone);
}

function goalsAlign(viewerGoal: IntentGoal, targetGoal: IntentGoal): boolean {
  return viewerGoal === targetGoal;
}

/** Hard eligibility rules — never relaxed for density or demand. */
export function checkEligibility(ctx: EligibilityContext): EligibilityResult {
  const { viewer, target, blockedPairs, crossplayByGame } = ctx;

  if (viewer.accountId === target.accountId) {
    return { eligible: false, reason: "self" };
  }

  if (!sameLocale(viewer, target)) {
    return { eligible: false, reason: "locale_mismatch" };
  }

  if (isBlocked(viewer.accountId, target.accountId, blockedPairs)) {
    return { eligible: false, reason: "blocked" };
  }

  const games = sharedGames(viewer, target);
  if (games.length === 0) {
    return { eligible: false, reason: "no_shared_game" };
  }

  const playable = games.some((g) =>
    canPlayOnSharedGame(viewer, target, g.gameId, crossplayByGame),
  );
  if (!playable) {
    return { eligible: false, reason: "not_playable_together" };
  }

  if (!sharedCommunication(viewer.communicationModes, target.communicationModes)) {
    return { eligible: false, reason: "communication_mismatch" };
  }

  if (!goalsAlign(viewer.goal, target.goal)) {
    return { eligible: false, reason: "goal_mismatch" };
  }

  return { eligible: true };
}

export type ReasonCodeInput = {
  viewer: DiscoveryCandidate;
  target: DiscoveryCandidate;
  crossplayByGame: Map<string, Set<string>[]>;
};

export function buildReasonCodes(input: ReasonCodeInput): string[] {
  const { viewer, target, crossplayByGame } = input;
  const codes: string[] = [];
  const games = sharedGames(viewer, target);

  if (games.length > 0) {
    codes.push("shared_game");
  }

  const playableGame = games.find((g) =>
    canPlayOnSharedGame(viewer, target, g.gameId, crossplayByGame),
  );
  if (playableGame) {
    codes.push("playable_together");
  }

  if (goalsAlign(viewer.goal, target.goal)) {
    codes.push("shared_goal");
  }

  if (
    viewer.availability.length > 0 &&
    target.availability.length > 0 &&
    schedulesOverlap(viewer.availability, target.availability)
  ) {
    codes.push("overlapping_availability");
  }

  if (sharedCommunication(viewer.communicationModes, target.communicationModes)) {
    codes.push("shared_communication");
  }

  if (sameTimeZoneRegion(viewer, target)) {
    codes.push("time_zone_region");
  }

  return codes;
}
