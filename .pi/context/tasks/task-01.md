## Task 1: Refactor core `packages/ynabro` — export `YnabroConfigAdapter` and rewrite `setupYnab`

## Status: ✅ COMPLETE

## What Changed

Completely refactored `packages/ynabro/src/tools/setupYnab.ts`:
- Exported new `YnabroConfigAdapter` interface with two methods: `getDefaultPlanId()` and `setDefaultPlanId(planId)`
- Rewrote `setupYnab` with 4-parameter signature: `(client, plans, selectedPlanId, adapter)`
- Removed all file I/O code: fs, path, CONFIG_DIR, CONFIG_FILE, YnabConfig, ensureConfigDir, loadConfig, saveConfig
- Implementation now validates selectedPlanId exists in plans array and delegates storage to the adapter
- Added YnabroConfigAdapter to exports in `tools/index.ts` and main `index.ts`

## Files Modified

- `packages/ynabro/src/tools/setupYnab.ts` — complete rewrite
- `packages/ynabro/src/tools/index.ts` — added YnabroConfigAdapter to exports
- `packages/ynabro/src/index.ts` — added YnabroConfigAdapter to type exports
- `packages/ynabro/dist/` — rebuilt with new exports

## Verification Results

✅ `npm run typecheck -w packages/ynabro` — PASS
✅ `grep "YnabroConfigAdapter" packages/ynabro/dist/index.d.ts` — FOUND
✅ `npm run lint` — PASS (after auto-format)
✅ `npm run build -w packages/ynabro` — SUCCESS

## Expected Side Effects

The downstream packages (`openclaw-ynabro` and `pi-ynabro`) now have type errors because they call the old `setupYnab()` signature. This is expected and will be resolved in:
- Task 2: Update `openclaw-ynabro` to implement YnabroConfigAdapter
- Task 3: Update `pi-ynabro` to implement YnabroConfigAdapter

## Commit

```
refactor(ynabro): export YnabroConfigAdapter and rewrite setupYnab

- Export YnabroConfigAdapter interface with getDefaultPlanId and setDefaultPlanId methods
- Rewrite setupYnab to accept client, plans, selectedPlanId, and adapter parameters
- Remove all fs/path-based config file I/O from setupYnab
- setupYnab now validates planId exists and delegates storage to the adapter
- Export YnabroConfigAdapter from main index for downstream packages
```

Commit: d9aa915
