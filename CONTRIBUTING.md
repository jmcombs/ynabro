# Contributing to ynabro

## Quality Gate

All contributions must pass the following command before submission:

```bash
npm run check
```

This runs linting (Biome), type checking, and tests.

## Development Standards

- Follow the principles defined in `AGENTS.md`
- Use [Conventional Commits](https://www.conventionalcommits.org/) for all commit messages
- Make minimal, focused changes
- Read existing patterns before implementing new code

## Documentation Standards

All contributions must include documentation. Documentation is part of the feature.

### What Must Be Documented

| Component                  | Required Documentation                     | Location                              |
|---------------------------|--------------------------------------------|---------------------------------------|
| Client methods            | JSDoc + usage example                      | `src/client/YnabroClient.ts`          |
| Tools                     | JSDoc + entry in tool reference            | `src/tools/` + `docs/TOOLS.md`        |
| Wrappers (e.g. pi-ynabro) | Registration logic + usage notes           | `packages/pi-ynabro/src/index.ts`     |
| New state modules         | Schema + example                           | `docs/ARCHITECTURE.md`                |
| Behavioral changes        | Prompt updates                             | `skills/ynabro/prompts/`              |

### Required Elements

When documenting a new method or tool, include:
- Purpose
- Parameters with types and descriptions
- Return value
- Example usage
- Side effects (e.g. state changes)

### Mermaid Diagrams

Significant features and flows must include Mermaid diagrams:
- Use **sequence diagrams** for multi-component flows
- Use **flowcharts** for decision logic

Diagrams should be placed in `docs/ARCHITECTURE.md`, `docs/TOOLS.md`, or `skills/ynabro/prompts/`.

### Documentation Process

When adding a feature:
1. Write JSDoc
2. Update `docs/TOOLS.md`
3. Add or update Mermaid diagram(s)
4. Update relevant prompts in `skills/ynabro/prompts/`
5. Run `npm run check`

## Adding New Functionality

### Skills and Prompts

All agent behavioral logic and rules must be added under:

```
skills/ynabro/prompts/
```

Do not duplicate prompt files inside `packages/pi-ynabro/`.

### State Schema

New features must use the modular state format:
- `plans.<plan-id>.modules.<feature-name>`
- `global.modules.<feature-name>`

### Tool Development

- Client logic → `src/client/YnabroClient.ts`
- Tool functions → `src/tools/`
- Exports → `src/tools/index.ts` and `src/index.ts`

### Naming Conventions (TypeScript)

- Feature/module names: lowercase and hyphenated (`transaction-rules`)
- Functions: camelCase starting with a verb (`getPendingTransactions`)

## Versioning

This project uses **Release Please** with Conventional Commits:

| Commit Type              | Version Bump | Example                          |
|--------------------------|--------------|----------------------------------|
| `fix:`                   | Patch        | `fix: handle missing payee`      |
| `feat:`                  | Minor        | `feat: add getPlanInfo`          |
| `BREAKING CHANGE:` or `!`| Major        | `feat!: change tool signature`   |

## Keeping Dependencies Current

Contributors must:

1. Use web search or available search tools to validate the latest versions and best practices before making changes.

2. If search tools are unavailable, the agent must warn the developer that search capabilities need to be enabled so it can access current information.

This includes checking:
- Current versions of libraries and tools
- Latest recommended configurations for Biome, Vitest, and TypeScript
- Modern project setup patterns

Major version bumps or significant configuration changes should be clearly documented in the commit message and release notes.
```