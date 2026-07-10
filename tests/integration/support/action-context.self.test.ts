import { describe, expect, it } from "vitest";
import { createActionContextMocks } from "../../support/action-context";
import { createBarrier } from "../../support/concurrency";
import { assertLocalProjectId } from "../../support/guards";

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
});
