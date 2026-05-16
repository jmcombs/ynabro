import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";
import { AuthStorage } from "@earendil-works/pi-coding-agent";
import { Type } from "typebox";
import {
  approveTransaction,
  getPendingTransactions,
  getPlanInfo,
  getRecentTransactions,
  getSkillState,
  updateSkillState,
  YnabroClient,
} from "ynabro";

interface YnabroConfigAdapter {
  getDefaultPlanId(): Promise<string | undefined>;
  setDefaultPlanId(planId: string): Promise<void>;
}

const authStorage = AuthStorage.create();

const piConfigAdapter: YnabroConfigAdapter = {
  async getDefaultPlanId(): Promise<string | undefined> {
    const credential = authStorage.get("ynab-plan");
    if (credential?.type === "api_key") {
      return credential.key;
    }
    return undefined;
  },
  async setDefaultPlanId(planId: string): Promise<void> {
    authStorage.set("ynab-plan", { type: "api_key", key: planId });
  },
};

async function getClient(): Promise<YnabroClient> {
  const token = await authStorage.getApiKey("ynab");
  if (!token) {
    throw new Error(
      "YNAB token not configured. Run ynabro_setup to complete onboarding.",
    );
  }
  return new YnabroClient(token);
}

async function getDefaultPlanId(): Promise<string> {
  const planId = await piConfigAdapter.getDefaultPlanId();
  if (!planId) {
    throw new Error(
      "No default plan configured. Run ynabro_setup to complete onboarding.",
    );
  }
  return planId;
}

const approveSchema = Type.Object({
  transactionId: Type.String({
    description: "The ID of the transaction to approve",
  }),
});

const skillStateSchema = Type.Object({
  skillSlug: Type.String({
    description: "The slug identifier for the skill",
  }),
});

const updateSkillStateSchema = Type.Object({
  skillSlug: Type.String({
    description: "The slug identifier for the skill",
  }),
  updates: Type.Object(
    {},
    {
      additionalProperties: true,
      description:
        "Partial state updates to merge (e.g. { memory: [...], auto_approve_enabled: true })",
    },
  ),
});

export default function ynabroExtension(api: ExtensionAPI): void {
  api.registerTool({
    name: "ynabro_get_pending_transactions",
    label: "Get Pending Transactions",
    description:
      "Get all pending (uncategorized) transactions for the default plan",
    parameters: Type.Object({}),
    async execute(_toolCallId, _params) {
      const [client, planId] = await Promise.all([
        getClient(),
        getDefaultPlanId(),
      ]);
      const result = await getPendingTransactions(client, planId);
      return {
        content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
        details: undefined,
      };
    },
  });

  api.registerTool({
    name: "ynabro_get_recent_transactions",
    label: "Get Recent Transactions",
    description: "Get recent transactions for the default plan",
    parameters: Type.Object({}),
    async execute(_toolCallId, _params) {
      const [client, planId] = await Promise.all([
        getClient(),
        getDefaultPlanId(),
      ]);
      const result = await getRecentTransactions(client, planId);
      return {
        content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
        details: undefined,
      };
    },
  });

  api.registerTool({
    name: "ynabro_approve_transaction",
    label: "Approve Transaction",
    description: "Approve a specific transaction in the default plan",
    parameters: approveSchema,
    async execute(_toolCallId, params) {
      const [client, planId] = await Promise.all([
        getClient(),
        getDefaultPlanId(),
      ]);
      await approveTransaction(client, planId, params.transactionId);
      return {
        content: [{ type: "text", text: JSON.stringify({ success: true }) }],
        details: undefined,
      };
    },
  });

  api.registerTool({
    name: "ynabro_get_plan_info",
    label: "Get Plan Info",
    description: "Get basic information about the default plan",
    parameters: Type.Object({}),
    async execute(_toolCallId, _params) {
      const [client, planId] = await Promise.all([
        getClient(),
        getDefaultPlanId(),
      ]);
      const result = await getPlanInfo(client, planId);
      return {
        content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
        details: undefined,
      };
    },
  });

  api.registerTool({
    name: "ynabro_setup",
    label: "Setup YNAB",
    description:
      "Set up or reconfigure YNAB integration — stores API token and selects a default plan",
    parameters: Type.Object({}),
    async execute(_toolCallId, _params, _signal, _onUpdate, ctx) {
      // Step 1: Token check
      let token = await authStorage.getApiKey("ynab");
      if (!token) {
        const input = await ctx.ui.input(
          "YNAB Personal Access Token",
          "Paste your token from https://app.ynab.com/settings/developer",
        );
        if (!input) {
          return {
            content: [
              {
                type: "text",
                text: JSON.stringify({
                  error: "Setup cancelled — no token provided.",
                }),
              },
            ],
            details: undefined,
          };
        }
        authStorage.set("ynab", { type: "api_key", key: input });
        token = input;
      }

      // Step 2: Fetch plans
      const client = new YnabroClient(token);
      const plans = await client.getPlans();
      if (plans.length === 0) {
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify({
                error: "No plans found in your YNAB account.",
              }),
            },
          ],
          details: undefined,
        };
      }

      // Step 3: Plan selector
      const planOptions = plans.map((p) => `${p.name} (${p.id})`);
      const selected = await ctx.ui.select(
        "Select your default YNAB plan",
        planOptions,
      );
      if (!selected) {
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify({
                error: "Setup cancelled — no plan selected.",
              }),
            },
          ],
          details: undefined,
        };
      }

      // Step 4: Store and return
      const selectedPlan = plans[planOptions.indexOf(selected)];
      await piConfigAdapter.setDefaultPlanId(selectedPlan.id);
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify({
              message: `Setup complete! Default plan set to: ${selectedPlan.name}`,
              defaultPlanId: selectedPlan.id,
            }),
          },
        ],
        details: undefined,
      };
    },
  });

  api.registerTool({
    name: "ynabro_get_skill_state",
    label: "Get Skill State",
    description:
      "Get the current state for a skill, including memory and auto_approve_enabled flag",
    parameters: skillStateSchema,
    async execute(_toolCallId, params) {
      const result = await getSkillState(params.skillSlug);
      return {
        content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
        details: undefined,
      };
    },
  });

  api.registerTool({
    name: "ynabro_update_skill_state",
    label: "Update Skill State",
    description:
      "Update the state for a skill — merge partial updates into existing state",
    parameters: updateSkillStateSchema,
    async execute(_toolCallId, params) {
      const result = await updateSkillState(params.skillSlug, params.updates);
      return {
        content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
        details: undefined,
      };
    },
  });
}
