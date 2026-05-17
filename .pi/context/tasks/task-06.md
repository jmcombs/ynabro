## Task 6: Skill prompt + documentation

Rewrite the onboarding section of the YNABro skill prompt and update the two architecture/tools docs.

## Scope

- `skills/ynabro/prompts/ynabro.md`
- `docs/TOOLS.md`
- `docs/ARCHITECTURE.md`

Not in scope: package READMEs, source code, tests, CI.

## Definition of Done

**`skills/ynabro/prompts/ynabro.md`:**

Replace the existing `## Onboarding & Access` section entirely with the following content (exact prose may vary slightly, but all bullet points must be present):

```markdown
## Onboarding & Access

Before performing any YNAB operations, call `ynabro_onboarding_status` to check
whether YNAB access is configured.

If `ready` is `false`, walk the user through setup:

1. **Missing token:** Share the `tokenInstructions` field from the status response.
   The token must never be entered into the chat.
   - **pi:** Call `ynabro_setup` — it presents a native TUI input popup where the
     user enters the token directly. It goes straight to pi's AuthStorage and
     never appears in the conversation.
   - **OpenClaw:** Instruct the user to add the token to `openclaw.json` or via
     the OpenClaw settings UI, then ask them to confirm when done.

2. **Missing plan:** Call `ynabro_setup` to list available plans. Help the user
   pick one. On OpenClaw, follow up with `ynabro_save_default_plan`.

3. **After onboarding completes:** If the user's original message was a functional
   request (e.g., "show my pending transactions"), fulfill it immediately.
   Do not make them repeat themselves.

If a tool returns `{ "error": "onboarding_required" }` during a conversation,
treat it the same as a failed status check — initiate onboarding, then retry
the original operation.
```

- Remove all references to `YNAB_TOKEN` environment variable from the file
- Remove all references to `setupYnab()` as a one-call setup (the tool is `ynabro_setup`)

**`docs/TOOLS.md`:**

1. Add a new `## ynabro_onboarding_status` section (place it before `## ynabro_setup`):
   - Describe: available on both platforms; no parameters; returns `OnboardingStatus` JSON
   - Document the response fields: `ready` (boolean), `missing` (array of `"token"` / `"plan"`), `tokenInstructions` (string), `nextStep` (string, present only when `ready: false`)
   - Note: the agent should call this proactively before any YNAB operation

2. In the Authentication section, update the description of what happens when config is missing — note that tools return `{ error: "onboarding_required", ... }` rather than throwing

**`docs/ARCHITECTURE.md`:**

1. In the `## YnabroConfigAdapter` section:
   - Add `hasToken(): Promise<boolean>` to the interface code block
   - Add a row to the adapter table: `hasToken()` implementation for each platform
   - Add `checkOnboardingStatus(adapter)` with a brief description of what it returns

2. Add a new `## Onboarding Detection` section (after `## YnabroConfigAdapter`) describing the two-layer strategy:
   - Layer 1 (prompt-driven): agent calls `ynabro_onboarding_status` proactively
   - Layer 2 (structured error): plan-dependent tools return `{ error: "onboarding_required" }` JSON as a safety net

## Verification

Manual review. Then confirm the overall suite still passes:

```bash
npm run check
```
