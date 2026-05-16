import { Type } from "@sinclair/typebox";
import { definePluginEntry } from "openclaw/plugin-sdk/plugin-entry";
import type { YnabroConfigAdapter } from "ynabro";
import {
  approveTransaction,
  getPendingTransactions,
  getPlanInfo,
  getRecentTransactions,
  getSkillState,
  setupYnab,
  updateSkillState,
  YnabroClient,
} from "ynabro";

function params(raw: unknown): Record<string, unknown> {
  return raw as Record<string, unknown>;
}

function ok(text: string) {
  return {
    content: [{ type: "text" as const, text }],
    details: undefined,
  };
}

const approveSchema = Type.Object({
  transactionId: Type.String({
    description: "The ID of the transaction to approve",
  }),
});

const saveDefaultPlanSchema = Type.Object({
  planId: Type.String({
    description: "The ID of the YNAB plan to set as the default",
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

export default definePluginEntry({
  id: "openclaw-ynabro",
  name: "YNABro",
  description: "YNAB budget management tools for OpenClaw agents",
  register(api) {
    let cachedPlanId: string | undefined;

    const openClawAdapter: YnabroConfigAdapter = {
      async getDefaultPlanId(): Promise<string | undefined> {
        if (cachedPlanId !== undefined) return cachedPlanId;
        return (api.pluginConfig as { defaultPlanId?: string } | undefined)
          ?.defaultPlanId;
      },
      async setDefaultPlanId(planId: string): Promise<void> {
        cachedPlanId = planId;
        await api.runtime.config.mutateConfigFile({
          afterWrite: { mode: "auto" },
          mutate: (draft) => {
            // Ensure the path exists before writing
            if (!draft.plugins) draft.plugins = {} as typeof draft.plugins;
            if (!draft.plugins.entries) draft.plugins.entries = {};
            const existing = draft.plugins.entries["openclaw-ynabro"] ?? {};
            const existingConfig =
              (existing.config as Record<string, unknown> | undefined) ?? {};
            existingConfig.defaultPlanId = planId;
            draft.plugins.entries["openclaw-ynabro"] = {
              ...existing,
              config: existingConfig,
            };
          },
        });
      },
    };

    function getClient(): YnabroClient {
      const token = (api.pluginConfig as { token?: string } | undefined)
        ?.token;
      if (!token) {
        throw new Error(
          "YNAB token not configured. " +
            "Set it via plugins.entries.openclaw-ynabro.config.token in openclaw.json.",
        );
      }
      return new YnabroClient(token);
    }

    async function getDefaultPlanId(): Promise<string> {
      const planId = await openClawAdapter.getDefaultPlanId();
      if (!planId) {
        throw new Error(
          "No default plan configured. Run ynabro_setup then ynabro_save_default_plan to complete onboarding.",
        );
      }
      return planId;
    }

    api.registerTool({
      name: "ynabro_setup",
      label: "Setup YNAB",
      description:
        "Fetch available YNAB plans for onboarding. Returns a list of plans. " +
        "After the user selects one, call ynabro_save_default_plan with the chosen plan ID.",
      parameters: Type.Object({}),
      async execute() {
        const client = getClient();
        const plans = await client.getPlans();
        if (plans.length === 0) {
          return ok(
            JSON.stringify({ error: "No plans found in your YNAB account." }),
          );
        }
        return ok(
          JSON.stringify({
            plans: plans.map((p) => ({ id: p.id, name: p.name })),
          }),
        );
      },
    });

    api.registerTool({
      name: "ynabro_save_default_plan",
      label: "Save Default Plan",
      description:
        "Save a YNAB plan as the default for all subsequent tool calls. " +
        "Call ynabro_setup first to get the list of available plan IDs.",
      parameters: saveDefaultPlanSchema,
      async execute(_id, raw) {
        const p = params(raw);
        const client = getClient();
        const plans = await client.getPlans();
        await setupYnab(
          client,
          plans,
          p.planId as string,
          openClawAdapter,
        );
        const saved = plans.find((plan) => plan.id === p.planId);
        return ok(
          JSON.stringify({
            message: `Default plan set to: ${saved?.name ?? p.planId}`,
            defaultPlanId: p.planId,
          }),
        );
      },
    });

    api.registerTool({
      name: "ynabro_get_pending_transactions",
      label: "Get Pending Transactions",
      description: "Get all pending (uncategorized) transactions for a plan",
      parameters: Type.Object({}),
      async execute() {
        const [client, planId] = await Promise.all([
          Promise.resolve(getClient()),
          getDefaultPlanId(),
        ]);
        const result = await getPendingTransactions(client, planId);
        return ok(JSON.stringify(result, null, 2));
      },
    });

    api.registerTool({
      name: "ynabro_get_recent_transactions",
      label: "Get Recent Transactions",
      description: "Get recent transactions for a plan",
      parameters: Type.Object({}),
      async execute() {
        const [client, planId] = await Promise.all([
          Promise.resolve(getClient()),
          getDefaultPlanId(),
        ]);
        const result = await getRecentTransactions(client, planId);
        return ok(JSON.stringify(result, null, 2));
      },
    });

    api.registerTool({
      name: "ynabro_approve_transaction",
      label: "Approve Transaction",
      description: "Approve a specific transaction",
      parameters: approveSchema,
      async execute(_id, raw) {
        const p = params(raw);
        const [client, planId] = await Promise.all([
          Promise.resolve(getClient()),
          getDefaultPlanId(),
        ]);
        await approveTransaction(client, planId, p.transactionId as string);
        return ok(JSON.stringify({ success: true }));
      },
    });

    api.registerTool({
      name: "ynabro_get_plan_info",
      label: "Get Plan Info",
      description: "Get basic information about a plan",
      parameters: Type.Object({}),
      async execute() {
        const [client, planId] = await Promise.all([
          Promise.resolve(getClient()),
          getDefaultPlanId(),
        ]);
        const result = await getPlanInfo(client, planId);
        return ok(JSON.stringify(result, null, 2));
      },
    });

    api.registerTool({
      name: "ynabro_get_skill_state",
      label: "Get Skill State",
      description:
        "Get the current state for a skill, including memory and auto_approve_enabled flag",
      parameters: skillStateSchema,
      async execute(_id, raw) {
        const p = params(raw);
        const result = await getSkillState(p.skillSlug as string);
        return ok(JSON.stringify(result, null, 2));
      },
    });

    api.registerTool({
      name: "ynabro_update_skill_state",
      label: "Update Skill State",
      description:
        "Update the state for a skill — merge partial updates into existing state",
      parameters: updateSkillStateSchema,
      async execute(_id, raw) {
        const p = params(raw);
        const result = await updateSkillState(
          p.skillSlug as string,
          p.updates as object,
        );
        return ok(JSON.stringify(result, null, 2));
      },
    });
  },
});
