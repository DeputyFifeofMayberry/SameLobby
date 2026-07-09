import { z } from "zod";
import {
  GROUP_NAME_MAX,
  GROUP_NAME_MIN,
  GROUP_SIZE_MAX,
  GROUP_SIZE_MIN,
} from "@/domains/groups/constants";

export const createGroupSchema = z.object({
  name: z
    .string()
    .trim()
    .min(GROUP_NAME_MIN, `Name must be at least ${GROUP_NAME_MIN} characters.`)
    .max(GROUP_NAME_MAX, `Name must be ${GROUP_NAME_MAX} characters or fewer.`),
  sizeGoal: z.coerce.number().int().min(GROUP_SIZE_MIN).max(GROUP_SIZE_MAX),
  emblemKey: z.string().optional(),
  sharedGameId: z.string().uuid().optional().or(z.literal("")),
  inviteeIds: z.array(z.string().uuid()).max(7).optional(),
});

export function approvalThresholdMet(
  activeMemberCount: number,
  approveCount: number,
  totalVoters: number,
): boolean {
  if (totalVoters === 0) return false;
  if (activeMemberCount <= 4) {
    return approveCount === totalVoters;
  }
  return approveCount > totalVoters / 2;
}

export function canCreateAnotherGroup(
  ownedCount: number,
  maxOwned: number,
): boolean {
  return ownedCount < maxOwned;
}

/** @deprecated Use canCreateAnotherGroup with entitlements max */
export function canCreateAnotherFreeGroup(activeOwnedCount: number): boolean {
  return canCreateAnotherGroup(activeOwnedCount, 1);
}
