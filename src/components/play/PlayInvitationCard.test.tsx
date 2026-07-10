import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { PlayInvitationCard } from "./PlayInvitationCard";

describe("[SL-T073][component] @p2 PlayInvitationCard", () => {
  afterEach(() => {
    cleanup();
  });

  it("renders invitation summary with profile and detail links", () => {
    const expiresAt = new Date("2026-08-01T18:00:00Z").toISOString();

    render(
      <PlayInvitationCard
        invitation={{
          id: "inv-1",
          direction: "incoming",
          status: "proposed",
          otherAccountId: "peer-1",
          otherDisplayName: "PeerOne",
          gameName: "Fortnite",
          platformName: "PC",
          schedulingMode: "scheduled",
          expiresAt,
          createdAt: new Date().toISOString(),
        }}
        viewerTimeZone="America/Los_Angeles"
      />,
    );

    expect(screen.getByRole("link", { name: "PeerOne" })).toHaveAttribute(
      "href",
      "/profile/peer-1",
    );
    expect(screen.getByText(/Incoming · proposed/i)).toBeInTheDocument();
    expect(screen.getByText(/Fortnite · PC/)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "View invitation" })).toHaveAttribute(
      "href",
      "/play/invitations/inv-1",
    );
  });
});
