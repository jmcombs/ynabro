import type { YnabroClient } from "../client/YnabroClient.js";
import type { YnabPlan } from "../types/ynab.js";

/**
 * Retrieves basic information about a specific plan.
 *
 * @param client - An initialized YnabroClient instance
 * @param planId - The ID of the plan to look up
 * @returns The plan object if found, otherwise undefined
 */
export async function getPlanInfo(
  client: YnabroClient,
  planId: string,
): Promise<YnabPlan | undefined> {
  const plans = await client.getPlans();
  return plans.find((p) => p.id === planId);
}
