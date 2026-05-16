import type { YnabroClient } from "../client/YnabroClient.js";
import type { YnabTransaction } from "../types/ynab.js";

/**
 * Get all pending (uncategorized) transactions for a plan.
 * This is the primary tool used by the YNAB Guardian agent.
 */
export async function getPendingTransactions(
  client: YnabroClient,
  planId: string,
): Promise<YnabTransaction[]> {
  return client.getTransactions(planId, { type: "uncategorized" });
}
