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

After installation, restart the OpenClaw gateway to load the plugin:

```bash
openclaw gateway restart
```

## Tool Access

OpenClaw's default `coding` tool profile only exposes core built-in tools. Plugin tools like `ynabro_*` must be explicitly allowed before agents can call them.

### Global — all agents (recommended)

Adds `openclaw-ynabro` tools to every agent on this gateway:

```bash
openclaw config set tools.alsoAllow '["openclaw-ynabro"]'
openclaw gateway restart
```

This is the standard pattern used by OpenClaw plugins and the right choice for most installs.

### Per-agent — scoped to one agent only

If you want ynabro tools available only to a specific dedicated agent (and not your main session or other agents), add `tools.alsoAllow` to that agent's entry in `openclaw.json` instead:

```json
{
  "agents": {
    "list": [
      {
        "id": "ynabro-matchmaker",
        "tools": {
          "profile": "coding",
          "alsoAllow": ["openclaw-ynabro"]
        }
      }
    ]
  }
}
```

Or via the CLI:

```bash
openclaw config set tools.alsoAllow '["openclaw-ynabro"]'
openclaw gateway restart
```

### Full profile — no restrictions (not recommended)

Setting `tools.profile: "full"` removes all tool restrictions for an agent, giving access to every installed plugin — not just ynabro. Only use this if you intentionally want unrestricted tool access:

```json
{
  "id": "ynabro-matchmaker",
  "tools": { "profile": "full" }
}
```

## Available Tools

- `ynabro_onboarding_status` — check whether the plugin is fully configured
- `ynabro_setup` — fetch available YNAB plans for onboarding
- `ynabro_save_default_plan` — persist the selected plan as the default
- `ynabro_get_pending_transactions` — fetch all unapproved transactions
- `ynabro_get_recent_transactions` — fetch recent transactions for context or audit
- `ynabro_approve_transaction` — approve a specific transaction by ID
- `ynabro_get_plan_info` — get basic plan metadata
- `ynabro_get_skill_state` — read persistent skill state (memory, flags)
- `ynabro_update_skill_state` — merge updates into persistent skill state

## Configuration

Generate a YNAB Personal Access Token at https://app.ynab.com/settings/developer.

`openclaw-ynabro` integrates with [OpenClaw's secrets system](https://docs.openclaw.ai/gateway/secrets) — the token is registered as a SecretRef-eligible surface at `plugins.entries.openclaw-ynabro.config.token`. Store it with one of the supported flows; no environment variable fallback is implemented in the plugin.

### Interactive (recommended)

```bash
openclaw secrets configure
```

In the wizard:

1. Add or reuse a secrets provider (`env`, `file`, or `exec`).
2. From the target picker, select `plugins.entries.openclaw-ynabro.config.token`.
3. Provide the `source` / `provider` / `id` for your chosen backend.
4. Run preflight and apply the plan.

### Non-interactive

Examples — pick whichever provider matches your secret backend:

```bash
# env provider (token loaded from ~/.openclaw/.env or shell env)
openclaw config set plugins.entries.openclaw-ynabro.config.token \
  --ref-source env --ref-provider default --ref-id YNAB_TOKEN

# file provider (token stored in a JSON secrets file)
openclaw config set plugins.entries.openclaw-ynabro.config.token \
  --ref-source file --ref-provider filemain --ref-id /plugins/openclaw-ynabro/token

# exec provider (token retrieved from an external secret manager)
openclaw config set plugins.entries.openclaw-ynabro.config.token \
  --ref-source exec --ref-provider vault --ref-id providers/ynab/token

openclaw secrets reload
openclaw secrets audit | grep -i ynab
```

The plugin reads the resolved token from `api.pluginConfig.token`; OpenClaw resolves the SecretRef before the plugin sees it.

The "YNAB Personal Access Token" field is also surfaced as a sensitive entry in OpenClaw's settings UI.

### Plaintext (not recommended)

If you must, you can set the token in plaintext:

```bash
openclaw config set plugins.entries.openclaw-ynabro.config.token "<your-ynab-pat>"
```

This will surface in `openclaw secrets audit` as a plaintext finding — prefer a SecretRef.

## Default Plan

The selected default plan id is persisted (non-secret) at `plugins.entries.openclaw-ynabro.config.defaultPlanId` by `ynabro_save_default_plan`. See **Onboarding** below.

## Onboarding

Run `ynabro_setup` to fetch your available YNAB plans, then `ynabro_save_default_plan` with the plan ID you want to use as the default:

1. `ynabro_setup` — returns `{ plans: [{ id, name }] }`
2. User (or agent) selects a plan from the list
3. `ynabro_save_default_plan` with `{ planId: "<selected-id>" }` — persists the default

After onboarding, all plan-dependent tools (`ynabro_get_pending_transactions`, `ynabro_get_recent_transactions`, `ynabro_approve_transaction`, `ynabro_get_plan_info`) resolve the plan automatically — no `planId` parameter required.

## Dedicated Agent Setup

For YNAB-specific workflows (e.g. transaction review) it is recommended to create a dedicated agent rather than running ynabro tools in your main session. This keeps YNAB context and memory isolated and prevents ynabro tools from appearing in unrelated conversations.

### Example: `ynabro-matchmaker`

Add the following entry to the `agents.list` array in `~/.openclaw/openclaw.json`:

```json
{
  // Unique agent identifier used for routing and CLI commands
  "id": "ynabro-matchmaker",

  // Internal name used when listing agents via `openclaw agents list`
  "name": "ynabro-matchmaker",

  // Display name, emoji, and avatar shown in the OpenClaw dashboard.
  // Use a data: URI rather than a bare filename or https:// URL.
  // Workspace-relative paths only resolve on the local gateway (breaks
  // remote/mobile clients). Remote URLs are blocked by the Control UI
  // image policy. A base64 data: URI is self-contained and works everywhere.
  //
  // Generate it from the installed plugin asset:
  //   base64 -w 0 ~/.openclaw/npm/node_modules/openclaw-ynabro/logo.png
  // Then set it:
  //   openclaw agents set-identity --agent ynabro-matchmaker \\
  //     --avatar "data:image/png;base64,<output>"
  "identity": {
    "name": "YNABro Matchmaker",
    "emoji": "🔁",
    "avatar": "data:image/png;base64,<base64-encoded-logo>"
  },

  // Isolated workspace — this agent gets its own AGENTS.md, memory,
  // and context files completely separate from your main session
  "workspace": "~/.openclaw/workspace-ynabro-matchmaker",

  // Isolated session store and auth profiles for this agent
  "agentDir": "~/.openclaw/agents/ynabro-matchmaker/agent",

  // Skills to inject into the system prompt at session start.
  // match-transactions is provided by the openclaw-ynabro plugin
  // and guides the agent through the transaction review workflow.
  "skills": ["match-transactions"],

  // Scope ynabro tools to this agent only.
  // Remove this block and use the global option in Tool Access above
  // if you want ynabro tools available across all agents instead.
  "tools": {
    "profile": "coding",
    "alsoAllow": ["openclaw-ynabro"]
  }
}
```

Then restart the gateway to apply:

```bash
openclaw gateway restart
```

Once the agent is running, start a conversation and type `/skill:match-transactions` to trigger the transaction review workflow, or say it naturally: _"match my transactions"_.

> **Note:** Skills are loaded into the system prompt at session start. If you update a skill or change the agent config, type `/new` in the chat to start a fresh session and pick up the changes.
