# YNABro Tools Reference

This document describes all available tools in the `ynabro` library.

## Authentication

All tools that call the YNAB API require a valid Personal Access Token. In the `openclaw-ynabro` adapter, the token is resolved from `plugins.entries.openclaw-ynabro.config.token` (OpenClaw plugin config) first, falling back to the `YNAB_TOKEN` environment variable. See `docs/ARCHITECTURE.md` for the full resolution flowchart.

Tools that do **not** require a token: `ynabro_get_skill_state`, `ynabro_update_skill_state` (local state only).

## YnabroClient

Core client for interacting with the YNAB API.

### Methods

- `getPlans()` — Retrieve all plans for the user
- `getTransactions(planId, options?)` — Get transactions with optional filtering
- `updateTransaction(planId, transactionId, patch)` — Update a transaction

---

## getPendingTransactions

**Primary tool for reviewing transactions that need attention.**

```ts
getPendingTransactions(client: YnabroClient, planId: string): Promise<YnabTransaction[]>
```

Returns all unapproved transactions for the given plan.

```mermaid
sequenceDiagram
    participant Agent
    participant Tool
    participant Client
    participant YNAB

    Agent->>Tool: getPendingTransactions(planId)
    Tool->>Client: getTransactions(planId, {type: "uncategorized"})
    Client->>YNAB: GET /budgets/{planId}/transactions
    YNAB-->>Client: Transactions
    Client-->>Tool: Filtered list
    Tool-->>Agent: Result
```

---

## getRecentTransactions

```ts
getRecentTransactions(client: YnabroClient, planId: string): Promise<YnabTransaction[]>
```

Returns recent transactions (approved + pending).

---

## approveTransaction

**Use only after high-confidence matching or explicit user approval.**

```ts
approveTransaction(client: YnabroClient, planId: string, transactionId: string): Promise<void>
```

Approves a specific transaction.

```mermaid
sequenceDiagram
    participant Agent
    participant Tool
    participant Client
    participant YNAB

    Agent->>Tool: approveTransaction(planId, txId)
    Tool->>Client: updateTransaction(planId, txId, {approved: true})
    Client->>YNAB: PUT /budgets/{planId}/transactions/{txId}
    YNAB-->>Client: Success
    Client-->>Tool: Result
    Tool-->>Agent: Confirmation
```

---

## getPlanInfo

```ts
getPlanInfo(client: YnabroClient, planId: string): Promise<YnabPlan | undefined>
```

Returns basic metadata for a specific plan.
