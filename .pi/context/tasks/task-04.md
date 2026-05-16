# Task 4: Unit tests for setupYnab and YnabroConfigAdapter

**Status:** ✅ Complete  
**Assignee:** implementor-typescript  
**Commit:** e561186

## What Changed

Added comprehensive test coverage for the new `setupYnab` API and `YnabroConfigAdapter` interface in the core `ynabro` package.

### Files Changed

- **packages/ynabro/tests/setupYnab.test.ts** (new)
  - 10 test cases covering the four-parameter `setupYnab` API
  - `describe("setupYnab")` with 8 tests:
    - Stores the correct plan ID via adapter
    - Calls `setDefaultPlanId` exactly once
    - Throws when `selectedPlanId` not in plans
    - Error message includes the invalid plan ID
    - Error message lists all valid plan IDs
    - Does not call `setDefaultPlanId` if validation fails
    - Succeeds with single-plan list
    - Succeeds selecting the last plan in a multi-plan list
  - `describe("YnabroConfigAdapter")` with 2 tests:
    - Validates `setupYnab` is a function
    - Validates the adapter interface can be implemented

- **packages/ynabro/tests/smoke.test.ts** (updated)
  - Added `setupYnab` to imports from `../src/index.js`
  - Added one new test case: "should export setupYnab"
  - All existing tests continue to pass

## Verification Results

✅ **`npm run test -w packages/ynabro`** — All 14 tests pass
- 4 smoke tests (including new setupYnab export test)
- 10 setupYnab/adapter tests

✅ **`npm run typecheck -w packages/ynabro`** — Passes

⚠️ **`npm run check`** (root) — Fails on openclaw-ynabro typecheck
- **Expected:** Tasks 2 and 3 (adapter updates) must complete before root check passes
- **Reason:** openclaw-ynabro still uses old setupYnab signature (no args)
- **Resolution:** Will be fixed by Task 2

## Test Coverage

### Happy Paths
- Valid plan selection from multi-plan list
- Valid plan selection from single-plan list
- Selecting the last plan in a list
- Adapter receives correct plan ID

### Error Paths
- Invalid plan ID throws error
- Error message includes invalid ID
- Error message lists all valid IDs
- Adapter not called on validation failure

### Contract Validation
- setupYnab is exported as a function
- YnabroConfigAdapter interface is implementable

## Risks & Follow-ups

None. Task complete and isolated to core `ynabro` package.

## Dependencies

- **Prerequisite:** Task 1 (complete - core refactor and build)
- **Blocks:** None (Task 4 runs in parallel with Tasks 2 and 3)
- **Next:** Task 5 (conformance tests) will verify that adapters import setupYnab correctly
