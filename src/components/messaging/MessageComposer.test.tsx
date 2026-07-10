import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  sendMessage: vi.fn(),
}));

vi.mock("@/domains/messaging/actions", () => ({
  sendMessage: mocks.sendMessage,
}));

import { MessageComposer } from "@/components/messaging/MessageComposer";

function ComposerHarness({
  linksEnabled = false,
  initialDraft = "",
}: {
  linksEnabled?: boolean;
  initialDraft?: string;
}) {
  const [draft, setDraft] = useState(initialDraft);
  return (
    <MessageComposer
      conversationId="conv-1"
      linksInMessagesEnabled={linksEnabled}
      draft={draft}
      onDraftChange={setDraft}
    />
  );
}

describe("[SL-T054][component] @p1 MessageComposer", () => {
  afterEach(() => {
    cleanup();
  });

  beforeEach(() => {
    vi.clearAllMocks();
    mocks.sendMessage.mockResolvedValue({ ok: true });
  });

  it("keeps submit disabled for empty drafts", () => {
    render(<ComposerHarness />);
    expect(screen.getByRole("button", { name: "Send message" })).toBeDisabled();
  });

  it("blocks links until the user confirms", async () => {
    const user = userEvent.setup();
    render(<ComposerHarness initialDraft="see https://example.com" />);

    await user.click(screen.getByRole("button", { name: "Send message" }));
    expect(await screen.findByRole("alert")).toHaveTextContent(/contains a link/i);
    expect(mocks.sendMessage).not.toHaveBeenCalled();

    await user.click(screen.getByRole("button", { name: /send anyway/i }));
    await user.click(screen.getByRole("button", { name: "Send message" }));
    await waitFor(() => {
      expect(mocks.sendMessage).toHaveBeenCalled();
    });
  });

  it("shows server errors from the mocked action", async () => {
    const user = userEvent.setup();
    mocks.sendMessage.mockResolvedValue({
      ok: false,
      error: "Could not send message.",
    });

    render(<ComposerHarness initialDraft="Hello there" />);
    await user.click(screen.getByRole("button", { name: "Send message" }));

    expect(await screen.findByRole("alert")).toHaveTextContent(
      /could not send message/i,
    );
  });

  it("clears the draft after a successful send", async () => {
    const user = userEvent.setup();
    render(<ComposerHarness initialDraft="Hello there" />);
    await user.click(screen.getByRole("button", { name: "Send message" }));

    await waitFor(() => {
      expect(screen.getByLabelText(/message/i)).toHaveValue("");
    });
  });
});
