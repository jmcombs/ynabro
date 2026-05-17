## Task 1: Core library — `onboardingStatus.ts` + extend `YnabroConfigAdapter`

Add `hasToken()` to the `YnabroConfigAdapter` interface and create the `checkOnboardingStatus()` core helper.

## Scope

- `packages/ynabro/src/tools/setupYnab.ts` — add `hasToken(): Promise<boolean>` to the `YnabroConfigAdapter` interface
- `packages/ynabro/src/tools/onboardingStatus.ts` — new file
- `packages/ynabro/src/tools/index.ts` — export new symbols

Not in scope: adapters, tests, docs, skill prompt.

Note: `src/index.ts` uses explicit named exports (not `export *`), so new symbols added to `tools/index.ts` must also be added to the export list in `src/index.ts`.

## Definition of Done

**`setupYnab.ts`:**
- `YnabroConfigAdapter` interface gains a third method: `hasToken(): Promise<boolean>`
- No other changes to this file

**`onboardingStatus.ts` (new file):**
- Exports `OnboardingStatus` interface:
  ```ts
  export interface OnboardingStatus {
    ready: boolean;
    missing: ('token' | 'plan')[];
    tokenInstructions: string;
    nextStep?: string;
  }
  ```
- Exports `TOKEN_INSTRUCTIONS` string constant containing these exact four steps (may word the prose, but must include the URL):
  ```
  To generate a YNAB Personal Access Token:
  1. Go to https://app.ynab.com/settings/developer
  2. Click 'New Token'
  3. Enter your YNAB password
  4. Copy the token (it will only be shown once)
  ```
- Exports `checkOnboardingStatus(adapter: YnabroConfigAdapter): Promise<OnboardingStatus>`:
  - Calls `adapter.hasToken()` and `adapter.getDefaultPlanId()` in parallel (Promise.all)
  - Builds `missing` array: push `'token'` if no token, push `'plan'` if no planId
  - `ready` is `true` only when `missing` is empty
  - `tokenInstructions` is always `TOKEN_INSTRUCTIONS`
  - `nextStep` is set to a brief action prompt when `ready` is `false`; omitted (undefined) when `ready` is `true`

**`tools/index.ts`:**
- Adds `export { checkOnboardingStatus, TOKEN_INSTRUCTIONS, type OnboardingStatus } from "./onboardingStatus.js";`

## Verification

```bash
npm run typecheck -w packages/ynabro
npm run build -w packages/ynabro
grep "checkOnboardingStatus" packages/ynabro/dist/index.d.ts
grep "OnboardingStatus" packages/ynabro/dist/index.d.ts
```

All commands must exit 0 / produce the expected output.
