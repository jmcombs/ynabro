import * as ynab from "ynab";
import type { YnabPlan, YnabTransaction } from "../types/ynab.js";

/**
 * YnabroClient - Core wrapper around the official YNAB SDK.
 *
 * Provides a cleaner, more agent-friendly interface for common YNAB operations.
 * Handles authentication and normalizes responses.
 */
export class YnabroClient {
  private api: ynab.api;

  /**
   * Creates a new YnabroClient instance.
   * @param token - YNAB Personal Access Token
   */
  constructor(token: string) {
    if (!token) {
      throw new Error("YNAB token is required");
    }
    this.api = new ynab.api(token);
  }

  /**
   * Retrieves all plans (budgets) for the authenticated user.
   * @returns Array of plans with basic metadata
   */
  async getPlans(): Promise<YnabPlan[]> {
    const response = await this.api.plans.getPlans();
    return response.data.plans as YnabPlan[];
  }

  /**
   * Retrieves transactions for a specific plan.
   * @param planId - The ID of the plan
   * @param options - Optional filters (e.g. type: 'uncategorized')
   * @returns Array of transactions
   */
  async getTransactions(
    planId: string,
    options?: { type?: "uncategorized" | "all" },
  ): Promise<YnabTransaction[]> {
    const response = await this.api.transactions.getTransactions(planId);
    let txs = response.data.transactions as YnabTransaction[];

    if (options?.type === "uncategorized") {
      txs = txs.filter((t) => !t.approved);
    }
    return txs;
  }

  /**
   * Updates a transaction (e.g. to approve it).
   * @param planId - The ID of the plan
   * @param transactionId - The ID of the transaction to update
   * @param patch - Fields to update (currently only `approved`)
   */
  async updateTransaction(
    planId: string,
    transactionId: string,
    patch: { approved?: boolean },
  ): Promise<void> {
    await this.api.transactions.updateTransaction(planId, transactionId, {
      // biome-ignore lint/suspicious/noExplicitAny: Required due to incomplete YNAB SDK types
      transaction: patch as unknown as any,
    });
  }
}
