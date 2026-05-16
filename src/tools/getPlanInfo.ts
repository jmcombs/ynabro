import type { YnabroClient } from "../client/YnabroClient.js";
import type { YnabPlan } from "../types/ynab.js";

/**
 * Get basic information about a specific plan.
 */
export async function getPlanInfo(
  client: YnabroClient,
  planId: string,
): Promise<YnabPlan | undefined> {
  const plans = await client.getPlans();
  return plans.find((p) => p.id === planId);
}
