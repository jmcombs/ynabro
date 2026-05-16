# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.1.0](https://github.com/jmcombs/ynabro/compare/ynabro-v0.0.4...ynabro-v0.1.0) (2026-05-16)


### Features

* add onboarding, per-skill state management, and core skill ([22f7e60](https://github.com/jmcombs/ynabro/commit/22f7e60bbea2f344a58e7b3cfa86d4f273b401e7))
* initial release preparation - onboarding, state management, and core skill ([6117db6](https://github.com/jmcombs/ynabro/commit/6117db645201186fecaf7188a8341b6fa19e537a))
* initial release v1.0.0 - ynabro and pi-ynabro ([d509212](https://github.com/jmcombs/ynabro/commit/d509212a7064956ed27eb86ede578ac52b7455eb))

## [1.0.0] - 2026-05-16

### Added
- Initial public release of `ynabro`
- Core YNAB client with support for plans, accounts, categories, payees, transactions, and scheduled transactions
- Tool layer: `getPendingTransactions`, `getRecentTransactions`, `approveTransaction`, `getPlanInfo`
- Per-skill state management (`getSkillState`, `updateSkillState`)
- `setupYnab()` onboarding tool with platform-specific guidance
- Matched Transaction Reviewer skill with binary confidence scoring and bulk actions
- Centralized skill prompts under `skills/ynabro/prompts/`
- Documentation standards including JSDoc and Mermaid diagrams
- Release Please + CI publishing pipeline for both `ynabro` and `pi-ynabro`

### Changed
- Upgraded to Biome 2.4, Vitest 4.1, YNAB SDK 4.1, and @types/node 25

[1.0.0]: https://github.com/jmcombs/ynabro/releases/tag/v1.0.0
```
