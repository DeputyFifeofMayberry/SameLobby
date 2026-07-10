import { describe, expect, it } from "vitest";
import {
  captureRedirectPath,
  createActionContextMocks,
  invokeServerAction,
} from "../../support/action-context";
import { createBarrier } from "../../support/concurrency";
import { assertLocalProjectId } from "../../support/guards";
import { createTestRunId } from "../../support/run-id";

describe("integration support harness", () => {
  it("exposes action-context and concurrency skeletons", () => {
    const mocks = createActionContextMocks();
    expect(mocks.redirect.path).toBeNull();

    const barrier = createBarrier();
    expect(typeof barrier.release).toBe("function");
    expect(typeof barrier.wait).toBe("function");
  });

  it("enforces local SameLobby project id", () => {
    expect(() => assertLocalProjectId("SameLobby")).not.toThrow();
  });

  it("captures Next.js redirect digests from server actions", async () => {
    const redirectError = Object.assign(new Error("NEXT_REDIRECT"), {
      digest: "NEXT_REDIRECT;replace;/discover;307;",
    });

    const invoked = await invokeServerAction(async () => {
      throw redirectError;
    }, null);

    expect(invoked.redirectPath).toBe("/discover");
    expect(invoked.mocks.redirect.path).toBe("/discover");
    expect(invoked.error).toBeNull();
  });

  it("parses redirect paths from digest helpers", () => {
    expect(
      captureRedirectPath({
        digest: "NEXT_REDIRECT;replace;/profile;307;",
      }),
    ).toBe("/profile");
  });

  it("creates run-scoped ids for fixture namespaces", () => {
    const runId = createTestRunId("integration");
    expect(runId.startsWith("integration-")).toBe(true);
  });
});
