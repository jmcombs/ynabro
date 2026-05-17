/**
 * Unit tests for checkOnboardingStatus.
 */

import { describe, expect, it, vi } from "vitest";
import { checkOnboardingStatus } from "../src/index.js";
import type { YnabroConfigAdapter } from "../src/index.js";

describe("checkOnboardingStatus", () => {
  it("returns ready: true and missing: [] when token and plan are present", async () => {
    const adapter: YnabroConfigAdapter = {
      hasToken: async () => true,
      getDefaultPlanId: async () => "plan-123",
      setDefaultPlanId: async () => {},
    };

    const status = await checkOnboardingStatus(adapter);

    expect(status.ready).toBe(true);
    expect(status.missing).toEqual([]);
  });

  it("returns ready: false and missing: ['token', 'plan'] when both are absent", async () => {
    const adapter: YnabroConfigAdapter = {
      hasToken: async () => false,
      getDefaultPlanId: async () => undefined,
      setDefaultPlanId: async () => {},
    };

    const status = await checkOnboardingStatus(adapter);

    expect(status.ready).toBe(false);
    expect(status.missing).toEqual(["token", "plan"]);
  });

  it("returns ready: false and missing: ['token'] when only token is absent", async () => {
    const adapter: YnabroConfigAdapter = {
      hasToken: async () => false,
      getDefaultPlanId: async () => "plan-123",
      setDefaultPlanId: async () => {},
    };

    const status = await checkOnboardingStatus(adapter);

    expect(status.ready).toBe(false);
    expect(status.missing).toEqual(["token"]);
  });

  it("returns ready: false and missing: ['plan'] when only plan is absent", async () => {
    const adapter: YnabroConfigAdapter = {
      hasToken: async () => true,
      getDefaultPlanId: async () => undefined,
      setDefaultPlanId: async () => {},
    };

    const status = await checkOnboardingStatus(adapter);

    expect(status.ready).toBe(false);
    expect(status.missing).toEqual(["plan"]);
  });

  it("tokenInstructions is a non-empty string in all cases", async () => {
    const adapter: YnabroConfigAdapter = {
      hasToken: async () => false,
      getDefaultPlanId: async () => undefined,
      setDefaultPlanId: async () => {},
    };

    const status = await checkOnboardingStatus(adapter);

    expect(status.tokenInstructions).toBeDefined();
    expect(typeof status.tokenInstructions).toBe("string");
    expect(status.tokenInstructions.length).toBeGreaterThan(0);
  });

  it("tokenInstructions contains the YNAB developer settings URL", async () => {
    const adapter: YnabroConfigAdapter = {
      hasToken: async () => false,
      getDefaultPlanId: async () => undefined,
      setDefaultPlanId: async () => {},
    };

    const status = await checkOnboardingStatus(adapter);

    expect(status.tokenInstructions).toContain(
      "https://app.ynab.com/settings/developer",
    );
  });

  it("nextStep is a non-empty string when ready is false", async () => {
    const adapter: YnabroConfigAdapter = {
      hasToken: async () => false,
      getDefaultPlanId: async () => undefined,
      setDefaultPlanId: async () => {},
    };

    const status = await checkOnboardingStatus(adapter);

    expect(status.ready).toBe(false);
    expect(status.nextStep).toBeDefined();
    expect(typeof status.nextStep).toBe("string");
    expect(status.nextStep!.length).toBeGreaterThan(0);
  });

  it("nextStep is undefined when ready is true", async () => {
    const adapter: YnabroConfigAdapter = {
      hasToken: async () => true,
      getDefaultPlanId: async () => "plan-123",
      setDefaultPlanId: async () => {},
    };

    const status = await checkOnboardingStatus(adapter);

    expect(status.ready).toBe(true);
    expect(status.nextStep).toBeUndefined();
  });
});
