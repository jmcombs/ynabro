# ynabro Architecture

## Goals

- Provide a clean, typed interface for YNAB that is easy for LLMs to use.
- Abstract away awkward parts of the official YNAB SDK (e.g. "budgets" vs "plans").
- Keep the library thin — intelligence lives in the agent/LLM, not in the client.

## Design Decisions

- Use the official `ynab` npm package as the underlying client.
- Expose one tool per file in `src/tools/` for easy agent discovery.
- Public API uses "Plan" terminology even though the YNAB backend still uses "budgets".
- Minimal business logic — matching and decision making is the agent's responsibility.

## Trade-offs

- One `as unknown as any` cast is required due to incomplete types in the YNAB SDK for transaction updates.
