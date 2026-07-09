import type { ModerationSeverity, ReportCategory } from "@/domains/moderation/types";

const P0_PATTERNS =
  /\b(kill|murder|suicide|doxx|dox |csam|child abuse|rape threat)\b/i;

export function assignReportSeverity(
  category: ReportCategory,
  description: string,
): ModerationSeverity {
  if (P0_PATTERNS.test(description)) {
    return "p0";
  }
  if (category === "harassment" || category === "scam") {
    return "p1";
  }
  if (category === "inappropriate_content") {
    return "p2";
  }
  return "p3";
}
