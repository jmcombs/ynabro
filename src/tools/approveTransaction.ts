import type { YnabroClient } from "../client/YnabroClient.js";

/**
 * Approve a specific transaction.
 * Used by agents after high-confidence matching.
 */
export async function approveTransaction(
  client: YnabroClient,
  planId: string,
  transactionId: string,
): Promise<void> {
  return client.updateTransaction(planId, transactionId, { approved: true });
}
