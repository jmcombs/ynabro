## Task 1: Refactor core `packages/ynabro` — export `YnabroConfigAdapter` and rewrite `setupYnab`

## Scope

**In scope:**
- `packages/ynabro/src/tools/setupYnab.ts` — complete rewrite
- `packages/ynabro/src/index.ts` — add `YnabroConfigAdapter` to exports
- Run `npm run build -w packages/ynabro` after edits so downstream adapters pick up the new type declarations

**Not in scope:**
- `packages/openclaw-ynabro/` — handled in Task 2
- `packages/pi-ynabro/` — handled in Task 3
- Any test files — existing tests remain untouched

## What to implement

### `packages/ynabro/src/tools/setupYnab.ts` — full rewrite

Remove all `.ynabro/config.json` file I/O (`fs`, `path`, `loadConfig`, `saveConfig`, `ensureConfigDir`).
Remove `process.env.YNAB_TOKEN` read.
Remove `YnabroClient` instantiation inside this function (client is passed in by caller).

Define and export `YnabroConfigAdapter`:

```ts
export interface YnabroConfigAdapter {
  getDefaultPlanId(): Promise<string | undefined>;
  setDefaultPlanId(planId: string): Promise<void>;
}
```

Rewrite `setupYnab` with the following signature and behaviour:

```ts
export async function setupYnab(
  _client: YnabroClient,
  plans: YnabPlan[],
  selectedPlanId: string,
  adapter: YnabroConfigAdapter,
): Promise<void>
```

- Validate that `selectedPlanId` is present in `plans`. If not found, throw:
  `Error(\`Plan ID "${selectedPlanId}" not found. Valid IDs: ${plans.map(p => p.id).join(", ")}\`)`
- Call `await adapter.setDefaultPlanId(selectedPlanId)`
- Return void (no return value)

The `_client` parameter is accepted for API consistency but not used in this implementation.

Imports needed: `YnabroClient` from `"../client/YnabroClient.js"` and `YnabPlan` from `"../types/ynab.js"`.

### `packages/ynabro/src/index.ts` — add export

Add `YnabroConfigAdapter` to the named exports. It is defined in `setupYnab.ts` and re-exported via the tools index, so verify the chain:
- `src/tools/index.ts` re-exports from `setupYnab.ts` (the `setupYnab` function is already there — ensure `YnabroConfigAdapter` is also included)
- `src/index.ts` already re-exports from `./tools/index.js` — add `type { YnabroConfigAdapter }` if not already covered

### Build step

After editing source files, run:
```
npm run build -w packages/ynabro
```

This regenerates `dist/index.d.ts` so `openclaw-ynabro` and `pi-ynabro` can import `YnabroConfigAdapter` from `"ynabro"`.

## Definition of Done

- `YnabroConfigAdapter` interface exported from `packages/ynabro/src/index.ts`
- `setupYnab` has the four-parameter signature and only stores via the adapter
- No `fs`, `path`, `process.env`, or `.ynabro/config.json` references remain in `setupYnab.ts`
- `packages/ynabro/dist/index.d.ts` contains `YnabroConfigAdapter` after build
- `npm run typecheck -w packages/ynabro` passes

## Verification

```bash
cd /Users/jmcombs/Projects/ynabro
npm run typecheck -w packages/ynabro
npm run build -w packages/ynabro
grep "YnabroConfigAdapter" packages/ynabro/dist/index.d.ts
```
