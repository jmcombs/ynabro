# Contributing to ynabro

Please follow the existing code style enforced by Biome.

Run `npm run check` before submitting any changes.

## Adding New Functionality

When adding new features to ynabro, follow these guidelines to keep the library extensible and maintainable.

### State File Structure

ynabro uses a modular state file (`state.json`) to persist data across sessions. All new functionality **must** be added under the `modules` key.

#### Schema Rules

- New features must live under `modules.<feature-name>`
- Per-plan settings go under `plans.<plan-id>.modules.<feature-name>`
- Global settings go under `global.modules.<feature-name>`
- Never add new top-level keys outside of `modules`

**Example structure when adding a new feature:**

```json
{
  "version": 1,
  "plans": {
    "<plan-id>": {
      "modules": {
        "transactions": { ... },
        "your-new-feature": {
          "enabled": true,
          "last_synced": "2026-05-15T..."
        }
      }
    }
  },
  "global": {
    "modules": {
      "your-new-feature": { ... }
    }
  }
}
```

### Code Organization

When adding a new feature:

1. Add any new client methods to `src/client/YnabroClient.ts`
2. Create new tool functions in `src/tools/`
3. Export them from `src/tools/index.ts` and `src/index.ts`
4. Update types in `src/types/` if needed
5. Document the new tools in `docs/TOOLS.md`
6. Update `AGENTS.md` with usage guidance for the new capability

### Naming Conventions

- Feature/module names should be lowercase and hyphenated (e.g. `transaction-rules`, `budget-forecasting`)
- Tool function names should be descriptive and start with a verb (`get`, `create`, `update`, `sync`, etc.)

### Documentation Requirements

Every new feature must include:

- JSDoc comments on all public functions
- Updated `docs/TOOLS.md`
- Updated `AGENTS.md` (if the feature changes agent behavior)
- Example usage in the relevant documentation

### Versioning

If your change modifies the state file structure in a breaking way, increment the top-level `version` field and provide a migration path in the release notes.