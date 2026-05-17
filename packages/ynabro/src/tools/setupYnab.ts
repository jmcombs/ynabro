import type { YnabroClient } from "../client/YnabroClient.js";
import type { YnabPlan } from "../types/ynab.js";

export interface YnabroConfigAdapter {
  hasToken(): Promise<boolean>;
  getDefaultPlanId(): Promise<string | undefined>;
  setDefaultPlanId(planId: string): Promise<void>;
}

/**
 * Sets up YNAB integration by validating and storing the selected plan ID.
 *
 * @param _client - YnabroClient instance (unused in this implementation)
 * @param plans - Array of available YNAB plans
 * @param selectedPlanId - The plan ID to set as default
 * @param adapter - Configuration adapter for persisting the selection
 * @throws Error if selectedPlanId is not found in plans
 */
export async function setupYnab(
  _client: YnabroClient,
  plans: YnabPlan[],
  selectedPlanId: string,
  adapter: YnabroConfigAdapter,
): Promise<void> {
  const planExists = plans.some((plan) => plan.id === selectedPlanId);

  if (!planExists) {
    const validIds = plans.map((p) => p.id).join(", ");
    throw new Error(
      `Plan ID "${selectedPlanId}" not found. Valid IDs: ${validIds}`,
    );
  }

  await adapter.setDefaultPlanId(selectedPlanId);
}
