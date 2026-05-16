import type {
  ExtensionAPI,
  ToolDefinition,
} from "@earendil-works/pi-coding-agent";
import {
  approveTransaction,
  getPendingTransactions,
  getPlanInfo,
  getRecentTransactions,
  YnabroClient,
} from "ynabro";

export default function ynabroExtension(api: ExtensionAPI) {
  // Register YNABro tools
  const tools: ToolDefinition[] = [
    {
      name: "ynabro_get_pending_transactions",
      description: "Get all pending (uncategorized) transactions for a plan",
      parameters: {
        type: "object",
        properties: {
          planId: {
            type: "string",
            description: "The ID of the YNAB plan",
          },
        },
        required: ["planId"],
      },
      handler: async ({ planId }) => {
        const token = process.env.YNAB_TOKEN;
        if (!token)
          throw new Error("YNAB_TOKEN environment variable is not set");
        const client = new YnabroClient(token);
        return getPendingTransactions(client, planId);
      },
    },
    {
      name: "ynabro_get_recent_transactions",
      description: "Get recent transactions for a plan",
      parameters: {
        type: "object",
        properties: {
          planId: {
            type: "string",
            description: "The ID of the YNAB plan",
          },
        },
        required: ["planId"],
      },
      handler: async ({ planId }) => {
        const token = process.env.YNAB_TOKEN;
        if (!token)
          throw new Error("YNAB_TOKEN environment variable is not set");
        const client = new YnabroClient(token);
        return getRecentTransactions(client, planId);
      },
    },
    {
      name: "ynabro_approve_transaction",
      description: "Approve a specific transaction",
      parameters: {
        type: "object",
        properties: {
          planId: {
            type: "string",
            description: "The ID of the YNAB plan",
          },
          transactionId: {
            type: "string",
            description: "The ID of the transaction to approve",
          },
        },
        required: ["planId", "transactionId"],
      },
      handler: async ({ planId, transactionId }) => {
        const token = process.env.YNAB_TOKEN;
        if (!token)
          throw new Error("YNAB_TOKEN environment variable is not set");
        const client = new YnabroClient(token);
        await approveTransaction(client, planId, transactionId);
        return { success: true };
      },
    },
    {
      name: "ynabro_get_plan_info",
      description: "Get basic information about a plan",
      parameters: {
        type: "object",
        properties: {
          planId: {
            type: "string",
            description: "The ID of the YNAB plan",
          },
        },
        required: ["planId"],
      },
      handler: async ({ planId }) => {
        const token = process.env.YNAB_TOKEN;
        if (!token)
          throw new Error("YNAB_TOKEN environment variable is not set");
        const client = new YnabroClient(token);
        return getPlanInfo(client, planId);
      },
    },
  ];

  for (const tool of tools) {
    api.registerTool(tool);
  }
}
