import type { YnabroClient } from "../client/YnabroClient.js";
import type { YnabTransaction } from "../types/ynab.js";

/**
 * Fetches all pending (uncategorized/unapproved) transactions for a given plan.
 *
 * This is the primary tool used by agents for reviewing transactions that need attention.
 *
 * @param client - An initialized YnabroClient instance
 * @param planId - The ID of the YNAB plan
 * @returns Array of pending transactions
 *
 * @example
 * const pending = await getPendingTransactions(client, planId);
 */
export async function getPendingTransactions(
  client: YnabroClient,
  planId: string,
): Promise<YnabTransaction[]> {
  return client.getTransactions(planId, { type: "uncategorized" });
}
