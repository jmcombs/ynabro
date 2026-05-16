/**
 * Smoke tests for ynabro.
 *
 * These tests verify the public contract of the library.
 * No external YNAB API calls are mocked.
 * Real usage is exercised manually with a valid YNAB token.
 */

import { describe, expect, it } from "vitest";
import { YnabroClient } from "../src/client/YnabroClient.js";
import {
  approveTransaction,
  getPendingTransactions,
  getPlanInfo,
  getRecentTransactions,
} from "../src/index.js";

describe("ynabro smoke tests", () => {
  it("should export YnabroClient", () => {
    expect(YnabroClient).toBeDefined();
  });

  it("should export all core tools", () => {
    expect(getPendingTransactions).toBeDefined();
    expect(getRecentTransactions).toBeDefined();
    expect(approveTransaction).toBeDefined();
    expect(getPlanInfo).toBeDefined();
  });

  it("should throw when creating client with empty token", () => {
    expect(() => new YnabroClient("")).toThrow("YNAB token is required");
  });
});
