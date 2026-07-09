export function canProposeTeammate(input: {
  teammatesEnabled: boolean;
  isConnected: boolean;
  isBlocked: boolean;
  hasCompletedSession: boolean;
}): boolean {
  return (
    input.teammatesEnabled &&
    input.isConnected &&
    !input.isBlocked &&
    input.hasCompletedSession
  );
}
