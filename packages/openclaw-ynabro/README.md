# openclaw-ynabro

OpenClaw plugin that registers [YNABro](https://github.com/jmcombs/ynabro) tools for YNAB budget management.

## Installation

```bash
openclaw plugins install openclaw-ynabro
```

## Configuration

Set your YNAB Personal Access Token:

```json
{
  "skills": {
    "entries": {
      "match-transactions": {
        "enabled": true,
        "env": {
          "YNAB_TOKEN": "your-token-here"
        }
      }
    }
  }
}
```

Or set the `YNAB_TOKEN` environment variable directly.

## Tools

| Tool | Description |
|------|-------------|
| `ynabro_setup` | Set up YNAB integration (token + plan selection) |
| `ynabro_get_pending_transactions` | Get pending (uncategorized) transactions |
| `ynabro_get_recent_transactions` | Get recent transactions |
| `ynabro_approve_transaction` | Approve a transaction |
| `ynabro_get_plan_info` | Get plan details |
| `ynabro_get_skill_state` | Read skill state (memory, auto-approve flag) |
| `ynabro_update_skill_state` | Update skill state |

## Skills

This plugin ships the `match-transactions` skill for reviewing YNAB's automatic transaction matching.
