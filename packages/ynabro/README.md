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
import { YnabroClient, getPendingTransactions, approveTransaction } from 'ynabro';

const client = new YnabroClient(process.env.YNAB_TOKEN!);
const pending = await getPendingTransactions(client, planId);

// ... agent decides which to approve ...

await approveTransaction(client, planId, transactionId);
```

## Documentation

- [AGENTS.md](./AGENTS.md) — Instructions for AI agents
- [docs/TOOLS.md](./docs/TOOLS.md) — Tool reference
- [docs/ARCHITECTURE.md](./docs/ARCHITECTURE.md) — Design decisions

## Philosophy

- Thin, reliable wrapper around the official YNAB SDK
- Public API uses "Plan" terminology
- Designed for agent consumption first
