import type { CacheStore } from "./CacheStore.js";

interface CacheEntry<T> {
  value: T;
  expiresAt: number;
}

/**
 * In-memory cache implementation.
 * Fast but not portable across agent sessions.
 */
export class InMemoryCache implements CacheStore {
  private store = new Map<string, CacheEntry<unknown>>();

  async get<T>(key: string): Promise<T | undefined> {
    const entry = this.store.get(key);
    if (!entry) return undefined;
    if (Date.now() > entry.expiresAt) {
      this.store.delete(key);
      return undefined;
    }
    return entry.value as T;
  }

  async set<T>(key: string, value: T, ttlMs: number): Promise<void> {
    this.store.set(key, {
      value,
      expiresAt: Date.now() + ttlMs,
    });
  }

  async delete(key: string): Promise<void> {
    this.store.delete(key);
  }

  async clear(): Promise<void> {
    this.store.clear();
  }
}
