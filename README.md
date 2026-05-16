![YNABro Logo](assets/full_logo.png)

<p align="center">
  <a href="https://www.npmjs.com/package/ynabro"><img src="https://img.shields.io/npm/v/ynabro.svg?style=flat-square" alt="npm version"></a>
  <a href="https://github.com/jmcombs/ynabro/blob/main/LICENSE"><img src="https://img.shields.io/badge/License-MIT-3465a4?style=flat-square" alt="MIT License"></a>
  <a href="https://github.com/sponsors/jmcombs"><img src="https://img.shields.io/badge/Sponsor-GitHub%20Sponsors-3465a4?style=flat-square" alt="GitHub Sponsors"></a>
  <a href="https://github.com/jmcombs/ynabro"><img src="https://img.shields.io/github/stars/jmcombs/ynabro?style=flat-square" alt="GitHub Stars"></a>
</p>

# ynabro

A clean, agent-friendly YNAB client library for LLMs and coding agents.

## Installation

```bash
npm install ynabro
```

## Quick Start

```ts
import { YnabroClient, setupYnab, getPendingTransactions, approveTransaction } from 'ynabro';
import type { YnabroConfigAdapter } from 'ynabro';

// 1. Implement the adapter for your platform's config system
const adapter: YnabroConfigAdapter = {
  getDefaultPlanId: async () => /* read from your config */ undefined,
  setDefaultPlanId: async (id) => { /* write to your config */ },
};

// 2. One-time setup: fetch plans, let the user select, then store
const client = new YnabroClient(token);
const plans = await client.getPlans();
await setupYnab(client, plans, selectedPlanId, adapter);

// 3. Subsequent calls — no planId needed in the adapter layer
const pending = await getPendingTransactions(client, await adapter.getDefaultPlanId()!);
await approveTransaction(client, await adapter.getDefaultPlanId()!, transactionId);
```

## Documentation

- [AGENTS.md](./AGENTS.md) — Instructions for AI agents
- [docs/TOOLS.md](./docs/TOOLS.md) — Tool reference
- [docs/ARCHITECTURE.md](./docs/ARCHITECTURE.md) — Design decisions

## Philosophy

- Thin, reliable wrapper around the official YNAB SDK
- Public API uses "Plan" terminology
- Designed for agent consumption first
