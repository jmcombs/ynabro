import { getTransactionModuleState as getState } from "../state/transactionState.js";

/**
 * Returns the current state of the transactions module.
 */
export async function getTransactionModuleState() {
  return getState();
}
