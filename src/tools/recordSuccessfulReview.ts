import { recordSuccessfulReview as record } from '../state/transactionState.js';

/**
 * Records a successful manual review (used to track when to suggest auto-approval).
 */
export async function recordSuccessfulReview() {
  record();
  return { success: true };
}
