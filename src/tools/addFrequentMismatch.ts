import { addFrequentMismatch as add } from '../state/transactionState.js';

/**
 * Records a repeated mismatch between a local payee and a matched payee.
 */
export async function addFrequentMismatch(localPayee: string, matchedPayee: string) {
  add(localPayee, matchedPayee);
  return { success: true };
}
