# Changelog

## [2.2.11](https://github.com/jmcombs/ynabro/compare/openclaw-ynabro/v2.2.10...openclaw-ynabro/v2.2.11) (2026-05-17)


### Performance Improvements

* **openclaw-ynabro:** skip redundant getPlans() fetch in ynabro_save_default_plan ([cf83634](https://github.com/jmcombs/ynabro/commit/cf8363456a4f94402a06d696171f4c8cf764bd8b))
* **ynabro:** make plans optional in setupYnab to avoid redundant getPlans fetch ([9a4f4bc](https://github.com/jmcombs/ynabro/commit/9a4f4bc7acd1f365e288d649a8a8d13848703420))

## [2.2.10](https://github.com/jmcombs/ynabro/compare/openclaw-ynabro/v2.2.9...openclaw-ynabro/v2.2.10) (2026-05-17)


### Bug Fixes

* **openclaw-ynabro:** tools not registering in OpenClaw ([#66](https://github.com/jmcombs/ynabro/issues/66)) ([fdc495e](https://github.com/jmcombs/ynabro/commit/fdc495e82ba8c6ef17a42137106b2ede5559dcb7))

## [2.2.9](https://github.com/jmcombs/ynabro/compare/openclaw-ynabro/v2.2.8...openclaw-ynabro/v2.2.9) (2026-05-17)


### Bug Fixes

* **openclaw-ynabro:** add pluginConfigSchema so register() is called and tools appear in toolNames ([#63](https://github.com/jmcombs/ynabro/issues/63)) ([aca1a0f](https://github.com/jmcombs/ynabro/commit/aca1a0fdaa51c254dbb0c42b4edfcb37181db8ff))

## [2.2.8](https://github.com/jmcombs/ynabro/compare/openclaw-ynabro/v2.2.7...openclaw-ynabro/v2.2.8) (2026-05-17)


### Bug Fixes

* **openclaw-ynabro:** inline plugin-sdk helpers to survive installer's "Repaired stale openclaw peer dependency" step ([#60](https://github.com/jmcombs/ynabro/issues/60)) ([01fdefa](https://github.com/jmcombs/ynabro/commit/01fdefa1dbd436a3b15c37f3eacf0a0160810ab2))

## [2.2.7](https://github.com/jmcombs/ynabro/compare/openclaw-ynabro/v2.2.6...openclaw-ynabro/v2.2.7) (2026-05-17)


### Bug Fixes

* **openclaw-ynabro:** move openclaw to dependencies so SDK imports resolve at runtime ([#58](https://github.com/jmcombs/ynabro/issues/58)) ([c1bff16](https://github.com/jmcombs/ynabro/commit/c1bff1640eef9ae9986e0d7cf5b15ce81486731b))

## [2.2.6](https://github.com/jmcombs/ynabro/compare/openclaw-ynabro/v2.2.5...openclaw-ynabro/v2.2.6) (2026-05-17)


### Bug Fixes

* **openclaw-ynabro:** accept SecretRef objects in configSchema.token ([#56](https://github.com/jmcombs/ynabro/issues/56)) ([421c390](https://github.com/jmcombs/ynabro/commit/421c3902a99fd607d14b200b3a754ff843ef3acf)), closes [#52](https://github.com/jmcombs/ynabro/issues/52)

## [2.2.5](https://github.com/jmcombs/ynabro/compare/openclaw-ynabro/v2.2.4...openclaw-ynabro/v2.2.5) (2026-05-17)


### Bug Fixes

* **openclaw-ynabro:** integrate with OpenClaw secrets system for YNAB token ([#53](https://github.com/jmcombs/ynabro/issues/53)) ([abbb62c](https://github.com/jmcombs/ynabro/commit/abbb62cd2c80926ff29366f92fca9ae2a4192bae)), closes [#52](https://github.com/jmcombs/ynabro/issues/52)

## [2.2.4](https://github.com/jmcombs/ynabro/compare/openclaw-ynabro/v2.2.3...openclaw-ynabro/v2.2.4) (2026-05-17)


### Bug Fixes

* replace file: workspace refs with version specs; catch in CI ([072eb92](https://github.com/jmcombs/ynabro/commit/072eb92bd5b77b877b5fa00e61b78c6ac0c35855))
* replace file: workspace refs with version specs; catch in CI ([3256999](https://github.com/jmcombs/ynabro/commit/325699908ed373f612512b2a2d494e3bae666481))

## [2.2.3](https://github.com/jmcombs/ynabro/compare/openclaw-ynabro/v2.2.2...openclaw-ynabro/v2.2.3) (2026-05-17)


### Bug Fixes

* **openclaw-ynabro:** move @sinclair/typebox to dependencies ([5b90613](https://github.com/jmcombs/ynabro/commit/5b90613a14fb62f894dba12281d9a8ae20c09b63))
* **openclaw-ynabro:** move @sinclair/typebox to dependencies + add install CI ([df982b9](https://github.com/jmcombs/ynabro/commit/df982b9a70f1ef2f4b649f8786bf3cc25b36dd5b))

## [2.2.2](https://github.com/jmcombs/ynabro/compare/openclaw-ynabro/v2.2.1...openclaw-ynabro/v2.2.2) (2026-05-17)


### Bug Fixes

* **openclaw-ynabro:** revert hooks -&gt; extensions for plugin entry point ([f4673f7](https://github.com/jmcombs/ynabro/commit/f4673f70b0477d1df8c7d1b8a5c1b2624bf20f1d))
* **openclaw-ynabro:** revert hooks -&gt; extensions for plugin entry point ([dcfda00](https://github.com/jmcombs/ynabro/commit/dcfda00c6cac4c4ef2727b3588755c44b55577f6))

## [2.2.1](https://github.com/jmcombs/ynabro/compare/openclaw-ynabro/v2.2.0...openclaw-ynabro/v2.2.1) (2026-05-17)


### Bug Fixes

* **openclaw-ynabro:** add build step and fix openclaw.hooks entry point ([2a06ae1](https://github.com/jmcombs/ynabro/commit/2a06ae193f5ba6743495f244f5a320af0192a6b3))
* **openclaw-ynabro:** add build step and fix openclaw.hooks entry point ([fc7f878](https://github.com/jmcombs/ynabro/commit/fc7f87842b8a81dabc9d5b11e832b2d77cb2a6d1)), closes [#41](https://github.com/jmcombs/ynabro/issues/41)

## [2.2.0](https://github.com/jmcombs/ynabro/compare/openclaw-ynabro/v2.1.0...openclaw-ynabro/v2.2.0) (2026-05-17)


### Features

* **openclaw-ynabro:** add onboarding status tool and structured error handling ([aaf20ea](https://github.com/jmcombs/ynabro/commit/aaf20ea480d308091d0bab62ae70963cd1acfe95))
* unified onboarding flow with ynabro_onboarding_status tool ([9946b3b](https://github.com/jmcombs/ynabro/commit/9946b3ba6761c42f25b60779f5fb87f9ffaa01fa))

## [2.1.0](https://github.com/jmcombs/ynabro/compare/openclaw-ynabro/v2.0.0...openclaw-ynabro/v2.1.0) (2026-05-16)


### Features

* **openclaw-ynabro:** implement adapter and two-step setup flow ([94f96a5](https://github.com/jmcombs/ynabro/commit/94f96a596edb7d1af6142ae8b6f070dc56b7b0fe))
* **openclaw-ynabro:** integrate OpenClaw config for token resolution ([f2b5d88](https://github.com/jmcombs/ynabro/commit/f2b5d880af94215710d7ff6e0e9467f4f99ccb7d)), closes [#31](https://github.com/jmcombs/ynabro/issues/31)
* unify YNAB config adapter across all platform adapters ([98ce8d7](https://github.com/jmcombs/ynabro/commit/98ce8d7c784ec43650c8cefb1921bb4001d8c976))

## [2.0.0](https://github.com/jmcombs/ynabro/compare/openclaw-ynabro/v1.0.0...openclaw-ynabro/v2.0.0) (2026-05-16)


### ⚠ BREAKING CHANGES

* prepare for first stable 1.0.0 release

### Features

* add openclaw-ynabro adapter and register all tools in both adapters ([7f9c6e0](https://github.com/jmcombs/ynabro/commit/7f9c6e02d43b5a09fce89a635acf41ebaa170163))
* prepare for first stable 1.0.0 release ([6236a5f](https://github.com/jmcombs/ynabro/commit/6236a5f73377cb1505fa8a974eddc50c7dcbf1aa))
