# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [2.2.2](https://github.com/jmcombs/ynabro/compare/ynabro/v2.2.1...ynabro/v2.2.2) (2026-05-17)


### Performance Improvements

* **openclaw-ynabro:** skip redundant getPlans() fetch in ynabro_save_default_plan ([cf83634](https://github.com/jmcombs/ynabro/commit/cf8363456a4f94402a06d696171f4c8cf764bd8b))
* **ynabro:** make plans optional in setupYnab to avoid redundant getPlans fetch ([9a4f4bc](https://github.com/jmcombs/ynabro/commit/9a4f4bc7acd1f365e288d649a8a8d13848703420))

## [2.2.1](https://github.com/jmcombs/ynabro/compare/ynabro/v2.2.0...ynabro/v2.2.1) (2026-05-17)


### Bug Fixes

* **ynabro:** move ynab to dependencies; replace CI theatre with real load test ([7abbbf2](https://github.com/jmcombs/ynabro/commit/7abbbf29ae5a4c272a52d314901590e4f6ec9eb8))
* **ynabro:** move ynab to dependencies; replace CI theatre with real load test ([1b7c162](https://github.com/jmcombs/ynabro/commit/1b7c162f66d24d5db9bcb6769c1cb52e8911d3e2))

## [2.2.0](https://github.com/jmcombs/ynabro/compare/ynabro/v2.1.0...ynabro/v2.2.0) (2026-05-17)


### Features

* add onboarding status check and hasToken to config adapter ([b484624](https://github.com/jmcombs/ynabro/commit/b4846243cfa1ed136270c9cb4e3b33410ab83fff))
* unified onboarding flow with ynabro_onboarding_status tool ([9946b3b](https://github.com/jmcombs/ynabro/commit/9946b3ba6761c42f25b60779f5fb87f9ffaa01fa))

## [2.1.0](https://github.com/jmcombs/ynabro/compare/ynabro/v2.0.0...ynabro/v2.1.0) (2026-05-16)


### Features

* unify YNAB config adapter across all platform adapters ([98ce8d7](https://github.com/jmcombs/ynabro/commit/98ce8d7c784ec43650c8cefb1921bb4001d8c976))

## [2.0.0](https://github.com/jmcombs/ynabro/compare/ynabro/v1.0.0...ynabro/v2.0.0) (2026-05-16)


### ⚠ BREAKING CHANGES

* The ynabro source has moved from the repo root to packages/ynabro/. Release Please config and manifest paths have changed accordingly.
* prepare for first stable 1.0.0 release

### Features

* prepare for first stable 1.0.0 release ([6236a5f](https://github.com/jmcombs/ynabro/commit/6236a5f73377cb1505fa8a974eddc50c7dcbf1aa))


### Bug Fixes

* correct Release Please config for root package and add sequential-calls ([80d41b3](https://github.com/jmcombs/ynabro/commit/80d41b39e474dde703750d34a8047f4d2d4aee31))


### Code Refactoring

* move ynabro core package to packages/ynabro/ ([72f0a46](https://github.com/jmcombs/ynabro/commit/72f0a4695e9651344c16d55f24a9cabe0d311476))

## [1.0.0](https://github.com/jmcombs/ynabro/compare/ynabro/v0.0.4...ynabro/v1.0.0) (2026-05-16)


### ⚠ BREAKING CHANGES

* First stable 1.0.0 release of ynabro and pi-ynabro
* First stable 1.0.0 release of ynabro and pi-ynabro
* First stable release of ynabro and pi-ynabro
* First stable 1.0.0 release of ynabro and pi-ynabro
* Initial stable release of ynabro and pi-ynabro
* prepare for first stable 1.0.0 release

### Features

* add onboarding, per-skill state management, and core skill ([22f7e60](https://github.com/jmcombs/ynabro/commit/22f7e60bbea2f344a58e7b3cfa86d4f273b401e7))
* initial release preparation - onboarding, state management, and core skill ([6117db6](https://github.com/jmcombs/ynabro/commit/6117db645201186fecaf7188a8341b6fa19e537a))
* initial release v1.0.0 - ynabro and pi-ynabro ([d509212](https://github.com/jmcombs/ynabro/commit/d509212a7064956ed27eb86ede578ac52b7455eb))
* initial stable release ([c0cdb20](https://github.com/jmcombs/ynabro/commit/c0cdb20bf4c824f67ff2b1051046f17e411825af))
* prepare for first stable 1.0.0 release ([6236a5f](https://github.com/jmcombs/ynabro/commit/6236a5f73377cb1505fa8a974eddc50c7dcbf1aa))
* reset manifest for clean 1.0.0 release ([d3e2116](https://github.com/jmcombs/ynabro/commit/d3e2116ac30e65721ecbe38f9e3d8571382cb0db))
* upgrade npm for OIDC trusted publishing support ([6952edb](https://github.com/jmcombs/ynabro/commit/6952edb66c499ff561efd3396143d2e7d985a061))
* use Node 24 for OIDC trusted publishing (npm 11.x required) ([8ecf681](https://github.com/jmcombs/ynabro/commit/8ecf681a1c36da92eea3165fc8e96238fdd3e25d))
* v1 release preparation (ynabro + pi-ynabro) ([6cc4235](https://github.com/jmcombs/ynabro/commit/6cc4235ae1f5074e876e13e2278a01065d7d6a2a))
* v1.0.0 stable release ([6889c8e](https://github.com/jmcombs/ynabro/commit/6889c8e2709851e00fbfa405b116d596ae8b0050))


### Bug Fixes

* correct Release Please config for root package and add sequential-calls ([80d41b3](https://github.com/jmcombs/ynabro/commit/80d41b39e474dde703750d34a8047f4d2d4aee31))
* correct skill copy path in release workflow ([b57af18](https://github.com/jmcombs/ynabro/commit/b57af1845890bad3eef9e265be87ddba57abc917))
* remove duplicate CI trigger on main push ([71bc7d4](https://github.com/jmcombs/ynabro/commit/71bc7d41d245c9b88c7ffba305668818f8222fc3))
* update Release Please matrix generation to use dynamic config ([8e7f662](https://github.com/jmcombs/ynabro/commit/8e7f662e1fd449ca70d5b1403fff606f680c8962))

## [1.0.0](https://github.com/jmcombs/ynabro/compare/ynabro/v0.0.4...ynabro/v1.0.0) (2026-05-16)


### ⚠ BREAKING CHANGES

* First stable 1.0.0 release of ynabro and pi-ynabro
* First stable release of ynabro and pi-ynabro
* First stable 1.0.0 release of ynabro and pi-ynabro
* Initial stable release of ynabro and pi-ynabro
* prepare for first stable 1.0.0 release

### Features

* add onboarding, per-skill state management, and core skill ([22f7e60](https://github.com/jmcombs/ynabro/commit/22f7e60bbea2f344a58e7b3cfa86d4f273b401e7))
* initial release preparation - onboarding, state management, and core skill ([6117db6](https://github.com/jmcombs/ynabro/commit/6117db645201186fecaf7188a8341b6fa19e537a))
* initial release v1.0.0 - ynabro and pi-ynabro ([d509212](https://github.com/jmcombs/ynabro/commit/d509212a7064956ed27eb86ede578ac52b7455eb))
* initial stable release ([c0cdb20](https://github.com/jmcombs/ynabro/commit/c0cdb20bf4c824f67ff2b1051046f17e411825af))
* prepare for first stable 1.0.0 release ([6236a5f](https://github.com/jmcombs/ynabro/commit/6236a5f73377cb1505fa8a974eddc50c7dcbf1aa))
* reset manifest for clean 1.0.0 release ([d3e2116](https://github.com/jmcombs/ynabro/commit/d3e2116ac30e65721ecbe38f9e3d8571382cb0db))
* upgrade npm for OIDC trusted publishing support ([6952edb](https://github.com/jmcombs/ynabro/commit/6952edb66c499ff561efd3396143d2e7d985a061))
* v1 release preparation (ynabro + pi-ynabro) ([6cc4235](https://github.com/jmcombs/ynabro/commit/6cc4235ae1f5074e876e13e2278a01065d7d6a2a))
* v1.0.0 stable release ([6889c8e](https://github.com/jmcombs/ynabro/commit/6889c8e2709851e00fbfa405b116d596ae8b0050))


### Bug Fixes

* correct Release Please config for root package and add sequential-calls ([80d41b3](https://github.com/jmcombs/ynabro/commit/80d41b39e474dde703750d34a8047f4d2d4aee31))
* correct skill copy path in release workflow ([b57af18](https://github.com/jmcombs/ynabro/commit/b57af1845890bad3eef9e265be87ddba57abc917))
* remove duplicate CI trigger on main push ([71bc7d4](https://github.com/jmcombs/ynabro/commit/71bc7d41d245c9b88c7ffba305668818f8222fc3))
* update Release Please matrix generation to use dynamic config ([8e7f662](https://github.com/jmcombs/ynabro/commit/8e7f662e1fd449ca70d5b1403fff606f680c8962))

## [1.0.0](https://github.com/jmcombs/ynabro/compare/ynabro/v0.0.4...ynabro/v1.0.0) (2026-05-16)


### ⚠ BREAKING CHANGES

* First stable 1.0.0 release of ynabro and pi-ynabro
* Initial stable release of ynabro and pi-ynabro
* prepare for first stable 1.0.0 release

### Features

* add onboarding, per-skill state management, and core skill ([22f7e60](https://github.com/jmcombs/ynabro/commit/22f7e60bbea2f344a58e7b3cfa86d4f273b401e7))
* initial release preparation - onboarding, state management, and core skill ([6117db6](https://github.com/jmcombs/ynabro/commit/6117db645201186fecaf7188a8341b6fa19e537a))
* initial release v1.0.0 - ynabro and pi-ynabro ([d509212](https://github.com/jmcombs/ynabro/commit/d509212a7064956ed27eb86ede578ac52b7455eb))
* initial stable release ([c0cdb20](https://github.com/jmcombs/ynabro/commit/c0cdb20bf4c824f67ff2b1051046f17e411825af))
* prepare for first stable 1.0.0 release ([6236a5f](https://github.com/jmcombs/ynabro/commit/6236a5f73377cb1505fa8a974eddc50c7dcbf1aa))
* reset manifest for clean 1.0.0 release ([d3e2116](https://github.com/jmcombs/ynabro/commit/d3e2116ac30e65721ecbe38f9e3d8571382cb0db))
* v1 release preparation (ynabro + pi-ynabro) ([6cc4235](https://github.com/jmcombs/ynabro/commit/6cc4235ae1f5074e876e13e2278a01065d7d6a2a))


### Bug Fixes

* correct Release Please config for root package and add sequential-calls ([80d41b3](https://github.com/jmcombs/ynabro/commit/80d41b39e474dde703750d34a8047f4d2d4aee31))
* correct skill copy path in release workflow ([b57af18](https://github.com/jmcombs/ynabro/commit/b57af1845890bad3eef9e265be87ddba57abc917))
* remove duplicate CI trigger on main push ([71bc7d4](https://github.com/jmcombs/ynabro/commit/71bc7d41d245c9b88c7ffba305668818f8222fc3))
* update Release Please matrix generation to use dynamic config ([8e7f662](https://github.com/jmcombs/ynabro/commit/8e7f662e1fd449ca70d5b1403fff606f680c8962))

## [1.0.0](https://github.com/jmcombs/ynabro/compare/ynabro/v0.0.4...ynabro/v1.0.0) (2026-05-16)


### ⚠ BREAKING CHANGES

* prepare for first stable 1.0.0 release

### Features

* add onboarding, per-skill state management, and core skill ([22f7e60](https://github.com/jmcombs/ynabro/commit/22f7e60bbea2f344a58e7b3cfa86d4f273b401e7))
* initial release preparation - onboarding, state management, and core skill ([6117db6](https://github.com/jmcombs/ynabro/commit/6117db645201186fecaf7188a8341b6fa19e537a))
* initial release v1.0.0 - ynabro and pi-ynabro ([d509212](https://github.com/jmcombs/ynabro/commit/d509212a7064956ed27eb86ede578ac52b7455eb))
* prepare for first stable 1.0.0 release ([6236a5f](https://github.com/jmcombs/ynabro/commit/6236a5f73377cb1505fa8a974eddc50c7dcbf1aa))
* v1 release preparation (ynabro + pi-ynabro) ([6cc4235](https://github.com/jmcombs/ynabro/commit/6cc4235ae1f5074e876e13e2278a01065d7d6a2a))


### Bug Fixes

* correct Release Please config for root package and add sequential-calls ([80d41b3](https://github.com/jmcombs/ynabro/commit/80d41b39e474dde703750d34a8047f4d2d4aee31))
* remove duplicate CI trigger on main push ([71bc7d4](https://github.com/jmcombs/ynabro/commit/71bc7d41d245c9b88c7ffba305668818f8222fc3))
* update Release Please matrix generation to use dynamic config ([8e7f662](https://github.com/jmcombs/ynabro/commit/8e7f662e1fd449ca70d5b1403fff606f680c8962))

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
