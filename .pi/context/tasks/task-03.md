## Task 3: Update `packages/pi-ynabro/src/index.ts` — import adapter and `setupYnab` from core

**Prerequisite:** Task 1 must be complete and `packages/ynabro` must be built before typechecking this task.

## Scope

**In scope:**
- `packages/pi-ynabro/src/index.ts` — targeted edits only (three changes described below)

**Not in scope:**
- Any interactive UI logic — the `ctx.ui.input()` / `ctx.ui.select()` flow is unchanged
- `packages/ynabro/` — no changes
- `packages/openclaw-ynabro/` — handled in Task 2

## What to implement

Three targeted changes to `packages/pi-ynabro/src/index.ts`:

### Change 1 — Update imports

**Remove** the local import of `setupYnab` is not there (it was already excluded), but add it now from core. Also replace the local `YnabroConfigAdapter` type with the core import.

**Current imports from `"ynabro"`:**
```ts
import {
  approveTransaction,
  getPendingTransactions,
  getPlanInfo,
  getRecentTransactions,
  getSkillState,
  updateSkillState,
  YnabroClient,
} from "ynabro";
```

**New imports from `"ynabro"`** — add `setupYnab` and `YnabroConfigAdapter`:
```ts
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

### Change 2 — Remove the local `YnabroConfigAdapter` interface

**Remove** this block entirely (it currently appears near the top of the file, after the imports):

```ts
interface YnabroConfigAdapter {
  getDefaultPlanId(): Promise<string | undefined>;
  setDefaultPlanId(planId: string): Promise<void>;
}
```

### Change 3 — Update `ynabro_setup` to call core's `setupYnab`

In the `ynabro_setup` tool's `execute` handler, the final storage step currently reads:

```ts
      // Step 4: Store and return
      const selectedPlan = plans[planOptions.indexOf(selected)];
      await piConfigAdapter.setDefaultPlanId(selectedPlan.id);
```

Replace `await piConfigAdapter.setDefaultPlanId(selectedPlan.id)` with `await setupYnab(client, plans, selectedPlan.id, piConfigAdapter)`:

```ts
      // Step 4: Store and return
      const selectedPlan = plans[planOptions.indexOf(selected)];
      await setupYnab(client, plans, selectedPlan.id, piConfigAdapter);
```

Everything else in the file — all tool registrations, the `piConfigAdapter` object, `getClient()`, `getDefaultPlanId()`, `authStorage` — remains exactly as-is.

## Definition of Done

- `import type { YnabroConfigAdapter } from "ynabro"` present at top of file
- `setupYnab` included in the named imports from `"ynabro"`
- Local `interface YnabroConfigAdapter { ... }` block absent from the file
- `ynabro_setup` calls `await setupYnab(client, plans, selectedPlan.id, piConfigAdapter)` at the storage step
- No other changes to the file
- `npm run typecheck -w packages/pi-ynabro` passes

## Verification

```bash
cd /Users/jmcombs/Projects/ynabro
npm run typecheck -w packages/pi-ynabro
grep "interface YnabroConfigAdapter" packages/pi-ynabro/src/index.ts  # should be empty
grep "setupYnab" packages/pi-ynabro/src/index.ts  # should appear in import and in execute handler
```

---

## Completion Status

**Completed:** 2026-05-16
**Commit:** 4d958b8

### What Changed

Made three targeted edits to `packages/pi-ynabro/src/index.ts`:

1. **Updated imports** — Added type import for `YnabroConfigAdapter` and added `setupYnab` to named imports from `"ynabro"`
2. **Removed local interface** — Deleted the local `interface YnabroConfigAdapter` definition (now using core type)
3. **Updated storage call** — Replaced `await piConfigAdapter.setDefaultPlanId(selectedPlan.id)` with `await setupYnab(client, plans, selectedPlan.id, piConfigAdapter)` in the `ynabro_setup` tool handler

### Files Changed

- `packages/pi-ynabro/src/index.ts` — 3 insertions, 6 deletions (net -3 lines)

### Verification Results

✅ `npm run typecheck -w packages/pi-ynabro` — Passed
✅ `grep "interface YnabroConfigAdapter"` — No matches (local interface removed)
✅ `grep "setupYnab"` — Found in import and execute handler
✅ Biome formatting applied automatically

### Notes

- The full `npm run check` shows a typecheck error in `openclaw-ynabro` (Task 2), but that's expected and not in scope for this task
- The `pi-ynabro` package itself passes all checks independently
- All interactive UI logic remains unchanged as specified
