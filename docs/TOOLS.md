# YNABro Tools Reference

This document describes all available tools in the `ynabro` library.

## Authentication

All tools that call the YNAB API require a valid Personal Access Token.

- **`openclaw-ynabro`**: Token is resolved exclusively from `plugins.entries.openclaw-ynabro.config.token` in `openclaw.json`. No environment variable fallback.
- **`pi-ynabro`**: Token is stored in pi's `AuthStorage` (`~/.pi/agent/auth.json`) after running `ynabro_setup`.

Tools that do **not** require a token: `ynabro_get_skill_state`, `ynabro_update_skill_state` (local state only).

## YnabroClient

Core client for interacting with the YNAB API.

### Methods

- `getPlans()` — Retrieve all plans for the user
- `getTransactions(planId, options?)` — Get transactions with optional filtering
- `updateTransaction(planId, transactionId, patch)` — Update a transaction

---

## ynabro_setup

**OpenClaw:** Fetches available YNAB plans and returns them for selection. Requires token configured in `openclaw.json`. Returns `{ plans: [{ id: string, name: string }] }`. Call `ynabro_save_default_plan` next to complete onboarding.

**pi:** Interactive one-step onboarding. Prompts for a YNAB Personal Access Token (if not already stored) and presents a plan selector. Stores both in pi's AuthStorage. No follow-up call required.

---

## ynabro_save_default_plan *(OpenClaw only)*

Saves a plan as the default for all subsequent tool calls. Call `ynabro_setup` first to get the list of valid plan IDs.

**Parameters:**
- `planId` (string) — The plan ID to set as default (from `ynabro_setup` results)

**Returns:** `{ message: string, defaultPlanId: string }`

Persists `defaultPlanId` to `plugins.entries.openclaw-ynabro.config.defaultPlanId` in `openclaw.json`.

---

## getPendingTransactions

**Primary tool for reviewing transactions that need attention.**

```ts
getPendingTransactions(client: YnabroClient, planId: string): Promise<YnabTransaction[]>
```

Returns all unapproved transactions for the given plan.

The plan ID is resolved automatically from the stored default. No `planId` parameter is required or accepted.

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

The plan ID is resolved automatically from the stored default. No `planId` parameter is required or accepted.

---

## approveTransaction

**Use only after high-confidence matching or explicit user approval.**

```ts
approveTransaction(client: YnabroClient, planId: string, transactionId: string): Promise<void>
```

Approves a specific transaction.

The plan ID is resolved automatically from the stored default. No `planId` parameter is required or accepted.

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

The plan ID is resolved automatically from the stored default. No `planId` parameter is required or accepted.
