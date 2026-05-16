## Goal

Export `YnabroConfigAdapter` from the core `ynabro` library, refactor `setupYnab` to use it, wire both adapters to shared core code with only platform-specific glue living locally, cover the new contract with unit and conformance tests, wire those tests into CI, and update all documentation to reflect the current state of the project.

---

## Tasks

### Task 1: Refactor core `packages/ynabro` — export `YnabroConfigAdapter` and rewrite `setupYnab`

Remove all `.ynabro/config.json` file I/O from the core library. Export `YnabroConfigAdapter`. Rewrite `setupYnab` to accept the adapter. Build core so downstream adapters pick up new types.

**Scope:** `packages/ynabro/src/tools/setupYnab.ts`, `packages/ynabro/src/index.ts`, `npm run build -w packages/ynabro`
**Not in scope:** `packages/openclaw-ynabro/`, `packages/pi-ynabro/`, tests

**Definition of Done:**
- `YnabroConfigAdapter` interface (`getDefaultPlanId(): Promise<string | undefined>`, `setDefaultPlanId(planId: string): Promise<void>`) exported from `packages/ynabro/src/index.ts`
- `setupYnab(client: YnabroClient, plans: YnabPlan[], selectedPlanId: string, adapter: YnabroConfigAdapter): Promise<void>` — validates `selectedPlanId` is in `plans`, throws if not, calls `adapter.setDefaultPlanId(selectedPlanId)`, returns void
- All `fs`, `path`, `.ynabro/config.json`, `process.env.YNAB_TOKEN` references removed from `setupYnab.ts`
- `packages/ynabro/dist/` rebuilt; `dist/index.d.ts` exports `YnabroConfigAdapter`
- `npm run typecheck -w packages/ynabro` passes

**Verification:** `npm run typecheck -w packages/ynabro && npm run build -w packages/ynabro && grep "YnabroConfigAdapter" packages/ynabro/dist/index.d.ts`

---

### Task 2: Rewrite `packages/openclaw-ynabro/src/index.ts` — implement adapter, two-step setup, remove env var fallback

**Scope:** `packages/openclaw-ynabro/src/index.ts`, `packages/openclaw-ynabro/openclaw.plugin.json`
**Not in scope:** `packages/ynabro/`, `packages/pi-ynabro/`
**Prerequisite:** Task 1 build complete

**Definition of Done:**
- `YnabroConfigAdapter` + `setupYnab` imported from `"ynabro"`; old local `setupYnab()` call removed
- `openClawAdapter: YnabroConfigAdapter` defined inside `register(api)` with: closure-scoped `cachedPlanId` for in-session reads; `getDefaultPlanId()` checks cache then `api.pluginConfig.defaultPlanId`; `setDefaultPlanId()` updates cache and calls `api.runtime.config.mutateConfigFile({ afterWrite: { mode: "auto" }, mutate: ... })` writing to `draft.plugins.entries["openclaw-ynabro"].config.defaultPlanId`
- `getClient()` reads `api.pluginConfig.token` only — throws `"YNAB token not configured. Set it via plugins.entries.openclaw-ynabro.config.token in openclaw.json."` if absent — **no `process.env.YNAB_TOKEN`**
- `getDefaultPlanId()` wrapper throws `"No default plan configured. Run ynabro_setup then ynabro_save_default_plan to complete onboarding."` if absent
- `planIdSchema` fully removed; all four plan-dependent tools (`ynabro_get_pending_transactions`, `ynabro_get_recent_transactions`, `ynabro_approve_transaction`, `ynabro_get_plan_info`) have `Type.Object({})` parameters and call `getDefaultPlanId()` internally
- `ynabro_setup` (no params): fetches plans, returns `{ plans: [{id, name}] }` JSON
- `ynabro_save_default_plan` (`planId: string` param): fetches plans for validation, calls `setupYnab(client, plans, planId, openClawAdapter)`, returns success message
- `ynabro_save_default_plan` added to `contracts.tools` in `openclaw.plugin.json`
- `npm run typecheck -w packages/openclaw-ynabro` passes

**Verification:** `npm run typecheck -w packages/openclaw-ynabro && grep -c "planIdSchema" packages/openclaw-ynabro/src/index.ts && grep "process.env" packages/openclaw-ynabro/src/index.ts`

---

### Task 3: Update `packages/pi-ynabro/src/index.ts` — import adapter and `setupYnab` from core

Three targeted edits only. All interactive UI logic unchanged.

**Scope:** `packages/pi-ynabro/src/index.ts` only
**Not in scope:** Everything else
**Prerequisite:** Task 1 build complete

**Definition of Done:**
- `import type { YnabroConfigAdapter } from "ynabro"` present; `setupYnab` added to named imports from `"ynabro"`
- Local `interface YnabroConfigAdapter { ... }` block removed
- `ynabro_setup` calls `await setupYnab(client, plans, selectedPlan.id, piConfigAdapter)` instead of `await piConfigAdapter.setDefaultPlanId(selectedPlan.id)`
- No other changes to the file
- `npm run typecheck -w packages/pi-ynabro` passes

**Verification:** `npm run typecheck -w packages/pi-ynabro && grep "interface YnabroConfigAdapter" packages/pi-ynabro/src/index.ts`

---

### Task 4: Unit tests for `setupYnab` and `YnabroConfigAdapter` in `packages/ynabro/tests/`

Add `packages/ynabro/tests/setupYnab.test.ts` covering the new four-parameter `setupYnab` API. Update `smoke.test.ts` to add export checks for the new exports. All existing smoke tests must continue to pass.

**Scope:** `packages/ynabro/tests/setupYnab.test.ts` (new), `packages/ynabro/tests/smoke.test.ts` (add export checks)
**Not in scope:** Adapter source files; conformance tests (Task 5)
**Prerequisite:** Task 1 complete

**Definition of Done:**
- `setupYnab.test.ts` contains tests for: stores correct planId via adapter; calls `setDefaultPlanId` exactly once with the correct value; throws when `selectedPlanId` not in `plans`; error message includes both the invalid ID and the valid IDs; does not throw for valid selection from a multi-plan list; works with a single-plan list
- `smoke.test.ts` adds: `setupYnab` is exported and is a function; the existing three tests still pass
- `npm run test -w packages/ynabro` passes (all tests green)

**Verification:** `npm run test -w packages/ynabro`

---

### Task 5: Cross-plugin conformance tests + CI update

Add `packages/ynabro/tests/conformance.test.ts` with static-analysis tests that read adapter source files and assert structural constraints. Update `.github/workflows/ci.yml` to add an explicit `conformance` job.

**Scope:** `packages/ynabro/tests/conformance.test.ts` (new), `.github/workflows/ci.yml`
**Not in scope:** Adapter source files; unit tests (Task 4)
**Prerequisite:** Tasks 1–3 complete (tests must pass against the final state of the adapter files)

**Definition of Done:**
- `conformance.test.ts` asserts for each adapter (`openclaw-ynabro/src/index.ts`, `pi-ynabro/src/index.ts`):
  - File imports `setupYnab` from `"ynabro"` (not defined locally)
  - File imports `YnabroConfigAdapter` from `"ynabro"` (not defined locally)
  - File does NOT contain `interface YnabroConfigAdapter` (no local redefinition)
  - File does NOT contain `process.env.YNAB_TOKEN` (no env var reads)
  - File does NOT contain `.ynabro/config.json` or `CONFIG_FILE` (no legacy file paths)
  - For `openclaw-ynabro` only: file does NOT contain `planIdSchema` (schema was removed)
- Each assertion has a clear failure message indicating exactly what divergence was detected
- `ci.yml` adds a `conformance` job that runs after `check`, with: `npm ci`, `npm run build`, then `npm run test -w packages/ynabro -- --reporter=verbose` (or equivalent vitest CLI) with a step name `"Cross-plugin conformance tests"`
- `npm run test -w packages/ynabro` passes (all conformance tests green)

**Verification:** `npm run test -w packages/ynabro`

---

### Task 6: Documentation — all READMEs, `docs/TOOLS.md`, `docs/ARCHITECTURE.md`

**Scope:** `README.md` (root), `packages/openclaw-ynabro/README.md`, `packages/pi-ynabro/README.md`, `docs/TOOLS.md`, `docs/ARCHITECTURE.md`
**Not in scope:** Source code, tests, CI (handled in Task 5)
**Prerequisite:** All code tasks complete

**Definition of Done:**

Root `README.md`:
- Quick start example updated to use `setupYnab(client, plans, selectedPlanId, adapter)` pattern, not direct `planId` in tool calls
- References to `process.env.YNAB_TOKEN` removed from example

`packages/openclaw-ynabro/README.md`:
- Available Tools list includes `ynabro_save_default_plan`; removes any `planId` parameter description from plan-dependent tools
- Configuration section: removes env var fallback; states token comes exclusively from `plugins.entries.openclaw-ynabro.config.token`
- Adds Onboarding section describing the two-step flow: call `ynabro_setup`, then `ynabro_save_default_plan` with the chosen ID

`packages/pi-ynabro/README.md`:
- Requirements section: replaces `YNAB_TOKEN environment variable must be set` with: token is stored in pi's AuthStorage via `ynabro_setup` (interactive)
- Available Tools list stays the same (no `ynabro_save_default_plan` — pi uses a single-step flow)

`docs/TOOLS.md`:
- Authentication section updated: `openclaw-ynabro` uses plugin config only (no env var); `pi-ynabro` uses AuthStorage
- `ynabro_setup` entry distinguishes OpenClaw (returns plan list) vs. pi (interactive, one step)
- New `ynabro_save_default_plan` entry (OpenClaw only) with parameters, return value, and usage note
- Plan-dependent tool entries note that `planId` is no longer a parameter — resolved from stored default

`docs/ARCHITECTURE.md`:
- Token resolution flowchart updated to single-source (plugin config only for OpenClaw; AuthStorage for pi)
- Removes "corrected in issue #32" note
- Adds `YnabroConfigAdapter` section: interface definition, per-platform storage table, how `setupYnab` uses it

**Verification:** Manual review — no `npm run check` required

---

## Acceptance Criteria

- `YnabroConfigAdapter` exported from `packages/ynabro/src/index.ts`; `dist/index.d.ts` confirms after build
- `setupYnab` in core: four-param signature; validates planId in plans; delegates to adapter; zero file I/O; zero env var reads
- `openclaw-ynabro`: no `planIdSchema`; no `process.env.YNAB_TOKEN`; `ynabro_setup` returns plan list; `ynabro_save_default_plan` registered and in `contracts.tools`; `openClawAdapter` uses `mutateConfigFile` for persistence + closure cache for in-session reads
- `pi-ynabro`: no local `interface YnabroConfigAdapter`; imports type and `setupYnab` from `"ynabro"`; calls `setupYnab(client, plans, selectedPlan.id, piConfigAdapter)` at storage step
- `packages/ynabro/tests/setupYnab.test.ts` exists and covers happy path + error cases
- `packages/ynabro/tests/conformance.test.ts` exists and catches any regression that reintroduces local adapter duplication, env var reads, or legacy file paths
- CI `conformance` job exists in `ci.yml` and runs the conformance suite explicitly
- All READMEs and docs reflect current behavior
- `npm run check` exits 0 (lint + typecheck + all tests pass)

## Non-goals

- No changes to `getSkillState` / `updateSkillState`
- No migration from `YNAB_TOKEN` env var in `openclaw-ynabro` — clean break
- No new Vitest config in `openclaw-ynabro` or `pi-ynabro` — tests live in `packages/ynabro/tests/`
- No semver bump decisions — release-please handles that

## Assumptions

- `packages/ynabro/dist/` must be rebuilt after Task 1 before Tasks 2–4 can typecheck successfully
- Vitest `include: ["tests/**/*.test.ts"]` in `packages/ynabro/vitest.config.ts` picks up all new test files in `packages/ynabro/tests/` automatically
- Root `npm run check` → `npm run test --workspaces --if-present` already runs `packages/ynabro` tests; the CI conformance job is additive (explicit, not replacing)
- `api.runtime.config.mutateConfigFile({ afterWrite: { mode: "auto" }, ... })` is safe in an OpenClaw tool execute handler (confirm? — implementor should verify against SDK type surface)
- `api.pluginConfig` at registration time may not reflect values written by `mutateConfigFile` in the same session — hence the closure cache
- `draft.plugins.entries["openclaw-ynabro"].config` is the correct mutation path in `OpenClawConfig` — implementor must inspect the type to confirm exact mutation syntax (TypeScript will catch any mismatch)

## Verification Plan

- `npm run check` — Biome lint, all workspace typechecks, all Vitest tests (all three suites: smoke, setupYnab, conformance)
- `npm run typecheck -w packages/ynabro` — isolated core check
- `npm run typecheck -w packages/openclaw-ynabro` — isolated openclaw check
- `npm run typecheck -w packages/pi-ynabro` — isolated pi check
- `npm run test -w packages/ynabro` — all three test files pass

## Wave Plan

| Wave | Tasks | Parallelism |
|---|---|---|
| 1 | Task 1 (core refactor + build) | Sequential — must come first |
| 2 | Tasks 2, 3, 4 (adapters + unit tests) | Parallel — all depend only on Task 1 output |
| Verify 2 | Verifier | — |
| 3 | Tasks 5, 6 (conformance + docs) | Parallel — depend on Tasks 2–3 being done |
| Final verify | Verifier | — |

## Rollback Plan

`git checkout packages/ynabro/src packages/openclaw-ynabro/src packages/pi-ynabro/src packages/ynabro/tests docs` plus `npm run build -w packages/ynabro` to restore dist. No external state is touched by source changes.
