![YNABro Logo](full_logo.png)

<p align="center">
  <a href="https://www.npmjs.com/package/openclaw-ynabro"><img src="https://img.shields.io/npm/v/openclaw-ynabro.svg?style=flat-square" alt="npm version"></a>
  <a href="https://github.com/jmcombs/ynabro/blob/main/LICENSE"><img src="https://img.shields.io/badge/License-MIT-3465a4?style=flat-square" alt="MIT License"></a>
  <a href="https://github.com/sponsors/jmcombs"><img src="https://img.shields.io/badge/Sponsor-GitHub%20Sponsors-3465a4?style=flat-square" alt="GitHub Sponsors"></a>
</p>

# openclaw-ynabro

OpenClaw plugin that registers [ynabro](https://www.npmjs.com/package/ynabro) tools for YNAB integration.

## Installation

```bash
openclaw plugins install openclaw-ynabro
```

## Available Tools

- `ynabro_setup`
- `ynabro_get_pending_transactions`
- `ynabro_get_recent_transactions`
- `ynabro_approve_transaction`
- `ynabro_get_plan_info`
- `ynabro_get_skill_state`
- `ynabro_update_skill_state`

## Requirements

- `YNAB_TOKEN` environment variable must be set
