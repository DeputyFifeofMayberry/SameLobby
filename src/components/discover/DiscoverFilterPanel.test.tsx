import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn() }),
}));

vi.mock("next/link", () => ({
  default: ({
    children,
    href,
  }: {
    children: React.ReactNode;
    href: string;
  }) => <a href={href}>{children}</a>,
}));

vi.mock("@/domains/games/queries", () => ({
  listGames: vi.fn(async () => [
    { id: "game-1", name: "Fortnite", slug: "fortnite" },
  ]),
  listPlatforms: vi.fn(async () => [
    { id: "platform-1", name: "PC", slug: "pc" },
  ]),
}));

import { DiscoverFilterPanel } from "./DiscoverFilterPanel";

describe("[SL-T038][component] @p2 DiscoverFilterPanel", () => {
  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  it("renders discover filters with game, platform, and goal fields", async () => {
    const element = await DiscoverFilterPanel();
    render(element);

    expect(
      screen.getByRole("heading", { name: "Search players" }),
    ).toBeInTheDocument();
    expect(screen.getByLabelText("Game")).toBeInTheDocument();
    expect(screen.getByLabelText("Platform")).toBeInTheDocument();
    expect(screen.getByLabelText("Goal")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Advanced search" })).toHaveAttribute(
      "href",
      "/discover/search",
    );
  });
});
