import type { YnabroClient } from "../client/YnabroClient.js";
import type { YnabTransaction } from "../types/ynab.js";

/**
 * Fetches recent transactions (both approved and pending) for a plan.
 *
 * Useful for providing context or performing audits.
 *
 * @param client - An initialized YnabroClient instance
 * @param planId - The ID of the YNAB plan
 * @returns Array of recent transactions
 */
export async function getRecentTransactions(
  client: YnabroClient,
  planId: string,
): Promise<YnabTransaction[]> {
  return client.getTransactions(planId);
}
