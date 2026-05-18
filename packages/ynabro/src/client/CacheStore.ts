/**
 * Interface for a pluggable cache store.
 * Allows YnabroClient to use different caching strategies (in-memory vs. file-based)
 * for portability across different agent environments.
 */
export interface CacheStore {
  get<T>(key: string): Promise<T | undefined>;
  set<T>(key: string, value: T, ttlMs: number): Promise<void>;
  delete(key: string): Promise<void>;
  clear(): Promise<void>;
}
