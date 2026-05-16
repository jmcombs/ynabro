# ynabro — Agent Instructions

`ynabro` provides a clean, typed interface for YNAB operations designed specifically for LLMs and coding agents.

## Core Principles

- Use the provided tools instead of calling the raw YNAB API.
- Always work with **Plan IDs** (not budget IDs) in the public API.
- Prefer high-confidence, conservative matching before calling `approveTransaction`.
- Use the modular state system to persist knowledge (such as `server_knowledge`) across sessions.

## State Management

ynabro uses a modular state file. All persistent data lives under `modules.<feature>`.

- Use delta requests (`last_knowledge_of_server`) when available to reduce API calls.
- Store and retrieve state using the provided state utilities.
- Per-plan settings live under `plans.<plan-id>.modules.<feature>`.
- Global settings live under `global.modules.<feature>`.

## Available Tools

| Tool                      | Purpose                              | When to Use                     |
|---------------------------|--------------------------------------|---------------------------------|
| `getPendingTransactions`  | Fetch unapproved transactions        | Primary tool for YNABro         |
| `getRecentTransactions`   | Fetch recent activity                | Context / audit                 |
| `approveTransaction`      | Approve a matched transaction        | After high-confidence match     |
| `getPlanInfo`             | Get basic plan metadata              | Validation / display            |

## Recommended Workflow

1. Load existing state (including `last_knowledge_of_server`) for the plan
2. Call `getPendingTransactions(planId)` using delta requests when possible
3. Reason over the results using your matching logic
4. Call `approveTransaction` only on high-confidence matches (unless auto-approve is enabled)
5. Save updated state (especially new `server_knowledge`)

See `docs/TOOLS.md` for exact signatures.