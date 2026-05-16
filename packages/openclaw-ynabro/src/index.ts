import { Type } from "@sinclair/typebox";
import { definePluginEntry } from "openclaw/plugin-sdk/plugin-entry";
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

function getClient(): YnabroClient {
  const token = process.env.YNAB_TOKEN;
  if (!token) throw new Error("YNAB_TOKEN environment variable is not set");
  return new YnabroClient(token);
}

function params(raw: unknown): Record<string, unknown> {
  return raw as Record<string, unknown>;
}

function ok(text: string) {
  return {
    content: [{ type: "text" as const, text }],
    details: undefined,
  };
}

const planIdSchema = Type.Object({
  planId: Type.String({ description: "The ID of the YNAB plan" }),
});

const approveSchema = Type.Object({
  planId: Type.String({ description: "The ID of the YNAB plan" }),
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

export default definePluginEntry({
  id: "openclaw-ynabro",
  name: "YNABro",
  description: "YNAB budget management tools for OpenClaw agents",
  register(api) {
    api.registerTool({
      name: "ynabro_setup",
      label: "Setup YNAB",
      description:
        "Set up YNAB integration — checks for token and selects a default plan",
      parameters: Type.Object({}),
      async execute() {
        const result = await setupYnab();
        return ok(JSON.stringify(result, null, 2));
      },
    });

    api.registerTool({
      name: "ynabro_get_pending_transactions",
      label: "Get Pending Transactions",
      description: "Get all pending (uncategorized) transactions for a plan",
      parameters: planIdSchema,
      async execute(_id, raw) {
        const p = params(raw);
        const result = await getPendingTransactions(
          getClient(),
          p.planId as string,
        );
        return ok(JSON.stringify(result, null, 2));
      },
    });

    api.registerTool({
      name: "ynabro_get_recent_transactions",
      label: "Get Recent Transactions",
      description: "Get recent transactions for a plan",
      parameters: planIdSchema,
      async execute(_id, raw) {
        const p = params(raw);
        const result = await getRecentTransactions(
          getClient(),
          p.planId as string,
        );
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
        await approveTransaction(
          getClient(),
          p.planId as string,
          p.transactionId as string,
        );
        return ok(JSON.stringify({ success: true }));
      },
    });

    api.registerTool({
      name: "ynabro_get_plan_info",
      label: "Get Plan Info",
      description: "Get basic information about a plan",
      parameters: planIdSchema,
      async execute(_id, raw) {
        const p = params(raw);
        const result = await getPlanInfo(getClient(), p.planId as string);
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
