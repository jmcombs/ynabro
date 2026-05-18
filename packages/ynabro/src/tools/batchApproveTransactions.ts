import type { YnabroClient } from "../client/YnabroClient.js";

/**
 * Approves multiple transactions in a single batch operation.
 *
 * This is significantly more efficient than calling approveTransaction
 * for each transaction individually, helping stay within YNAB's rate limits.
 *
 * @param client - An initialized YnabroClient instance
 * @param planId - The ID of the YNAB plan
 * @param transactionIds - Array of transaction IDs to approve
 * @returns Promise that resolves when all transactions are approved
 *
 * @example
 * await batchApproveTransactions(client, planId, ["tx1", "tx2", "tx3"]);
 */
export async function batchApproveTransactions(
  client: YnabroClient,
  planId: string,
  transactionIds: string[],
): Promise<void> {
  const updates = transactionIds.map((id) => ({ id, approved: true }));
  return client.batchUpdateTransactions(planId, updates);
}
