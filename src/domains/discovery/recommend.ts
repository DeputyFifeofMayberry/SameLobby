import { MAX_RECOMMENDATIONS } from "@/domains/discovery/constants";
import {
  buildReasonCodes,
  checkEligibility,
  type EligibilityContext,
} from "@/domains/discovery/eligibility";
import type { DiscoveryCandidate } from "@/domains/discovery/types";

export type ScoredCandidate = {
  target: DiscoveryCandidate;
  reasonCodes: string[];
};

export function rankEligibleCandidates(
  viewer: DiscoveryCandidate,
  candidates: DiscoveryCandidate[],
  blockedPairs: Set<string>,
  crossplayByGame: Map<string, Set<string>[]>,
): ScoredCandidate[] {
  const scored: ScoredCandidate[] = [];

  for (const target of candidates) {
    const ctx: EligibilityContext = {
      viewer,
      target,
      blockedPairs,
      crossplayByGame,
    };
    const result = checkEligibility(ctx);
    if (!result.eligible) continue;

    const reasonCodes = buildReasonCodes({ viewer, target, crossplayByGame });
    scored.push({ target, reasonCodes });
  }

  scored.sort((a, b) => {
    if (b.reasonCodes.length !== a.reasonCodes.length) {
      return b.reasonCodes.length - a.reasonCodes.length;
    }
    return a.target.displayName.localeCompare(b.target.displayName);
  });

  return scored.slice(0, MAX_RECOMMENDATIONS);
}
