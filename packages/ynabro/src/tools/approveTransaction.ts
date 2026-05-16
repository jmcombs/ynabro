import type { YnabroClient } from "../client/YnabroClient.js";

/**
 * Approves a specific transaction in a plan.
 *
 * Should only be called after high-confidence matching or explicit user approval.
 *
 * @param client - An initialized YnabroClient instance
 * @param planId - The ID of the YNAB plan
 * @param transactionId - The ID of the transaction to approve
 * @returns Promise that resolves when the transaction is approved
 *
 * @sideEffect Updates the transaction's `approved` status in YNAB
 */
export async function approveTransaction(
  client: YnabroClient,
  planId: string,
  transactionId: string,
): Promise<void> {
  return client.updateTransaction(planId, transactionId, { approved: true });
}
