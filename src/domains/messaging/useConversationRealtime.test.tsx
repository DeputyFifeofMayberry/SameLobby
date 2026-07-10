import { renderHook, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

const removeChannel = vi.fn().mockResolvedValue(undefined);
const subscribe = vi.fn((cb?: (status: string) => void) => {
  cb?.("SUBSCRIBED");
  return { unsubscribe: vi.fn() };
});
const on = vi.fn().mockReturnThis();
const channel = vi.fn(() => ({ on, subscribe }));

vi.mock("@/lib/supabase/client", () => ({
  createClient: () => ({
    channel,
    removeChannel,
  }),
}));

import { useConversationRealtime } from "@/domains/messaging/useConversationRealtime";

describe("[SL-T055][hook-unmount] @p0 conversation realtime hook", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it("removes the realtime channel on unmount", async () => {
    const onMessage = vi.fn();
    const { unmount } = renderHook(() =>
      useConversationRealtime("conv-123", onMessage),
    );

    await waitFor(() => {
      expect(channel).toHaveBeenCalledWith("conversation:conv-123");
    });

    unmount();

    await waitFor(() => {
      expect(removeChannel).toHaveBeenCalled();
    });
  });
});
