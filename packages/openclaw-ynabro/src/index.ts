import { Type } from "@sinclair/typebox";
import type { OpenClawPluginApi } from "openclaw/plugin-sdk/plugin-entry";
import type { YnabroConfigAdapter } from "ynabro";

// Inlined `definePluginEntry` and `emptyPluginConfigSchema` from openclaw's
// plugin SDK. We avoid the runtime `import { ... } from "openclaw/..."` because
// `openclaw plugins install` has an undocumented post-install "Repaired stale
// openclaw peer dependency" step that deletes `openclaw` from the plugin's
// `node_modules` regardless of whether the plugin declares it as a
// `dependency`. The resulting `Cannot find package 'openclaw'` ESM error
// surfaces only as silent `toolNames: []` in `openclaw plugins inspect`.
//
// Type-only imports (`import type ...`) are erased at compile time and leave
// no runtime trace, so they remain safe.
//
// Source: openclaw 2026.4.x `plugin-sdk/plugin-entry.js` and
// `config-schema.js`. Behaviour mirrors the upstream helpers exactly.
function emptyPluginConfigSchema() {
  return {
    safeParse(value: unknown) {
      if (value === undefined) return { success: true, data: undefined };
      if (!value || typeof value !== "object" || Array.isArray(value)) {
        return { success: false, error: "expected config object" };
      }
      if (Object.keys(value as object).length > 0) {
        return { success: false, error: "config must be empty" };
      }
      return { success: true, data: value };
    },
    jsonSchema: {
      type: "object" as const,
      additionalProperties: false,
      properties: {},
    },
  };
}

function pluginConfigSchema() {
  const ALLOWED_KEYS = new Set(["token", "defaultPlanId"]);
  return {
    safeParse(value: unknown) {
      if (value === undefined)
        return { success: true as const, data: undefined };
      if (!value || typeof value !== "object" || Array.isArray(value)) {
        return { success: false as const, error: "expected config object" };
      }
      const obj = value as Record<string, unknown>;
      for (const key of Object.keys(obj)) {
        if (!ALLOWED_KEYS.has(key)) {
          return {
            success: false as const,
            error: `unknown config key: ${key}`,
          };
        }
      }
      const { token, defaultPlanId } = obj;
      if (
        token !== undefined &&
        typeof token !== "string" &&
        (typeof token !== "object" || Array.isArray(token) || token === null)
      ) {
        return {
          success: false as const,
          error: "token must be a string or SecretRef object",
        };
      }
      if (defaultPlanId !== undefined && typeof defaultPlanId !== "string") {
        return {
          success: false as const,
          error: "defaultPlanId must be a string",
        };
      }
      return { success: true as const, data: obj };
    },
    jsonSchema: {
      type: "object" as const,
      additionalProperties: false,
      properties: {
        token: {
          type: ["string", "object"] as ["string", "object"],
          description:
            "YNAB Personal Access Token. May be a plaintext string or a SecretRef object { source, provider, id } configured via `openclaw secrets configure` or `openclaw config set ... --ref-source ...`.",
        },
        defaultPlanId: {
          type: "string" as const,
          description: "Default YNAB plan ID selected during onboarding",
        },
      },
    },
  };
}

type InlineDefinePluginEntryOptions = {
  id: string;
  name: string;
  description: string;
  kind?: unknown;
  configSchema?: unknown;
  reload?: unknown;
  nodeHostCommands?: unknown;
  securityAuditCollectors?: unknown;
  register: (api: OpenClawPluginApi) => void;
};

function definePluginEntry({
  id,
  name,
  description,
  kind,
  configSchema,
  reload,
  nodeHostCommands,
  securityAuditCollectors,
  register,
}: InlineDefinePluginEntryOptions) {
  const resolvedSchemaSource = configSchema ?? emptyPluginConfigSchema;
  let resolved: unknown;
  let resolvedOnce = false;
  const getConfigSchema = () => {
    if (!resolvedOnce) {
      resolved =
        typeof resolvedSchemaSource === "function"
          ? (resolvedSchemaSource as () => unknown)()
          : resolvedSchemaSource;
      resolvedOnce = true;
    }
    return resolved;
  };
  return {
    id,
    name,
    description,
    ...(kind ? { kind } : {}),
    ...(reload ? { reload } : {}),
    ...(nodeHostCommands ? { nodeHostCommands } : {}),
    ...(securityAuditCollectors ? { securityAuditCollectors } : {}),
    get configSchema() {
      return getConfigSchema();
    },
    register,
  };
}

import {
  approveTransaction,
  checkOnboardingStatus,
  getPendingTransactions,
  getPlanInfo,
  getRecentTransactions,
  getSkillState,
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
  configSchema: pluginConfigSchema(),
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
            if (!draft.plugins) {
              (draft as { plugins?: unknown }).plugins = {
                entries: {},
              } as unknown;
            }
            // TypeScript flow analysis requires explicit check after conditional assignment
            if (draft.plugins) {
              if (!draft.plugins.entries) {
                draft.plugins.entries = {};
              }
              const existing = draft.plugins.entries["openclaw-ynabro"] ?? {};
              const existingConfig =
                (existing.config as Record<string, unknown> | undefined) ?? {};
              existingConfig.defaultPlanId = planId;
              draft.plugins.entries["openclaw-ynabro"] = {
                ...existing,
                config: existingConfig,
              };
            }
          },
        });
      },
      async hasToken(): Promise<boolean> {
        return !!(api.pluginConfig as { token?: string } | undefined)?.token;
      },
    };

    function getClient(): YnabroClient {
      const token = (api.pluginConfig as { token?: string } | undefined)?.token;
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

    api.registerTool(
      (_ctx) => ({
        name: "ynabro_onboarding_status",
        label: "Onboarding Status",
        description:
          "Check whether YNABro is fully configured. Returns ready status, any missing configuration, and token generation instructions.",
        parameters: Type.Object({}),
        async execute() {
          const status = await checkOnboardingStatus(openClawAdapter);
          return ok(JSON.stringify(status));
        },
      }),
      { names: ["ynabro_onboarding_status"] },
    );

    api.registerTool(
      (_ctx) => ({
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
      }),
      { names: ["ynabro_setup"] },
    );

    api.registerTool(
      (_ctx) => ({
        name: "ynabro_save_default_plan",
        label: "Save Default Plan",
        description:
          "Save a YNAB plan as the default for all subsequent tool calls. " +
          "Call ynabro_setup first to get the list of available plan IDs.",
        parameters: saveDefaultPlanSchema,
        async execute(_id, raw) {
          try {
            const p = params(raw);
            const planId = p.planId as string;
            if (!planId) {
              throw new Error("planId is required");
            }
            await openClawAdapter.setDefaultPlanId(planId);
            return ok(
              JSON.stringify({
                message: `Default plan set to: ${planId}`,
                defaultPlanId: planId,
              }),
            );
          } catch (_error) {
            const status = await checkOnboardingStatus(openClawAdapter);
            return ok(
              JSON.stringify({
                error: "onboarding_required",
                ...status,
              }),
            );
          }
        },
      }),
      { names: ["ynabro_save_default_plan"] },
    );

    api.registerTool(
      (_ctx) => ({
        name: "ynabro_get_pending_transactions",
        label: "Get Pending Transactions",
        description: "Get all pending (uncategorized) transactions for a plan",
        parameters: Type.Object({}),
        async execute() {
          try {
            const [client, planId] = await Promise.all([
              Promise.resolve(getClient()),
              getDefaultPlanId(),
            ]);
            const result = await getPendingTransactions(client, planId);
            return ok(JSON.stringify(result, null, 2));
          } catch (_error) {
            const status = await checkOnboardingStatus(openClawAdapter);
            return ok(
              JSON.stringify({
                error: "onboarding_required",
                ...status,
              }),
            );
          }
        },
      }),
      { names: ["ynabro_get_pending_transactions"] },
    );

    api.registerTool(
      (_ctx) => ({
        name: "ynabro_get_recent_transactions",
        label: "Get Recent Transactions",
        description: "Get recent transactions for a plan",
        parameters: Type.Object({}),
        async execute() {
          try {
            const [client, planId] = await Promise.all([
              Promise.resolve(getClient()),
              getDefaultPlanId(),
            ]);
            const result = await getRecentTransactions(client, planId);
            return ok(JSON.stringify(result, null, 2));
          } catch (_error) {
            const status = await checkOnboardingStatus(openClawAdapter);
            return ok(
              JSON.stringify({
                error: "onboarding_required",
                ...status,
              }),
            );
          }
        },
      }),
      { names: ["ynabro_get_recent_transactions"] },
    );

    api.registerTool(
      (_ctx) => ({
        name: "ynabro_approve_transaction",
        label: "Approve Transaction",
        description: "Approve a specific transaction",
        parameters: approveSchema,
        async execute(_id, raw) {
          try {
            const p = params(raw);
            const [client, planId] = await Promise.all([
              Promise.resolve(getClient()),
              getDefaultPlanId(),
            ]);
            await approveTransaction(client, planId, p.transactionId as string);
            return ok(JSON.stringify({ success: true }));
          } catch (_error) {
            const status = await checkOnboardingStatus(openClawAdapter);
            return ok(
              JSON.stringify({
                error: "onboarding_required",
                ...status,
              }),
            );
          }
        },
      }),
      { names: ["ynabro_approve_transaction"] },
    );

    api.registerTool(
      (_ctx) => ({
        name: "ynabro_get_plan_info",
        label: "Get Plan Info",
        description: "Get basic information about a plan",
        parameters: Type.Object({}),
        async execute() {
          try {
            const [client, planId] = await Promise.all([
              Promise.resolve(getClient()),
              getDefaultPlanId(),
            ]);
            const result = await getPlanInfo(client, planId);
            return ok(JSON.stringify(result, null, 2));
          } catch (_error) {
            const status = await checkOnboardingStatus(openClawAdapter);
            return ok(
              JSON.stringify({
                error: "onboarding_required",
                ...status,
              }),
            );
          }
        },
      }),
      { names: ["ynabro_get_plan_info"] },
    );

    api.registerTool(
      (_ctx) => ({
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
      }),
      { names: ["ynabro_get_skill_state"] },
    );

    api.registerTool(
      (_ctx) => ({
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
      }),
      { names: ["ynabro_update_skill_state"] },
    );
  },
});
