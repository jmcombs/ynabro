import type { YnabroClient } from "../client/YnabroClient.js";
import type { YnabTransaction } from "../types/ynab.js";

/**
 * Get recent transactions for a plan (approved + pending).
 */
export async function getRecentTransactions(
  client: YnabroClient,
  planId: string,
): Promise<YnabTransaction[]> {
  return client.getTransactions(planId);
}
