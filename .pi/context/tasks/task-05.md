## Task 5: Cross-plugin conformance tests + CI update

**Prerequisite:** Tasks 1–3 must be complete. Conformance tests validate the *final state* of the adapter source files, so they must run after the adapters are implemented.

## Scope

**In scope:**
- `packages/ynabro/tests/conformance.test.ts` — new file
- `.github/workflows/ci.yml` — add explicit `conformance` job

**Not in scope:**
- Adapter source files — read-only (tests assert their content, do not modify them)
- Unit tests (Task 4)

## What to implement

### `packages/ynabro/tests/conformance.test.ts` — new file

These are static-analysis tests: they use `fs.readFileSync` to read the adapter source files and assert structural invariants. Each test has a clear failure message so a developer knows exactly what they accidentally broke.

**File paths** (resolve from `__dirname` or `import.meta.url`):

```ts
import { readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dir = dirname(__filename);
const REPO_ROOT = resolve(__dir, "../../..");
const OPENCLAW_SRC = resolve(REPO_ROOT, "packages/openclaw-ynabro/src/index.ts");
const PI_SRC = resolve(REPO_ROOT, "packages/pi-ynabro/src/index.ts");
```

**`describe("openclaw-ynabro conformance")`**

1. **imports setupYnab from core** — assert `readFileSync(OPENCLAW_SRC)` contains `setupYnab` AND contains `from "ynabro"`. Failure message: `"openclaw-ynabro must import setupYnab from 'ynabro', not define it locally"`.

2. **imports YnabroConfigAdapter type from core** — assert file contains `YnabroConfigAdapter` AND contains `from "ynabro"`. Failure message: `"openclaw-ynabro must import YnabroConfigAdapter from 'ynabro'"`.

3. **does not locally redefine YnabroConfigAdapter** — assert file does NOT match `/interface YnabroConfigAdapter/`. Failure message: `"openclaw-ynabro must not locally redefine YnabroConfigAdapter — import it from 'ynabro'"`.

4. **does not read YNAB_TOKEN from env** — assert file does NOT contain `process.env.YNAB_TOKEN` AND does NOT contain `YNAB_TOKEN`. Failure message: `"openclaw-ynabro must not read YNAB_TOKEN from environment — use api.pluginConfig.token only"`.

5. **does not reference legacy .ynabro config file** — assert file does NOT contain `.ynabro` AND does NOT contain `config.json`. Failure message: `"openclaw-ynabro must not reference the legacy .ynabro/config.json path"`.

6. **does not declare planIdSchema** — assert file does NOT contain `planIdSchema`. Failure message: `"openclaw-ynabro must not declare planIdSchema — plan-dependent tools use getDefaultPlanId() internally"`.

7. **registers ynabro_save_default_plan tool** — assert file contains `ynabro_save_default_plan`. Failure message: `"openclaw-ynabro must register the ynabro_save_default_plan tool for two-step onboarding"`.

**`describe("pi-ynabro conformance")`**

8. **imports setupYnab from core** — assert `readFileSync(PI_SRC)` contains `setupYnab` AND `from "ynabro"`. Failure message: `"pi-ynabro must import setupYnab from 'ynabro'"`.

9. **imports YnabroConfigAdapter type from core** — assert file contains `YnabroConfigAdapter` AND `from "ynabro"`. Failure message: `"pi-ynabro must import YnabroConfigAdapter from 'ynabro'"`.

10. **does not locally redefine YnabroConfigAdapter** — assert file does NOT match `/interface YnabroConfigAdapter/`. Failure message: `"pi-ynabro must not locally redefine YnabroConfigAdapter — import it from 'ynabro'"`.

11. **does not read YNAB_TOKEN from env** — assert file does NOT contain `YNAB_TOKEN`. Failure message: `"pi-ynabro must not read YNAB_TOKEN from environment — token is managed via AuthStorage"`.

12. **does not reference legacy .ynabro config file** — assert file does NOT contain `.ynabro` AND does NOT contain `config.json`. Failure message: `"pi-ynabro must not reference the legacy .ynabro/config.json path"`.

13. **calls setupYnab from core (not setDefaultPlanId directly) for storage** — assert file contains `setupYnab(` (i.e., `setupYnab` is called as a function, not just imported). Failure message: `"pi-ynabro must call setupYnab() from core rather than calling piConfigAdapter.setDefaultPlanId() directly"`.

**Implementation note:** Use `toContain` / `not.toContain` for simple string checks and `.toMatch` / `.not.toMatch` for regex checks. Each `expect` call should include a custom failure message via the second argument where Vitest supports it, or via a surrounding comment + descriptive test name.

### `.github/workflows/ci.yml` — add `conformance` job

Add a new job after the existing `check` job:

```yaml
  conformance:
    runs-on: ubuntu-latest
    needs: check
    permissions:
      contents: read
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: npm
      - run: npm ci
      - run: npm run build
      - name: Cross-plugin conformance tests
        run: npx vitest run --reporter=verbose
        working-directory: packages/ynabro
```

- Uses `needs: check` so it only runs if the main check job passes
- Runs vitest directly with `--reporter=verbose` for clear output
- `working-directory: packages/ynabro` scopes it to the package that owns the conformance suite
- Uses node 22 (matches minimum engine requirement)
- Push triggers: inherits from the existing workflow's `on:` trigger (pull_request to main)

Do NOT modify the existing `check` or `security` jobs. Only add the new `conformance` job.

## Definition of Done

- `packages/ynabro/tests/conformance.test.ts` exists with all 13 test cases
- All 13 pass against the adapter files produced by Tasks 2 and 3
- `ci.yml` contains a `conformance` job with `needs: check`
- `npm run test -w packages/ynabro` exits 0 (all three test files pass together)

## Verification

```bash
cd /Users/jmcombs/Projects/ynabro
npm run test -w packages/ynabro

# Spot-check a conformance failure to prove the tests catch regressions:
# (don't commit this — just verify locally that the test fails if you
#  temporarily add 'interface YnabroConfigAdapter {}' to pi-ynabro/src/index.ts)
```
