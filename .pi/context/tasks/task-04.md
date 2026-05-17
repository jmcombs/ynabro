## Task 4: Unit tests — `onboardingStatus.test.ts` + update `setupYnab.test.ts`

Add a new test file for `checkOnboardingStatus()` and update all mock adapters in `setupYnab.test.ts` to satisfy the extended `YnabroConfigAdapter` interface.

## Scope

- `packages/ynabro/tests/onboardingStatus.test.ts` — new file
- `packages/ynabro/tests/setupYnab.test.ts` — update existing mocks only

Not in scope: `conformance.test.ts` (Task 5), adapter source files.

Prerequisite: Task 1 complete and built.

## Definition of Done

**`setupYnab.test.ts` — mock updates:**
- Every inline `YnabroConfigAdapter` object literal in the file gains `hasToken: async () => false` (or `async () => true` where semantically appropriate)
- No test logic changes — only the mock objects are extended
- `npm run typecheck -w packages/ynabro` must not complain about missing `hasToken` on any mock

**`onboardingStatus.test.ts` — new test file:**

Must cover all of the following cases (use `vi.fn()` / inline objects for mock adapters; import `checkOnboardingStatus` from `"../src/index.js"`):

1. Returns `ready: true` and `missing: []` when `hasToken()` returns `true` and `getDefaultPlanId()` returns a string
2. Returns `ready: false` and `missing: ["token", "plan"]` when `hasToken()` returns `false` and `getDefaultPlanId()` returns `undefined`
3. Returns `ready: false` and `missing: ["token"]` (not `"plan"`) when `hasToken()` returns `false` and `getDefaultPlanId()` returns a string
4. Returns `ready: false` and `missing: ["plan"]` (not `"token"`) when `hasToken()` returns `true` and `getDefaultPlanId()` returns `undefined`
5. `tokenInstructions` is a non-empty string in every case
6. `tokenInstructions` contains the string `https://app.ynab.com/settings/developer`
7. `nextStep` is a non-empty string when `ready` is `false`
8. `nextStep` is `undefined` when `ready` is `true`

Each test must also add `setDefaultPlanId: async () => {}` to the mock adapter so the object satisfies `YnabroConfigAdapter`.

## Verification

```bash
npm run test -w packages/ynabro
```

All test files must pass (smoke + setupYnab + onboardingStatus). The new file adds ≥ 8 tests to the total count.
