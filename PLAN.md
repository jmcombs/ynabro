# Remediation Plan: Optimizing YNABro for Rate Limit Management and Efficiency

## Context
The `packages/ynabro` package provides an interface for agents to interact with YNAB. However, it currently suffers from direct 1:1 mapping of agent actions to API calls. Specifically:
- **Inefficient Approvals**: Currently, approving a transaction requires one API call per transaction. For large batches (e.g., after a review), this can quickly exhaust the 200 requests/hour limit.
- **Redundant Requests**: There is no caching of frequently accessed data (plans, transactions, etc.), leading to redundant network calls if an agent performs multiple related tasks in one session.
- **Brittle Error Handling**: The current implementation doesn't explicitly handle the `429 Too Many Requests` error with any intelligence, making it fragile under high load or frequent use.

## Approach

### 1. Token & Call Efficiency (Batching)
We will implement batch processing for transaction updates. Instead of individual `PATCH`/`PUT` requests per transaction, we will leverage the YNAB API's ability to update multiple transactions in a single `PATCH /budgets/{plan_id}/transactions` request.

### 2. Caching Mechanism (Portable)
To reduce redundant calls and ensure efficiency across different agent environments (Pi, OpenClaw, etc.), we will implement a pluggable caching architecture.
- **Pluggable Cache Architecture**: `YnabroClient` will accept a `CacheStore` interface in its constructor. This allows agents to choose the appropriate level of persistence.
- **Implementations**:
  - `InMemoryCache`: A lightweight, fast, but non-portable cache (default).
  - `FileBasedCache`: A persistent, portable cache that stores data in `.ynabro/cache`. This allows multiple agents running on the same host to share cached YNAB data, significantly reducing redundant API calls across different agent sessions.
- **What to cache**: Results from `getPlans()`, `getTransactions(planId, options)`, and `getPlanInfo(planId)`. Cache entries will have a configurable TTL (e.g., 5 minutes).

### 3. Rate Limit Resilience & Proactive Tracking
We will implement intelligent handling of the YNAB rate limit (200 requests per hour).
- **Resilience**: Exponential backoff. When a `429 Too Many Requests` error is encountered, the client will wait for an increasing amount of time before retrying the request.
- **Proactive Tracking**: The `YnabroClient` will track the number of API requests made within a rolling 60-minute window and expose this tracking (e.g., through `getRateLimitStatus()`). This allows agents to be "aware" of their remaining budget and proactively slow down their activity before hitting the limit.

### 4. Tooling Enhancements
We will introduce a new high-level tool: `batchApproveTransactions`. This allows agents to approve multiple transactions at once after they have reviewed them, significantly reducing total API calls compared to calling `approveTransaction` repeatedly in a loop.

## Files to modify
- `packages/ynabro/src/client/YnabroClient.ts`: Implement caching (with pluggable store), retry logic, proactive request tracking, and batch update support.
- `packages/ynabro/src/tools/batchApproveTransactions.ts`: (New file) Implementation of the batch approval tool.
- `packages/ynabro/src/tools/index.ts`: Export the new `batchApproveTransactions` tool and a status tool if needed.
- `packages/ynabro/src/client/CacheStore.ts`: (New file) Interface for caching.
- `packages/ynabro/src/client/FileBasedCache.ts`: (New file) Portable file-based cache implementation.

## Reuse
- Use existing `YnabTransaction` and `YnabPlan` types from `../types/ynab.js`.
- Leverage the current `YnabroClient` infrastructure as the foundation for the new enhanced client.

## Steps
- [ ] **Step 1: Enhanced YnabroClient**
  - [ ] Create `CacheStore` interface and implementations (`InMemoryCache`, `FileBasedCache`).
  - [ ] Refactor `YnabroClient` to use a `cacheStore`.
  - [ ] Implement request tracking (rolling window) in `YnabroClient`.
  - [ ] Wrap API calls with an exponential backoff retry wrapper that catches 429 errors.
  - [ ] Add `batchUpdateTransactions(planId, updates[])` method to `YnabroClient`.
  - [ ] Add `getRateLimitStatus()` method to `YnabroClient`.
- [ ] **Step 2: New Batch Tool**
  - [ ] Implement `batchApproveTransactions` in a new file `packages/ynabro/src/tools/batchApproveTransactions.ts`.
  - [ ] Register the tool in `packages/ynabro/src/tools/index.ts`.
- [ ] **Step 3: Documentation Updates**
  - [ ] Update `packages/ynabro/README.md` to describe new capabilities.
  - [ ] Update `AGENTS.md` with instructions on using batch tools and being aware of rate limits.
  - [ ] Update `CONTRIBUTING.md` with explicit guidelines on how to adapt future functions to use the new pluggable-cache pattern and rate-limit tracking/throttling mechanisms.
  - [ ] Update `docs/ARCHITECTURE.md` to provide a clear architectural pattern guide so future developers can easily extend these optimizations (caching and rate limiting) to new features.
  - [ ] Update `docs/TOOLS.md` to include documentation for the new batch approval tool and any other updated tool interfaces.
- [ ] **Step 4: Verification**
  - [ ] Add unit tests for the cache (hits, misses, TTL) and its portability via custom stores.
  - [ ] Add unit tests for retry logic using mocked 429 responses.
  - [ ] Add unit tests for request tracking/throttling awareness.
  - [ ] Add integration test for batch approvals.
- [ ] **Step 5: GitHub Issues**
  - [ ] Open a GitHub issue for `openclaw-ynabro` describing that it needs to be updated to support the new pluggable caching and proactive rate limit tracking architecture. Include enough technical context so an agent can resolve it.
  - [ ] Open a GitHub issue for `pi-ynabro` describing similar requirements.

## Verification
### Unit Testing
- Verify that `getTransactions` returns cached data on subsequent calls within the TTL window and behaves correctly with different cache stores.
- Verify that after the TTL expires, a new API call is made.
- Mock a `429` response and verify that the client waits and retries correctly before succeeding or eventually giving up after max retries.
- Verify that `getRateLimitStatus()` accurately reflects requests made in the last hour.

### Integration Testing
- Simulate a sequence of tool calls (e.g., get pending -> batch approve) and monitor total number of network requests (mocked) to ensure they comply with the new efficient architecture (one PATCH instead of N PUTs).
- Verify that shared cache works between two `YnabroClient` instances using the same directory.

## Questions for User
None at this stage. The requirements are clear.
