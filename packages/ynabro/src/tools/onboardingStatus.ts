import type { YnabroConfigAdapter } from "./setupYnab.js";

export interface OnboardingStatus {
  ready: boolean;
  missing: ("token" | "plan")[];
  tokenInstructions: string;
  nextStep?: string;
}

export const TOKEN_INSTRUCTIONS = `To generate a YNAB Personal Access Token:
1. Go to https://app.ynab.com/settings/developer
2. Click 'New Token'
3. Enter your YNAB password
4. Copy the token (it will only be shown once)`;

export async function checkOnboardingStatus(
  adapter: YnabroConfigAdapter,
): Promise<OnboardingStatus> {
  const [hasToken, planId] = await Promise.all([
    adapter.hasToken(),
    adapter.getDefaultPlanId(),
  ]);

  const missing: ("token" | "plan")[] = [];
  if (!hasToken) {
    missing.push("token");
  }
  if (!planId) {
    missing.push("plan");
  }

  const ready = missing.length === 0;

  return {
    ready,
    missing,
    tokenInstructions: TOKEN_INSTRUCTIONS,
    nextStep: ready
      ? undefined
      : missing.includes("token")
        ? "Please configure your YNAB Personal Access Token."
        : "Please select a default plan.",
  };
}
