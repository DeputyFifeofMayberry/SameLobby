export type ReportCategory =
  | "harassment"
  | "spam"
  | "inappropriate_content"
  | "scam"
  | "other";

export type ReportStatus =
  | "received"
  | "triaged"
  | "case_opened"
  | "closed"
  | "dismissed";

export type ModerationSeverity = "p0" | "p1" | "p2" | "p3";

export type ModerationCaseStatus =
  | "open"
  | "investigating"
  | "action_taken"
  | "appealed"
  | "closed";

export type ModerationActionType =
  | "warn"
  | "restrict_messaging"
  | "restrict_discovery"
  | "suspend"
  | "close_no_action";

export type AppealStatus =
  | "submitted"
  | "under_review"
  | "upheld"
  | "modified"
  | "reversed";

export type UserReportListItem = {
  id: string;
  caseId: string | null;
  status: ReportStatus;
  category: ReportCategory;
  createdAt: string;
  limitedStatusLabel: string;
};

export type EligibleAppeal = {
  actionId: string;
  caseId: string;
  actionType: ModerationActionType;
  appealDeadlineAt: string;
};
