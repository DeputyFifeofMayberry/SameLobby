import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { ConnectionRequestView } from "@/domains/connections/types";

const mocks = vi.hoisted(() => ({
  acceptConnectionRequest: vi.fn(),
  declineConnectionRequest: vi.fn(),
  cancelConnectionRequest: vi.fn(),
}));

vi.mock("@/domains/connections/actions", () => ({
  acceptConnectionRequest: mocks.acceptConnectionRequest,
  declineConnectionRequest: mocks.declineConnectionRequest,
  cancelConnectionRequest: mocks.cancelConnectionRequest,
}));

vi.mock("@/components/messaging/ReportForm", () => ({
  ReportForm: () => <div data-testid="report-form" />,
}));

import { ConnectionRequestCard } from "@/components/connections/ConnectionRequestCard";

function pendingIncoming(): ConnectionRequestView {
  const expires = new Date();
  expires.setDate(expires.getDate() + 7);
  return {
    id: "req-1",
    sender_account_id: "sender-1",
    recipient_account_id: "recipient-1",
    intent_id: null,
    message: "Want to duo?",
    status: "pending",
    expires_at: expires.toISOString(),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    responded_at: null,
    otherAccountId: "sender-1",
    otherDisplayName: "PeerOne",
    direction: "incoming",
  };
}

describe("[SL-T046][component] @p1 ConnectionRequestCard", () => {
  afterEach(() => {
    cleanup();
  });

  beforeEach(() => {
    vi.clearAllMocks();
    mocks.acceptConnectionRequest.mockResolvedValue({ ok: true });
    mocks.declineConnectionRequest.mockResolvedValue({ ok: true });
    mocks.cancelConnectionRequest.mockResolvedValue({ ok: true });
  });

  it("accepts an incoming pending request once", async () => {
    const user = userEvent.setup();
    render(<ConnectionRequestCard request={pendingIncoming()} />);

    await user.click(screen.getByRole("button", { name: "Accept" }));
    await waitFor(() => {
      expect(mocks.acceptConnectionRequest).toHaveBeenCalledTimes(1);
      expect(mocks.acceptConnectionRequest).toHaveBeenCalledWith("req-1");
    });
  });

  it("disables actions while a transition is pending", async () => {
    const user = userEvent.setup();
    let resolveAccept: (value: { ok: true }) => void = () => {};
    mocks.acceptConnectionRequest.mockImplementation(
      () =>
        new Promise((resolve) => {
          resolveAccept = resolve;
        }),
    );

    render(<ConnectionRequestCard request={pendingIncoming()} />);
    const accept = screen.getByRole("button", { name: "Accept" });
    const decline = screen.getByRole("button", { name: "Decline" });

    await user.click(accept);
    expect(accept).toBeDisabled();
    expect(decline).toBeDisabled();

    resolveAccept({ ok: true });
    await waitFor(() => {
      expect(mocks.acceptConnectionRequest).toHaveBeenCalledTimes(1);
    });
  });

  it("cancels an outgoing pending request", async () => {
    const user = userEvent.setup();
    const outgoing = { ...pendingIncoming(), direction: "outgoing" as const };
    render(<ConnectionRequestCard request={outgoing} />);

    await user.click(screen.getByRole("button", { name: /cancel request/i }));
    await waitFor(() => {
      expect(mocks.cancelConnectionRequest).toHaveBeenCalledWith("req-1");
    });
  });
});
