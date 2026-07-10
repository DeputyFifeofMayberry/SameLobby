import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  updateUser: vi.fn(),
  push: vi.fn(),
  refresh: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mocks.push, refresh: mocks.refresh }),
}));

vi.mock("@/lib/supabase/client", () => ({
  createClient: () => ({
    auth: { updateUser: mocks.updateUser },
  }),
}));

import { ResetPasswordForm } from "@/components/auth/ResetPasswordForm";

describe("[SL-T009][component] @p1 ResetPasswordForm", () => {
  afterEach(() => {
    cleanup();
  });

  beforeEach(() => {
    vi.clearAllMocks();
    mocks.updateUser.mockResolvedValue({ error: null });
  });

  it("shows mismatch validation before calling Supabase", async () => {
    const user = userEvent.setup();
    render(<ResetPasswordForm />);

    await user.type(document.getElementById("password")!, "ValidPass1");
    await user.type(document.getElementById("confirmPassword")!, "OtherPass1");
    await user.click(screen.getByRole("button", { name: /set new password/i }));

    expect(await screen.findByRole("alert")).toHaveTextContent(
      /passwords do not match/i,
    );
    expect(mocks.updateUser).not.toHaveBeenCalled();
  });

  it("shows weak password validation", async () => {
    const user = userEvent.setup();
    render(<ResetPasswordForm />);

    await user.type(document.getElementById("password")!, "short");
    await user.type(document.getElementById("confirmPassword")!, "short");
    await user.click(screen.getByRole("button", { name: /set new password/i }));

    expect(await screen.findByRole("alert")).toHaveTextContent(/at least 8/i);
    expect(mocks.updateUser).not.toHaveBeenCalled();
  });

  it("shows pending state and disables inputs while saving", async () => {
    const user = userEvent.setup();
    let resolveUpdate: (value: { error: null }) => void = () => {};
    mocks.updateUser.mockImplementation(
      () =>
        new Promise((resolve) => {
          resolveUpdate = resolve;
        }),
    );

    render(<ResetPasswordForm />);
    await user.type(document.getElementById("password")!, "ValidPass1");
    await user.type(document.getElementById("confirmPassword")!, "ValidPass1");
    await user.click(screen.getByRole("button", { name: /set new password/i }));

    expect(screen.getByRole("button", { name: /saving/i })).toBeDisabled();
    expect(document.getElementById("password")).toBeDisabled();

    resolveUpdate({ error: null });
    await waitFor(() => {
      expect(mocks.push).toHaveBeenCalledWith("/sign-in");
    });
  });

  it("surfaces update errors accessibly", async () => {
    const user = userEvent.setup();
    mocks.updateUser.mockResolvedValue({ error: { message: "expired" } });

    render(<ResetPasswordForm />);
    await user.type(document.getElementById("password")!, "ValidPass1");
    await user.type(document.getElementById("confirmPassword")!, "ValidPass1");
    await user.click(screen.getByRole("button", { name: /set new password/i }));

    expect(await screen.findByRole("alert")).toHaveTextContent(
      /could not update password/i,
    );
    expect(mocks.push).not.toHaveBeenCalled();
  });
});
