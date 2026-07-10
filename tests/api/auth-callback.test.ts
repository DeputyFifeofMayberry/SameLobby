import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  exchangeCodeForSession: vi.fn(),
  getUser: vi.fn(),
  getAccountForUser: vi.fn(),
  getGamerProfileForAccount: vi.fn(),
}));

vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn(async () => ({
    auth: {
      exchangeCodeForSession: mocks.exchangeCodeForSession,
      getUser: mocks.getUser,
    },
  })),
}));

vi.mock("@/domains/accounts/queries", () => ({
  getAccountForUser: mocks.getAccountForUser,
}));

vi.mock("@/domains/profile/queries", () => ({
  getGamerProfileForAccount: mocks.getGamerProfileForAccount,
}));

import { GET } from "@/app/(auth)/auth/callback/route";

describe("[SL-T007][api] @p0 auth callback route", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("redirects to sign-in when code exchange fails", async () => {
    mocks.exchangeCodeForSession.mockResolvedValue({
      error: { message: "bad code" },
    });

    const response = await GET(
      new Request("http://localhost:3000/auth/callback?code=bad"),
    );

    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toBe(
      "http://localhost:3000/sign-in?error=auth",
    );
  });

  it("redirects recovery flows to reset-password", async () => {
    mocks.exchangeCodeForSession.mockResolvedValue({ error: null });
    mocks.getUser.mockResolvedValue({ data: { user: { id: "user-1" } } });
    mocks.getAccountForUser.mockResolvedValue({
      id: "acct-1",
      status: "active",
      adult_attested_at: "2026-01-01T00:00:00Z",
    });
    mocks.getGamerProfileForAccount.mockResolvedValue({
      onboarding_step: "preview",
      onboarding_completed_at: "2026-01-02T00:00:00Z",
    });

    const response = await GET(
      new Request(
        "http://localhost:3000/auth/callback?code=ok&type=recovery",
      ),
    );

    expect(response.headers.get("location")).toBe(
      "http://localhost:3000/auth/reset-password",
    );
  });

  it("resolves post-auth destination for successful sign-in", async () => {
    mocks.exchangeCodeForSession.mockResolvedValue({ error: null });
    mocks.getUser.mockResolvedValue({ data: { user: { id: "user-1" } } });
    mocks.getAccountForUser.mockResolvedValue({
      id: "acct-1",
      status: "active",
      adult_attested_at: "2026-01-01T00:00:00Z",
    });
    mocks.getGamerProfileForAccount.mockResolvedValue({
      onboarding_step: "preview",
      onboarding_completed_at: "2026-01-02T00:00:00Z",
    });

    const response = await GET(
      new Request(
        "http://localhost:3000/auth/callback?code=ok&next=%2Fmessages",
      ),
    );

    expect(response.headers.get("location")).toBe(
      "http://localhost:3000/messages",
    );
  });

  it("rejects unsafe next redirects after callback", async () => {
    mocks.exchangeCodeForSession.mockResolvedValue({ error: null });
    mocks.getUser.mockResolvedValue({ data: { user: { id: "user-1" } } });
    mocks.getAccountForUser.mockResolvedValue({
      id: "acct-1",
      status: "active",
      adult_attested_at: "2026-01-01T00:00:00Z",
    });
    mocks.getGamerProfileForAccount.mockResolvedValue({
      onboarding_step: "preview",
      onboarding_completed_at: "2026-01-02T00:00:00Z",
    });

    const response = await GET(
      new Request(
        "http://localhost:3000/auth/callback?code=ok&next=https%3A%2F%2Fevil.example",
      ),
    );

    expect(response.headers.get("location")).toBe(
      "http://localhost:3000/discover",
    );
  });

  it("routes onboarding users to attestation after callback", async () => {
    mocks.exchangeCodeForSession.mockResolvedValue({ error: null });
    mocks.getUser.mockResolvedValue({ data: { user: { id: "user-1" } } });
    mocks.getAccountForUser.mockResolvedValue({
      id: "acct-1",
      status: "onboarding",
      adult_attested_at: null,
    });
    mocks.getGamerProfileForAccount.mockResolvedValue({
      onboarding_step: "identity",
      onboarding_completed_at: null,
    });

    const response = await GET(
      new Request("http://localhost:3000/auth/callback?code=ok"),
    );

    expect(response.headers.get("location")).toBe(
      "http://localhost:3000/onboarding/attestation",
    );
  });
});
