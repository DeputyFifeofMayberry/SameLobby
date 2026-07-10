import { describe, expect, it } from "vitest";
import { assignReportSeverity } from "@/domains/moderation/severity";

describe("[SL-T089][unit] @p1 moderation severity", () => {
  describe("assignReportSeverity", () => {
    it("returns p0 for imminent-harm keywords", () => {
      expect(assignReportSeverity("other", "credible suicide threat")).toBe("p0");
    });

    it("returns p1 for harassment", () => {
      expect(assignReportSeverity("harassment", "keeps insulting me")).toBe("p1");
    });

    it("returns p2 for inappropriate content", () => {
      expect(
        assignReportSeverity("inappropriate_content", "sent lewd images"),
      ).toBe("p2");
    });

    it("returns p3 for spam", () => {
      expect(assignReportSeverity("spam", "repeated promo links")).toBe("p3");
    });
  });
});
