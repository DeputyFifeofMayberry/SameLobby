import { describe, expect, it } from "vitest";
import type { Account } from "@/domains/accounts/types";
import type { GamerProfile } from "@/domains/profile/types";
import {
  attestationPath,
  blockedAccountPath,
  getAccountRouteRedirect,
  resolvePostAuthRedirect,
} from "@/domains/accounts/account-guard";

function account(status: Account["status"]): Account {
  return {
    id: "acct-1",
    auth_user_id: "user-1",
    email: "user@test.local",
    status,
    adult_attested_at: status === "active" ? "2026-01-01T00:00:00Z" : null,
    terms_version: null,
    privacy_version: null,
    community_standards_version: null,
    locale: "en",
    time_zone: "America/Los_Angeles",
    created_at: "2026-01-01T00:00:00Z",
    updated_at: "2026-01-01T00:00:00Z",
    deleted_at: null,
  };
}

function profile(
  overrides: Partial<GamerProfile> = {},
): Pick<GamerProfile, "onboarding_step" | "onboarding_completed_at"> {
  return {
    onboarding_step: "identity",
    onboarding_completed_at: null,
    ...overrides,
  };
}

describe("[SL-T002][unit] @p0 account guard", () => {
  describe("getAccountRouteRedirect", () => {
    it("redirects unauthenticated users to sign-in", () => {
      expect(getAccountRouteRedirect(null, null, "/discover")).toBe("/sign-in");
    });

    it("gates onboarding accounts to attestation", () => {
      expect(
        getAccountRouteRedirect(account("onboarding"), null, "/discover"),
      ).toBe(attestationPath());
      expect(
        getAccountRouteRedirect(account("onboarding"), null, attestationPath()),
      ).toBeNull();
    });

    it("allows deletion_pending users on billing self-service routes only", () => {
      expect(
        getAccountRouteRedirect(account("deletion_pending"), null, "/discover"),
      ).toBe(blockedAccountPath());
      expect(
        getAccountRouteRedirect(
          account("deletion_pending"),
          null,
          "/settings/account",
        ),
      ).toBeNull();
      expect(
        getAccountRouteRedirect(
          account("deletion_pending"),
          null,
          "/subscription",
        ),
      ).toBeNull();
    });

    it.each(["suspended", "restricted", "deleted"] as const)(
      "blocks %s accounts from app routes except billing self-service",
      (status) => {
        expect(
          getAccountRouteRedirect(account(status), null, "/messages"),
        ).toBe(blockedAccountPath());
        expect(
          getAccountRouteRedirect(account(status), null, "/settings/account"),
        ).toBeNull();
      },
    );

    it("routes incomplete active onboarding to the current step", () => {
      expect(
        getAccountRouteRedirect(
          account("active"),
          profile({ onboarding_step: "games" }),
          "/discover",
        ),
      ).toBe("/onboarding/games");
      expect(
        getAccountRouteRedirect(
          account("active"),
          profile({ onboarding_step: "games" }),
          "/onboarding/games",
        ),
      ).toBeNull();
    });

    it("redirects attested users away from attestation routes", () => {
      expect(
        getAccountRouteRedirect(
          account("active"),
          profile({ onboarding_step: "identity" }),
          attestationPath(),
        ),
      ).toBe("/onboarding/identity");
    });

    it("redirects completed users away from onboarding routes", () => {
      expect(
        getAccountRouteRedirect(
          account("active"),
          profile({
            onboarding_step: "preview",
            onboarding_completed_at: "2026-01-02T00:00:00Z",
          }),
          "/onboarding/identity",
        ),
      ).toBe("/discover");
      expect(
        getAccountRouteRedirect(
          account("active"),
          profile({
            onboarding_step: "preview",
            onboarding_completed_at: "2026-01-02T00:00:00Z",
          }),
          "/profile",
        ),
      ).toBeNull();
    });
  });

  describe("resolvePostAuthRedirect", () => {
    it("falls back to safe next path for anonymous users", () => {
      expect(resolvePostAuthRedirect(null, null, "/messages")).toBe("/messages");
      expect(resolvePostAuthRedirect(null, null, "//evil")).toBe("/discover");
    });

    it("routes onboarding users to attestation", () => {
      expect(resolvePostAuthRedirect(account("onboarding"), null)).toBe(
        attestationPath(),
      );
    });

    it("routes active incomplete users to onboarding step", () => {
      expect(
        resolvePostAuthRedirect(
          account("active"),
          profile({ onboarding_step: "communication" }),
        ),
      ).toBe("/onboarding/communication");
    });

    it("routes completed active users to discover or safe next", () => {
      const completed = profile({
        onboarding_step: "preview",
        onboarding_completed_at: "2026-01-02T00:00:00Z",
      });
      expect(resolvePostAuthRedirect(account("active"), completed)).toBe(
        "/discover",
      );
      expect(
        resolvePostAuthRedirect(account("active"), completed, "/messages"),
      ).toBe("/messages");
    });

    it.each([
      "deletion_pending",
      "suspended",
      "restricted",
      "deleted",
    ] as const)("routes %s users to account settings", (status) => {
      expect(resolvePostAuthRedirect(account(status), null)).toBe(
        blockedAccountPath(),
      );
    });
  });
});
