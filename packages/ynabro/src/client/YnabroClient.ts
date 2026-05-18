import * as ynab from "ynab";
import type { YnabPlan, YnabTransaction } from "../types/ynab.js";
import type { CacheStore } from "./CacheStore.js";
import { InMemoryCache } from "./InMemoryCache.js";

const DEFAULT_TTL_MS = 5 * 60 * 1000; // 5 minutes
const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000; // 1 hour

interface RateLimitState {
  requests: number[];
}

/**
 * YnabroClient - Core wrapper around the official YNAB SDK.
 *
 * Provides a cleaner, more agent-friendly interface for common YNAB operations.
 * Handles authentication, caching, rate limit tracking, and batch operations.
 */
export class YnabroClient {
  private api: ynab.api;
  private cache: CacheStore;
  private token: string;
  private rateLimitState: RateLimitState = { requests: [] };

  /**
   * Creates a new YnabroClient instance.
   * @param token - YNAB Personal Access Token
   * @param cacheStore - Optional pluggable cache store for portability across agents
   */
  constructor(token: string, cacheStore?: CacheStore) {
    if (!token) {
      throw new Error("YNAB token is required");
    }
    this.token = token;
    this.api = new ynab.api(token);
    this.cache = cacheStore ?? new InMemoryCache();
  }

  /**
   * Returns current rate limit status (requests made in the last hour).
   */
  getRateLimitStatus(): { used: number; limit: number; remaining: number } {
    const now = Date.now();
    this.rateLimitState.requests = this.rateLimitState.requests.filter(
      (ts) => now - ts < RATE_LIMIT_WINDOW_MS,
    );
    const used = this.rateLimitState.requests.length;
    return {
      used,
      limit: 200,
      remaining: Math.max(0, 200 - used),
    };
  }

  private trackRequest(): void {
    const now = Date.now();
    this.rateLimitState.requests.push(now);
    this.rateLimitState.requests = this.rateLimitState.requests.filter(
      (ts) => now - ts < RATE_LIMIT_WINDOW_MS,
    );
  }

  /**
   * Wraps an API call with exponential backoff retry on 429 errors.
   */
  private async withRetry<T>(fn: () => Promise<T>, maxRetries = 3): Promise<T> {
    let attempt = 0;
    while (true) {
      try {
        this.trackRequest();
        return await fn();
      } catch (err: unknown) {
        const is429 =
          err instanceof Error &&
          (err.message.includes("429") ||
            err.message.includes("Too Many Requests"));
        if (is429 && attempt < maxRetries) {
          const delay = 2 ** attempt * 1000;
          await new Promise((r) => setTimeout(r, delay));
          attempt++;
          continue;
        }
        throw err;
      }
    }
  }

  private getCacheKey(method: string, ...args: unknown[]): string {
    return `${method}:${JSON.stringify(args)}`;
  }

  /**
   * Retrieves all plans (budgets) for the authenticated user.
   */
  async getPlans(): Promise<YnabPlan[]> {
    const key = this.getCacheKey("getPlans");
    const cached = await this.cache.get<YnabPlan[]>(key);
    if (cached) return cached;

    const response = await this.withRetry(() => this.api.plans.getPlans());
    const plans = response.data.plans as YnabPlan[];
    await this.cache.set(key, plans, DEFAULT_TTL_MS);
    return plans;
  }

  /**
   * Retrieves transactions for a specific plan.
   */
  async getTransactions(
    planId: string,
    options?: { type?: "uncategorized" | "all" },
  ): Promise<YnabTransaction[]> {
    const key = this.getCacheKey("getTransactions", planId, options);
    const cached = await this.cache.get<YnabTransaction[]>(key);
    if (cached) return cached;

    const response = await this.withRetry(() =>
      this.api.transactions.getTransactions(planId),
    );
    let txs = response.data.transactions as YnabTransaction[];

    if (options?.type === "uncategorized") {
      txs = txs.filter((t) => !t.approved);
    }
    await this.cache.set(key, txs, DEFAULT_TTL_MS);
    return txs;
  }

  /**
   * Updates a single transaction.
   */
  async updateTransaction(
    planId: string,
    transactionId: string,
    patch: { approved?: boolean },
  ): Promise<void> {
    await this.withRetry(() =>
      this.api.transactions.updateTransaction(planId, transactionId, {
        // biome-ignore lint/suspicious/noExplicitAny: Required due to incomplete YNAB SDK types
        transaction: patch as unknown as any,
      }),
    );
  }

  /**
   * Batch updates multiple transactions in a single API call.
   * Uses the YNAB PATCH /budgets/{plan_id}/transactions endpoint.
   */
  async batchUpdateTransactions(
    planId: string,
    updates: Array<{ id: string; approved?: boolean }>,
  ): Promise<void> {
    if (updates.length === 0) return;

    // Use direct fetch to call the batch endpoint since SDK may not expose it directly
    const url = `https://api.ynab.com/v1/budgets/${planId}/transactions`;
    const response = await this.withRetry(() =>
      fetch(url, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${this.token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          transactions: updates.map((u) => ({
            id: u.id,
            approved: u.approved,
          })),
        }),
      }),
    );

    if (!response.ok) {
      throw new Error(
        `Batch update failed: ${response.status} ${response.statusText}`,
      );
    }
  }

  /**
   * Clears the cache (useful for forcing fresh data).
   */
  async clearCache(): Promise<void> {
    await this.cache.clear();
  }
}
