import {
  MAX_PENDING_OUTGOING_REQUESTS,
  MAX_REQUESTS_PER_DAY,
} from "@/domains/connections/constants";

export type RequestLimitInput = {
  pendingOutgoingCount: number;
  requestsSentLast24Hours: number;
};

export function connectionRequestLimitError(
  input: RequestLimitInput,
): string | null {
  if (input.pendingOutgoingCount >= MAX_PENDING_OUTGOING_REQUESTS) {
    return `You can have at most ${MAX_PENDING_OUTGOING_REQUESTS} pending outgoing requests.`;
  }
  if (input.requestsSentLast24Hours >= MAX_REQUESTS_PER_DAY) {
    return `You can send at most ${MAX_REQUESTS_PER_DAY} connection requests per day.`;
  }
  return null;
}

export function orderedPair(
  accountA: string,
  accountB: string,
): { userA: string; userB: string } {
  return accountA < accountB
    ? { userA: accountA, userB: accountB }
    : { userA: accountB, userB: accountA };
}

export function otherParticipant(
  connection: { user_a_id: string; user_b_id: string },
  viewerAccountId: string,
): string {
  return connection.user_a_id === viewerAccountId
    ? connection.user_b_id
    : connection.user_a_id;
}
