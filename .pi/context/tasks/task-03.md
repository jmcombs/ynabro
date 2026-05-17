## Task 3: `pi-ynabro` adapter — `hasToken`, `ynabro_onboarding_status`, structured errors

Three targeted changes to `packages/pi-ynabro/src/index.ts`, mirroring the pattern from Task 2 with pi-specific storage.

## Scope

- `packages/pi-ynabro/src/index.ts` only

Not in scope: `packages/ynabro/`, `packages/openclaw-ynabro/`.

Prerequisite: Task 1 must be built (`npm run build -w packages/ynabro`) before typechecking this package.

## Definition of Done

**Imports:**
- `checkOnboardingStatus` and `type OnboardingStatus` added to the named imports from `"ynabro"`

**`piConfigAdapter` object:**
- Gains `async hasToken(): Promise<boolean>` returning `!!(await authStorage.getApiKey("ynab"))`

**`ynabro_onboarding_status` tool (new, registered inside the extension function):**
- Name: `"ynabro_onboarding_status"`
- Label: `"Onboarding Status"`
- Description: `"Check whether YNABro is fully configured. Returns ready status, any missing configuration, and token generation instructions."`
- Parameters: `Type.Object({})`
- `execute()`: calls `checkOnboardingStatus(piConfigAdapter)`, returns `{ content: [{ type: "text", text: JSON.stringify(status) }], details: undefined }`

**Structured error on missing config:**
- When the token is not configured OR when the default plan is not configured, plan-dependent tool `execute()` handlers must return `{ content: [{ type: "text", text: JSON.stringify({ error: "onboarding_required", ...status }) }], details: undefined }` — they must NOT allow raw `Error` throws to propagate to the LLM
- Implementor may choose any internal pattern as long as the external contract is a structured JSON tool result
- All four plan-dependent tools must exhibit this behavior: `ynabro_get_pending_transactions`, `ynabro_get_recent_transactions`, `ynabro_approve_transaction`, `ynabro_get_plan_info`

## Verification

```bash
npm run typecheck -w packages/pi-ynabro
grep "ynabro_onboarding_status" packages/pi-ynabro/src/index.ts
grep "hasToken" packages/pi-ynabro/src/index.ts
```

All must succeed.
