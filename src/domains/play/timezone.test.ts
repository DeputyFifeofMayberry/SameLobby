import { describe, expect, it } from "vitest";
import {
  datetimeLocalToUtcIso,
  formatInTimeZone,
  formatSessionRange,
  generateIcsEvent,
} from "@/domains/play/timezone";

describe("[SL-T068][unit] @p1 play timezone", () => {
describe("formatInTimeZone", () => {
  it("formats UTC instant in Los Angeles", () => {
    const label = formatInTimeZone(
      "2026-07-15T20:00:00.000Z",
      "America/Los_Angeles",
      { timeZoneName: "short" },
    );
    expect(label).toContain("Jul");
    expect(label.length).toBeGreaterThan(5);
  });
});

describe("formatSessionRange", () => {
  it("returns single label when zones match", () => {
    const result = formatSessionRange(
      "2026-07-15T20:00:00.000Z",
      60,
      "America/Los_Angeles",
      "America/Los_Angeles",
    );
    expect(result.viewerLabel).toBeTruthy();
    expect(result.otherLabel).toBeNull();
  });

  it("returns other label when zones differ", () => {
    const result = formatSessionRange(
      "2026-07-15T20:00:00.000Z",
      60,
      "America/Los_Angeles",
      "Europe/London",
    );
    expect(result.otherLabel).toBeTruthy();
  });
});

describe("datetimeLocalToUtcIso", () => {
  it("converts local datetime in LA to UTC", () => {
    const iso = datetimeLocalToUtcIso(
      "2026-07-15T13:00",
      "America/Los_Angeles",
    );
    expect(iso).toBeTruthy();
    const hour = new Date(iso!).getUTCHours();
    expect([19, 20]).toContain(hour);
  });
});

describe("generateIcsEvent", () => {
  it("produces DTSTART and DTEND", () => {
    const ics = generateIcsEvent({
      uid: "test@sameLobby",
      summary: "SameLobby play — Fortnite",
      startIso: "2026-07-15T20:00:00.000Z",
      endIso: "2026-07-15T21:00:00.000Z",
    });
    expect(ics).toContain("BEGIN:VEVENT");
    expect(ics).toContain("DTSTART:");
    expect(ics).toContain("DTEND:");
    expect(ics).toContain("END:VEVENT");
  });
});
});
