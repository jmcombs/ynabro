/**
 * Unit tests for setupYnab and YnabroConfigAdapter.
 */

import { describe, expect, it, vi } from "vitest";
import type { YnabroClient } from "../src/client/YnabroClient.js";
import type { YnabroConfigAdapter } from "../src/index.js";
import { setupYnab } from "../src/index.js";
import type { YnabPlan } from "../src/types/ynab.js";

const mockClient = {} as unknown as YnabroClient; // setupYnab ignores client internals

const mockPlans: YnabPlan[] = [
  {
    id: "plan-aaa",
    name: "Main Budget",
    last_modified_on: "",
    first_month: "",
    last_month: "",
  },
  {
    id: "plan-bbb",
    name: "Side Hustle",
    last_modified_on: "",
    first_month: "",
    last_month: "",
  },
];

describe("setupYnab", () => {
  it("stores the correct plan ID", async () => {
    const setDefaultPlanIdMock = vi.fn();
    const adapter: YnabroConfigAdapter = {
      getDefaultPlanId: async () => undefined,
      setDefaultPlanId: setDefaultPlanIdMock,
    };

    await setupYnab(mockClient, mockPlans, "plan-aaa", adapter);

    expect(setDefaultPlanIdMock).toHaveBeenCalledWith("plan-aaa");
  });

  it("calls setDefaultPlanId exactly once", async () => {
    const setDefaultPlanIdMock = vi.fn();
    const adapter: YnabroConfigAdapter = {
      getDefaultPlanId: async () => undefined,
      setDefaultPlanId: setDefaultPlanIdMock,
    };

    await setupYnab(mockClient, mockPlans, "plan-aaa", adapter);

    expect(setDefaultPlanIdMock).toHaveBeenCalledOnce();
  });

  it("throws when selectedPlanId not in plans", async () => {
    const adapter: YnabroConfigAdapter = {
      getDefaultPlanId: async () => undefined,
      setDefaultPlanId: async () => {},
    };

    await expect(
      setupYnab(mockClient, mockPlans, "bad-id", adapter),
    ).rejects.toThrow();
  });

  it("error message includes the invalid plan ID", async () => {
    const adapter: YnabroConfigAdapter = {
      getDefaultPlanId: async () => undefined,
      setDefaultPlanId: async () => {},
    };

    await expect(
      setupYnab(mockClient, mockPlans, "bad-id", adapter),
    ).rejects.toThrow("bad-id");
  });

  it("error message lists valid plan IDs", async () => {
    const adapter: YnabroConfigAdapter = {
      getDefaultPlanId: async () => undefined,
      setDefaultPlanId: async () => {},
    };

    try {
      await setupYnab(mockClient, mockPlans, "bad-id", adapter);
      expect.fail("Should have thrown");
    } catch (error) {
      const message = (error as Error).message;
      expect(message).toContain("plan-aaa");
      expect(message).toContain("plan-bbb");
    }
  });

  it("does not call setDefaultPlanId if validation fails", async () => {
    const setDefaultPlanIdMock = vi.fn();
    const adapter: YnabroConfigAdapter = {
      getDefaultPlanId: async () => undefined,
      setDefaultPlanId: setDefaultPlanIdMock,
    };

    try {
      await setupYnab(mockClient, mockPlans, "bad-id", adapter);
    } catch {
      // Expected to throw
    }

    expect(setDefaultPlanIdMock).not.toHaveBeenCalled();
  });

  it("succeeds with single-plan list", async () => {
    const singlePlan: YnabPlan[] = [
      {
        id: "solo",
        name: "Only Budget",
        last_modified_on: "",
        first_month: "",
        last_month: "",
      },
    ];
    const adapter: YnabroConfigAdapter = {
      getDefaultPlanId: async () => undefined,
      setDefaultPlanId: async () => {},
    };

    await expect(
      setupYnab(mockClient, singlePlan, "solo", adapter),
    ).resolves.toBeUndefined();
  });

  it("succeeds selecting the last plan in a multi-plan list", async () => {
    const adapter: YnabroConfigAdapter = {
      getDefaultPlanId: async () => undefined,
      setDefaultPlanId: async () => {},
    };

    await expect(
      setupYnab(mockClient, mockPlans, "plan-bbb", adapter),
    ).resolves.toBeUndefined();
  });
});

describe("YnabroConfigAdapter", () => {
  it("setupYnab is a function", () => {
    expect(typeof setupYnab).toBe("function");
  });

  it("adapter interface can be implemented", () => {
    const adapter: YnabroConfigAdapter = {
      getDefaultPlanId: async () => "x",
      setDefaultPlanId: async () => {},
    };
    expect(adapter).toBeTruthy();
  });
});
