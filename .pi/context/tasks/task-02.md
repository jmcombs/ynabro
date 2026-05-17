## Task 2: `openclaw-ynabro` adapter — `hasToken`, `ynabro_onboarding_status`, structured errors

Three targeted changes to `packages/openclaw-ynabro/src/index.ts` plus a one-line update to `openclaw.plugin.json`.

## Scope

- `packages/openclaw-ynabro/src/index.ts`
- `packages/openclaw-ynabro/openclaw.plugin.json`

Not in scope: `packages/ynabro/`, `packages/pi-ynabro/`.

Prerequisite: Task 1 must be built (`npm run build -w packages/ynabro`) before typechecking this package.

## Definition of Done

**Imports:**
- `checkOnboardingStatus` and `type OnboardingStatus` added to the named imports from `"ynabro"`

**`openClawAdapter` object:**
- Gains `async hasToken(): Promise<boolean>` returning `!!(api.pluginConfig as { token?: string } | undefined)?.token`

**`ynabro_onboarding_status` tool (new, registered inside `register(api)`):**
- Name: `"ynabro_onboarding_status"`
- Label: `"Onboarding Status"`
- Description: `"Check whether YNABro is fully configured. Returns ready status, any missing configuration, and token generation instructions."`
- Parameters: `Type.Object({})`
- `execute()`: calls `checkOnboardingStatus(openClawAdapter)`, returns `ok(JSON.stringify(status))`

**Structured error on missing config:**
- When the token is not configured OR when the default plan is not configured, plan-dependent tool `execute()` handlers must return `ok(JSON.stringify({ error: "onboarding_required", ...status }))` — they must NOT allow raw `Error` throws to propagate to the LLM as unhandled tool errors
- Implementor may choose any internal pattern (union return, custom error class with try/catch, or equivalent) as long as the external contract is a structured JSON tool result
- All five plan-dependent tools must exhibit this behavior: `ynabro_get_pending_transactions`, `ynabro_get_recent_transactions`, `ynabro_approve_transaction`, `ynabro_get_plan_info`, `ynabro_save_default_plan`

**`openclaw.plugin.json`:**
- `"ynabro_onboarding_status"` added to the `contracts.tools` array (position does not matter)

## Verification

```bash
npm run typecheck -w packages/openclaw-ynabro
grep "ynabro_onboarding_status" packages/openclaw-ynabro/openclaw.plugin.json
grep "hasToken" packages/openclaw-ynabro/src/index.ts
```

All must succeed.
