import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";
import { Type } from "typebox";
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

export default function ynabroExtension(api: ExtensionAPI): void {
  api.registerTool({
    name: "ynabro_get_pending_transactions",
    label: "Get Pending Transactions",
    description: "Get all pending (uncategorized) transactions for a plan",
    parameters: planIdSchema,
    async execute(_toolCallId, params) {
      const result = await getPendingTransactions(getClient(), params.planId);
      return {
        content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
        details: undefined,
      };
    },
  });

  api.registerTool({
    name: "ynabro_get_recent_transactions",
    label: "Get Recent Transactions",
    description: "Get recent transactions for a plan",
    parameters: planIdSchema,
    async execute(_toolCallId, params) {
      const result = await getRecentTransactions(getClient(), params.planId);
      return {
        content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
        details: undefined,
      };
    },
  });

  api.registerTool({
    name: "ynabro_approve_transaction",
    label: "Approve Transaction",
    description: "Approve a specific transaction",
    parameters: approveSchema,
    async execute(_toolCallId, params) {
      await approveTransaction(
        getClient(),
        params.planId,
        params.transactionId,
      );
      return {
        content: [{ type: "text", text: JSON.stringify({ success: true }) }],
        details: undefined,
      };
    },
  });

  api.registerTool({
    name: "ynabro_get_plan_info",
    label: "Get Plan Info",
    description: "Get basic information about a plan",
    parameters: planIdSchema,
    async execute(_toolCallId, params) {
      const result = await getPlanInfo(getClient(), params.planId);
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
      "Set up YNAB integration — checks for token and selects a default plan",
    parameters: Type.Object({}),
    async execute() {
      const result = await setupYnab();
      return {
        content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
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
