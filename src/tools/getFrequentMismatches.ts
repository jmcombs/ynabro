import { getTransactionModuleState } from '../state/transactionState.js';

/**
 * Returns known frequent mismatches.
 */
export async function getFrequentMismatches() {
  const state = getTransactionModuleState();
  return state.patterns.frequent_mismatches;
}
