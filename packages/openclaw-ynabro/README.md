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

## Available Tools

- `ynabro_onboarding_status`
- `ynabro_setup`
- `ynabro_save_default_plan`
- `ynabro_get_pending_transactions`
- `ynabro_get_recent_transactions`
- `ynabro_approve_transaction`
- `ynabro_get_plan_info`
- `ynabro_get_skill_state`
- `ynabro_update_skill_state`

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
