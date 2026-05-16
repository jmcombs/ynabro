import { updateTransactionModuleState } from "../state/transactionState.js";

/**
 * Enables or disables automatic approval of confident matches.
 */
export async function setAutoApproveEnabled(enabled: boolean) {
  updateTransactionModuleState({ auto_approve_enabled: enabled });
  return { success: true, auto_approve_enabled: enabled };
}
