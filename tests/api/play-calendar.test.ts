import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  getSessionUser: vi.fn(),
  getAccountForUser: vi.fn(),
  getSessionDetail: vi.fn(),
}));

vi.mock("@/domains/accounts/queries", () => ({
  getSessionUser: mocks.getSessionUser,
  getAccountForUser: mocks.getAccountForUser,
}));

vi.mock("@/domains/play/queries", () => ({
  getSessionDetail: mocks.getSessionDetail,
}));

import { GET } from "@/app/api/play/sessions/[id]/calendar/route";

describe("[SL-T069][api] @p1 play calendar route", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 401 when no session user is present", async () => {
    mocks.getSessionUser.mockResolvedValue(null);

    const response = await GET(new Request("http://localhost/api"), {
      params: Promise.resolve({ id: "session-1" }),
    });
    expect(response.status).toBe(401);
  });

  it("returns 404 when the session is not visible to the participant", async () => {
    mocks.getSessionUser.mockResolvedValue({ id: "auth-1" });
    mocks.getAccountForUser.mockResolvedValue({ id: "acct-1" });
    mocks.getSessionDetail.mockResolvedValue(null);

    const response = await GET(new Request("http://localhost/api"), {
      params: Promise.resolve({ id: "missing-session" }),
    });
    expect(response.status).toBe(404);
  });

  it("returns a calendar attachment for an authorized participant", async () => {
    mocks.getSessionUser.mockResolvedValue({ id: "auth-1" });
    mocks.getAccountForUser.mockResolvedValue({ id: "acct-1" });
    mocks.getSessionDetail.mockResolvedValue({
      id: "session-1",
      gameName: "Fortnite",
      confirmed_start_at: "2026-07-10T18:00:00.000Z",
      session_length_minutes: 60,
    });

    const response = await GET(new Request("http://localhost/api"), {
      params: Promise.resolve({ id: "session-1" }),
    });
    expect(response.status).toBe(200);
    expect(response.headers.get("content-type")).toContain("text/calendar");
    expect(response.headers.get("content-disposition")).toContain(
      "samelobby-play.ics",
    );
    const body = await response.text();
    expect(body).toContain("BEGIN:VCALENDAR");
    expect(body).toContain("Fortnite");
  });
});
