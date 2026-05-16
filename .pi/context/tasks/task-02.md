## Task 2: Rewrite `packages/openclaw-ynabro/src/index.ts` — implement adapter, two-step setup, remove env var fallback

**Prerequisite:** Task 1 must be complete and `packages/ynabro` must be built before typechecking this task.

## Scope

**In scope:**
- `packages/openclaw-ynabro/src/index.ts` — full rewrite
- `packages/openclaw-ynabro/openclaw.plugin.json` — add `ynabro_save_default_plan` to `contracts.tools`

**Not in scope:**
- `packages/ynabro/` — no changes
- `packages/pi-ynabro/` — handled in Task 3
- Skill files under `skills/`

## What to implement

### Imports

```ts
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
```

Note: `setupYnab` is now imported and used. The old local `setupYnab` call (which wrote to `.ynabro/config.json`) is replaced entirely.

### Inside `register(api)` — set up adapter and helpers

**In-session cache + adapter:**

```ts
let cachedPlanId: string | undefined;

const openClawAdapter: YnabroConfigAdapter = {
  async getDefaultPlanId(): Promise<string | undefined> {
    if (cachedPlanId !== undefined) return cachedPlanId;
    return (api.pluginConfig as { defaultPlanId?: string } | undefined)?.defaultPlanId;
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
        const existingConfig = (existing.config as Record<string, unknown> | undefined) ?? {};
        existingConfig.defaultPlanId = planId;
        draft.plugins.entries["openclaw-ynabro"] = {
          ...existing,
          config: existingConfig,
        };
      },
    });
  },
};
```

**`getClient()` — token from plugin config only:**

```ts
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
```

No `process.env.YNAB_TOKEN` fallback.

**`getDefaultPlanId()` wrapper:**

```ts
async function getDefaultPlanId(): Promise<string> {
  const planId = await openClawAdapter.getDefaultPlanId();
  if (!planId) {
    throw new Error(
      "No default plan configured. Run ynabro_setup then ynabro_save_default_plan to complete onboarding.",
    );
  }
  return planId;
}
```

### Schemas

Remove `planIdSchema` entirely. Keep `approveSchema` without `planId`:

```ts
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
  skillSlug: Type.String({ description: "The slug identifier for the skill" }),
});

const updateSkillStateSchema = Type.Object({
  skillSlug: Type.String({ description: "The slug identifier for the skill" }),
  updates: Type.Object({}, {
    additionalProperties: true,
    description: "Partial state updates to merge",
  }),
});
```

### Tool registrations

**`ynabro_setup`** (step 1 — returns plan list):
```ts
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
      return ok(JSON.stringify({ error: "No plans found in your YNAB account." }));
    }
    return ok(JSON.stringify({ plans: plans.map((p) => ({ id: p.id, name: p.name })) }));
  },
});
```

**`ynabro_save_default_plan`** (step 2 — stores selection):
```ts
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
    await setupYnab(client, plans, p.planId as string, openClawAdapter);
    const saved = plans.find((plan) => plan.id === p.planId);
    return ok(JSON.stringify({
      message: `Default plan set to: ${saved?.name ?? p.planId}`,
      defaultPlanId: p.planId,
    }));
  },
});
```

**Plan-dependent tools** — all four remove `planId` from parameters and call `getDefaultPlanId()` internally:

```ts
// ynabro_get_pending_transactions
parameters: Type.Object({}),
async execute() {
  const [client, planId] = await Promise.all([
    Promise.resolve(getClient()),
    getDefaultPlanId(),
  ]);
  const result = await getPendingTransactions(client, planId);
  return ok(JSON.stringify(result, null, 2));
},

// ynabro_get_recent_transactions
parameters: Type.Object({}),
async execute() {
  const [client, planId] = await Promise.all([
    Promise.resolve(getClient()),
    getDefaultPlanId(),
  ]);
  const result = await getRecentTransactions(client, planId);
  return ok(JSON.stringify(result, null, 2));
},

// ynabro_approve_transaction
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

// ynabro_get_plan_info
parameters: Type.Object({}),
async execute() {
  const [client, planId] = await Promise.all([
    Promise.resolve(getClient()),
    getDefaultPlanId(),
  ]);
  const result = await getPlanInfo(client, planId);
  return ok(JSON.stringify(result, null, 2));
},
```

Skill state tools (`ynabro_get_skill_state`, `ynabro_update_skill_state`) are unchanged.

### Keep the `ok()` and `params()` helpers exactly as they are in the current file.

### `openclaw.plugin.json` — add `ynabro_save_default_plan`

In the `contracts.tools` array, add `"ynabro_save_default_plan"` after `"ynabro_setup"`:

```json
"contracts": {
  "tools": [
    "ynabro_setup",
    "ynabro_save_default_plan",
    "ynabro_get_pending_transactions",
    ...
  ]
}
```

## Definition of Done

- `YnabroConfigAdapter` and `setupYnab` imported from `"ynabro"`; old local `setupYnab()` call removed
- `openClawAdapter` implemented with closure cache + `mutateConfigFile`
- `getClient()` uses `api.pluginConfig.token` only — no env var fallback
- `getDefaultPlanId()` wrapper throws correct error message
- All four plan-dependent tools have `Type.Object({})` parameters (no `planId`)
- `ynabro_setup` returns plan list JSON
- `ynabro_save_default_plan` registered with `planId` param
- `contracts.tools` in `openclaw.plugin.json` includes `ynabro_save_default_plan`
- `npm run typecheck -w packages/openclaw-ynabro` passes

## Verification

```bash
cd /Users/jmcombs/Projects/ynabro
npm run typecheck -w packages/openclaw-ynabro
grep -c "planIdSchema" packages/openclaw-ynabro/src/index.ts  # should be 0
grep "process.env.YNAB_TOKEN" packages/openclaw-ynabro/src/index.ts  # should be empty
grep "ynabro_save_default_plan" packages/openclaw-ynabro/openclaw.plugin.json  # should match
```
