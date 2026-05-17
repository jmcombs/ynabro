## Goal

Implement the unified onboarding flow designed in `docs/ONBOARDING_DESIGN.md`: add `hasToken()` to `YnabroConfigAdapter`, add the core `checkOnboardingStatus()` helper, register `ynabro_onboarding_status` on both platforms, convert configuration-missing errors to structured JSON responses, update tests, the skill prompt, and documentation.

---

## Tasks

### Task 1: Core library — `onboardingStatus.ts` + extend `YnabroConfigAdapter`

Add `hasToken()` to the `YnabroConfigAdapter` interface. Create `packages/ynabro/src/tools/onboardingStatus.ts` with the `OnboardingStatus` type, static `TOKEN_INSTRUCTIONS` constant, and `checkOnboardingStatus()` function. Export everything and rebuild.

**Scope:** `packages/ynabro/src/tools/setupYnab.ts`, `packages/ynabro/src/tools/onboardingStatus.ts` (new), `packages/ynabro/src/tools/index.ts`
**Not in scope:** Adapters, tests, docs, skill prompt

**Definition of Done:**
- `YnabroConfigAdapter` in `setupYnab.ts` has `hasToken(): Promise<boolean>` as a third method
- `onboardingStatus.ts` exports:
  - `OnboardingStatus` interface: `{ ready: boolean; missing: ('token' | 'plan')[]; tokenInstructions: string; nextStep?: string }`
  - `TOKEN_INSTRUCTIONS` constant: static multi-line string with the four-step YNAB PAT generation instructions (URL: `https://app.ynab.com/settings/developer`)
  - `checkOnboardingStatus(adapter: YnabroConfigAdapter): Promise<OnboardingStatus>` — calls `adapter.hasToken()` and `adapter.getDefaultPlanId()`, builds and returns the status object; includes `nextStep` only when `ready` is `false`
- `tools/index.ts` exports `checkOnboardingStatus` and `type OnboardingStatus` from `./onboardingStatus.js`
- `npm run typecheck -w packages/ynabro` passes
- `npm run build -w packages/ynabro` succeeds; `dist/index.d.ts` exports `checkOnboardingStatus` and `OnboardingStatus`

**Verification:** `npm run typecheck -w packages/ynabro && npm run build -w packages/ynabro && grep "checkOnboardingStatus" packages/ynabro/dist/index.d.ts`

---

### Task 2: `openclaw-ynabro` adapter — `hasToken`, `ynabro_onboarding_status`, structured errors

Three targeted changes to `packages/openclaw-ynabro/src/index.ts` plus a one-line addition to `openclaw.plugin.json`.

**Scope:** `packages/openclaw-ynabro/src/index.ts`, `packages/openclaw-ynabro/openclaw.plugin.json`
**Not in scope:** `packages/ynabro/`, `packages/pi-ynabro/`
**Prerequisite:** Task 1 build complete

**Definition of Done:**
- `checkOnboardingStatus` and `type OnboardingStatus` imported from `"ynabro"`
- `openClawAdapter` has `hasToken(): Promise<boolean>` that returns `!!(api.pluginConfig as { token?: string } | undefined)?.token`
- `ynabro_onboarding_status` tool registered with `Type.Object({})` parameters; its `execute()` calls `checkOnboardingStatus(openClawAdapter)` and returns the result as JSON via `ok(...)`
- `getClient()` and `getDefaultPlanId()` changed so that, on missing config, they do NOT throw — instead, plan-dependent tool `execute()` handlers detect unconfigured state (via any pattern the implementor chooses: union return type, custom error class + catch, or equivalent) and return `ok(JSON.stringify({ error: "onboarding_required", ...status }))` to the caller
- All five plan-dependent tools (`ynabro_get_pending_transactions`, `ynabro_get_recent_transactions`, `ynabro_approve_transaction`, `ynabro_get_plan_info`, `ynabro_save_default_plan`) return structured JSON on missing config — no unhandled throws reach the LLM as raw error strings
- `ynabro_onboarding_status` added to `contracts.tools` in `openclaw.plugin.json`
- `npm run typecheck -w packages/openclaw-ynabro` passes

**Verification:** `npm run typecheck -w packages/openclaw-ynabro && grep "ynabro_onboarding_status" packages/openclaw-ynabro/openclaw.plugin.json`

---

### Task 3: `pi-ynabro` adapter — `hasToken`, `ynabro_onboarding_status`, structured errors

Three targeted changes to `packages/pi-ynabro/src/index.ts`, mirroring the pattern from Task 2 with pi-specific storage.

**Scope:** `packages/pi-ynabro/src/index.ts` only
**Not in scope:** `packages/ynabro/`, `packages/openclaw-ynabro/`
**Prerequisite:** Task 1 build complete

**Definition of Done:**
- `checkOnboardingStatus` and `type OnboardingStatus` added to the named imports from `"ynabro"`
- `piConfigAdapter` has `hasToken(): Promise<boolean>` that returns `!!(await authStorage.getApiKey("ynab"))`
- `ynabro_onboarding_status` tool registered with `Type.Object({})` parameters; its `execute()` calls `checkOnboardingStatus(piConfigAdapter)` and returns the result as JSON
- `getClient()` and `getDefaultPlanId()` changed so that, on missing config, plan-dependent tool `execute()` handlers return `{ content: [{ type: "text", text: JSON.stringify({ error: "onboarding_required", ...status }) }], details: undefined }` instead of allowing raw throws to surface to the LLM
- All four plan-dependent tools (`ynabro_get_pending_transactions`, `ynabro_get_recent_transactions`, `ynabro_approve_transaction`, `ynabro_get_plan_info`) return structured JSON on missing config
- `npm run typecheck -w packages/pi-ynabro` passes

**Verification:** `npm run typecheck -w packages/pi-ynabro`

---

### Task 4: Unit tests — `onboardingStatus.test.ts` + update `setupYnab.test.ts`

Add a new test file for `checkOnboardingStatus()` and update all mock adapters in `setupYnab.test.ts` to include `hasToken`.

**Scope:** `packages/ynabro/tests/onboardingStatus.test.ts` (new), `packages/ynabro/tests/setupYnab.test.ts` (update mocks)
**Not in scope:** `conformance.test.ts` (Task 5), adapter source files
**Prerequisite:** Task 1 complete

**Definition of Done:**
- Every `YnabroConfigAdapter` mock object in `setupYnab.test.ts` has `hasToken: async () => false` (or `true` where semantically appropriate) — TypeScript must not complain about missing property
- `onboardingStatus.test.ts` covers:
  - `ready: true, missing: []` when `hasToken()` returns `true` and `getDefaultPlanId()` returns a string
  - `ready: false, missing: ["token", "plan"]` when both absent
  - `ready: false, missing: ["token"]` when only token absent
  - `ready: false, missing: ["plan"]` when token present but plan absent
  - `tokenInstructions` is always a non-empty string
  - `tokenInstructions` contains `https://app.ynab.com/settings/developer`
  - `nextStep` is present (non-empty string) when `ready` is `false`
  - `nextStep` is absent (undefined) when `ready` is `true`
- `npm run test -w packages/ynabro` passes (all test files green)

**Verification:** `npm run test -w packages/ynabro`

---

### Task 5: Conformance test updates

Extend `packages/ynabro/tests/conformance.test.ts` with four new assertions covering `hasToken` and `ynabro_onboarding_status` on both adapters.

**Scope:** `packages/ynabro/tests/conformance.test.ts` only
**Not in scope:** Adapter source files, unit tests (Task 4)
**Prerequisite:** Tasks 2 and 3 complete (assertions run against the updated adapter files)

**Definition of Done:**
- `openclaw-ynabro` conformance suite adds:
  - `openClawAdapter` implements `hasToken` (assert `openClawSrc` contains `hasToken`)
  - `ynabro_onboarding_status` tool is registered (assert `openClawSrc` contains `"ynabro_onboarding_status"`)
- `pi-ynabro` conformance suite adds:
  - `piConfigAdapter` implements `hasToken` (assert `piSrc` contains `hasToken`)
  - `ynabro_onboarding_status` tool is registered (assert `piSrc` contains `"ynabro_onboarding_status"`)
- Each new assertion includes a descriptive failure message
- `npm run test -w packages/ynabro` passes (all 4 new conformance assertions green, existing 13 still pass)

**Verification:** `npm run test -w packages/ynabro -- --reporter=verbose`

---

### Task 6: Skill prompt + documentation

Rewrite the `Onboarding & Access` section of the skill prompt and update `docs/TOOLS.md` and `docs/ARCHITECTURE.md`.

**Scope:** `skills/ynabro/prompts/ynabro.md`, `docs/TOOLS.md`, `docs/ARCHITECTURE.md`
**Not in scope:** Package READMEs, source code, tests

**Definition of Done:**

`skills/ynabro/prompts/ynabro.md` — replace the `## Onboarding & Access` section with:
- Instruction to call `ynabro_onboarding_status` before any YNAB operation
- If `ready: false`: share `tokenInstructions`; platform-specific token storage (pi: `ynabro_setup` TUI popup — never the chat; OpenClaw: `openclaw.json` or settings UI); then call `ynabro_setup` for plans and `ynabro_save_default_plan` (OpenClaw) to store selection
- After onboarding: fulfill the original request immediately
- If a tool returns `{ "error": "onboarding_required" }`: treat same as a failed status check, initiate onboarding, then retry
- Remove all references to `YNAB_TOKEN` env var

`docs/TOOLS.md`:
- Add `ynabro_onboarding_status` entry (both platforms): no parameters; returns `OnboardingStatus` JSON; describes `ready`, `missing`, `tokenInstructions`, `nextStep` fields
- Update plan-dependent tool entries to note they return `{ error: "onboarding_required" }` instead of throwing when unconfigured

`docs/ARCHITECTURE.md`:
- Add `hasToken()` to the `YnabroConfigAdapter` interface block
- Add `checkOnboardingStatus()` to the adapter description table
- Add a new **Onboarding Detection** section describing the two-layer strategy (prompt-driven + structured error)

**Verification:** Manual review — `npm run check` not required for docs/prompt changes, but `npm run check` must still pass overall.

---

## Acceptance Criteria

- `YnabroConfigAdapter` has `hasToken(): Promise<boolean>` in its definition in `setupYnab.ts`
- `packages/ynabro/src/tools/onboardingStatus.ts` exists and exports `checkOnboardingStatus`, `OnboardingStatus`, `TOKEN_INSTRUCTIONS`
- `checkOnboardingStatus` is re-exported from `packages/ynabro/src/index.ts` (via `tools/index.ts`)
- Both adapters implement `hasToken()` using their platform's token storage
- Both adapters register `ynabro_onboarding_status` as a tool
- `openclaw.plugin.json` lists `ynabro_onboarding_status` in `contracts.tools`
- All plan-dependent tools on both platforms return `{ error: "onboarding_required", ... }` JSON — no raw throws reaching the LLM — when token or plan is missing
- `packages/ynabro/tests/onboardingStatus.test.ts` exists with ≥ 8 test cases
- All `YnabroConfigAdapter` mocks in `setupYnab.test.ts` include `hasToken`
- `conformance.test.ts` has 4 new assertions (hasToken + ynabro_onboarding_status for each adapter)
- `skills/ynabro/prompts/ynabro.md` has no `YNAB_TOKEN` references; contains `ynabro_onboarding_status` instruction
- `npm run check` exits 0 (all workspaces typecheck + all tests pass)

## Non-goals

- No changes to `ynabro_setup` tool on pi (interactive flow is already correct)
- No changes to `ynabro_setup` or `ynabro_save_default_plan` on OpenClaw
- No token validation (API call) — `hasToken()` is presence-check only (Phase 1 scope)
- No changes to `YnabroClient` or any core tool function (`getPendingTransactions`, etc.)
- No package README changes in this spec (docs/TOOLS.md and docs/ARCHITECTURE.md only)
- No semver decisions

## Assumptions

- `packages/ynabro/dist/` must be rebuilt after Task 1 before Tasks 2–4 can typecheck
- `vitest.config.ts` in `packages/ynabro` already picks up `tests/*.test.ts` — `onboardingStatus.test.ts` requires no config change
- `src/index.ts` in `packages/ynabro` uses explicit named exports (not `export *`); new symbols added to `tools/index.ts` must also be explicitly added to `src/index.ts`
- Implementors may choose any internal pattern (union return type, custom error class + catch, or equivalent) for the structured-error refactor as long as the external tool contract returns JSON

## Verification Plan

- `npm run typecheck -w packages/ynabro` — core typecheck
- `npm run typecheck -w packages/openclaw-ynabro` — openclaw typecheck
- `npm run typecheck -w packages/pi-ynabro` — pi typecheck
- `npm run build -w packages/ynabro` — core build; confirms exports appear in dist
- `npm run test -w packages/ynabro` — all test files (smoke, setupYnab, onboardingStatus, conformance)
- `npm run check` — full suite: Biome lint, all typechecks, all tests

## Wave Plan

| Wave | Tasks | Parallelism |
|---|---|---|
| 1 | Task 1 (core + build) | Sequential — must come first |
| 2 | Tasks 2, 3, 4 | Parallel — all depend only on Task 1 output |
| Verify 2 | Verifier | — |
| 3 | Tasks 5, 6 | Parallel — Task 5 needs Wave 2 adapters; Task 6 is independent |
| Final verify | Verifier | — |

## Rollback Plan

`git checkout packages/ynabro/src packages/ynabro/tests packages/openclaw-ynabro/src packages/openclaw-ynabro/openclaw.plugin.json packages/pi-ynabro/src skills/ynabro/prompts docs` plus `npm run build -w packages/ynabro` to restore dist.
