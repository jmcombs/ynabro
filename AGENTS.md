# ynabro — Agent Development Instructions

This document defines how agents should contribute to and develop the `ynabro` repository.

## Core Development Principles

- **Read existing patterns before writing new code.** Match the style, structure, and conventions already present.
- **Make minimal, focused changes.** Do not refactor unrelated code.
- **Spec first for non-trivial work.** Clearly state what will be done before implementing.
- **State assumptions explicitly.** Do not guess when requirements are ambiguous.
- **Verify before completing.** Always run `npm run check` before marking work as done.
- **No scope creep.** Only implement what was agreed upon. Surface new ideas as follow-up work.
- **Use Conventional Commits.** All commits must follow the Conventional Commits specification.

## Project Structure

- `packages/ynabro/` — Core YNAB client library (published as `ynabro`)
  - `src/client/` — Core YNAB client wrapper
  - `src/tools/` — Individual tool implementations (one file per tool)
- `packages/pi-ynabro/` — Thin pi extension registration layer (published as `pi-ynabro`)
- `skills/ynabro/` — Centralized prompts and skill definitions
- `docs/` — Tool reference and architecture documentation

## Adding New Functionality

When extending ynabro:

1. Add client methods in `packages/ynabro/src/client/YnabroClient.ts`
2. Create new tool functions in `packages/ynabro/src/tools/`
3. Export new tools via `packages/ynabro/src/tools/index.ts` and `packages/ynabro/src/index.ts`
4. Place all behavioral prompts and rules under `skills/ynabro/prompts/`
5. Do **not** duplicate prompts or skills inside `packages/pi-ynabro/`
6. Update `docs/TOOLS.md` and `AGENTS.md` as needed

## State Management Rules

All persistent data must follow the modular state schema:

- Per-plan state: `plans.<plan-id>.modules.<feature>`
- Global state: `global.modules.<feature>`
- Never add new top-level keys outside of `modules`

## Quality Expectations

- Run `npm run check` before completing any task.
- All new code must pass linting (Biome), type checking, and tests.
- Follow the naming conventions defined in `CONTRIBUTING.md`.

## Terminology

- **Plan** — The public-facing YNAB concept (what users see in the app). This is what `ynabro` exposes in its public API.

Agents should always use **Plan** terminology when interacting with `ynabro` tools and the client.

## When to Ask

Ask for clarification when:
- Requirements are ambiguous
- Multiple valid approaches exist
- Changes would affect the public API or state schema

## Keeping Dependencies Current

Before implementing new features or making changes, always:

1. Use web search or available search tools to check for the latest versions, best practices, and recommended configurations for the libraries and tools being used.

2. If search tools are not available, explicitly warn the developer that search capabilities must be enabled for the agent to properly validate current standards and dependencies.

Key areas to validate:
- Latest stable versions of core dependencies
- Current best practices for Biome, Vitest, and TypeScript
- Recommended project setup patterns for the language/framework in use

Update to the latest stable versions when appropriate, following semantic versioning best practices. Document any major version bumps or configuration changes in the commit message.
```