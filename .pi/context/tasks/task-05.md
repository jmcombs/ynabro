## Task 5: Conformance test updates

Extend `packages/ynabro/tests/conformance.test.ts` with four new assertions covering `hasToken` and `ynabro_onboarding_status` on both adapters.

## Scope

- `packages/ynabro/tests/conformance.test.ts` only

Not in scope: adapter source files, other test files.

Prerequisite: Tasks 2 and 3 must be complete — the assertions read the adapter source files, so they must contain `hasToken` and `ynabro_onboarding_status` before these tests can pass.

## Definition of Done

Inside the existing `describe("openclaw-ynabro conformance", ...)` block, add two new `it(...)` tests:

1. **`openClawAdapter` implements `hasToken`**
   - Asserts `openClawSrc` contains `"hasToken"`
   - Failure message: `"openclaw-ynabro adapter must implement hasToken() on openClawAdapter"`

2. **`ynabro_onboarding_status` tool is registered**
   - Asserts `openClawSrc` contains `"ynabro_onboarding_status"`
   - Failure message: `"openclaw-ynabro must register the ynabro_onboarding_status tool"`

Inside the existing `describe("pi-ynabro conformance", ...)` block, add two new `it(...)` tests:

3. **`piConfigAdapter` implements `hasToken`**
   - Asserts `piSrc` contains `"hasToken"`
   - Failure message: `"pi-ynabro adapter must implement hasToken() on piConfigAdapter"`

4. **`ynabro_onboarding_status` tool is registered**
   - Asserts `piSrc` contains `"ynabro_onboarding_status"`
   - Failure message: `"pi-ynabro must register the ynabro_onboarding_status tool"`

All 4 assertions follow the existing pattern: `expect(src, "failure message").toContain("string")`.

## Verification

```bash
npm run test -w packages/ynabro -- --reporter=verbose
```

All 4 new conformance assertions must be green. The existing 13 conformance assertions must still pass. Total test count increases by 4.
