import fs from "node:fs";
import path from "node:path";
import type { CacheStore } from "./CacheStore.js";

const CACHE_DIR = ".ynabro/cache";

interface CacheEntry<T> {
  value: T;
  expiresAt: number;
}

function ensureCacheDir() {
  if (!fs.existsSync(CACHE_DIR)) {
    fs.mkdirSync(CACHE_DIR, { recursive: true });
  }
}

function getCachePath(key: string): string {
  // Sanitize key for filesystem
  const safeKey = key.replace(/[^a-zA-Z0-9_-]/g, "_");
  return path.join(CACHE_DIR, `${safeKey}.json`);
}

/**
 * File-based cache implementation.
 * Portable across different agents (Pi, OpenClaw, etc.) running on the same host.
 */
export class FileBasedCache implements CacheStore {
  async get<T>(key: string): Promise<T | undefined> {
    const filePath = getCachePath(key);
    if (!fs.existsSync(filePath)) return undefined;

    try {
      const raw = fs.readFileSync(filePath, "utf-8");
      const entry: CacheEntry<T> = JSON.parse(raw);
      if (Date.now() > entry.expiresAt) {
        fs.unlinkSync(filePath);
        return undefined;
      }
      return entry.value;
    } catch {
      return undefined;
    }
  }

  async set<T>(key: string, value: T, ttlMs: number): Promise<void> {
    ensureCacheDir();
    const filePath = getCachePath(key);
    const entry: CacheEntry<T> = {
      value,
      expiresAt: Date.now() + ttlMs,
    };
    fs.writeFileSync(filePath, JSON.stringify(entry, null, 2));
  }

  async delete(key: string): Promise<void> {
    const filePath = getCachePath(key);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  }

  async clear(): Promise<void> {
    if (fs.existsSync(CACHE_DIR)) {
      const files = fs.readdirSync(CACHE_DIR);
      for (const file of files) {
        fs.unlinkSync(path.join(CACHE_DIR, file));
      }
    }
  }
}
