import type { CacheAdapter, CacheOptions } from "../types";
import { normalizeQuery } from "../utils";

/**
 * Simple in-memory cache with configurable TTL.
 * Used internally by AniListClient to avoid redundant API calls.
 */
export type { CacheOptions };

interface CacheEntry<T> {
  data: T;
  expiresAt: number;
}

const ONE_DAY_MS = 24 * 60 * 60 * 1000;

export class MemoryCache implements CacheAdapter {
  private readonly ttl: number;
  private readonly maxSize: number;
  private readonly enabled: boolean;
  private readonly store = new Map<string, CacheEntry<unknown>>();

  constructor(options: CacheOptions = {}) {
    this.ttl = options.ttl ?? ONE_DAY_MS;
    this.maxSize = options.maxSize ?? 500;
    this.enabled = options.enabled ?? true;
  }

  /** Build a deterministic cache key from a query + variables pair. */
  static key(query: string, variables: Record<string, unknown>): string {
    const normalized = normalizeQuery(query);
    return `${normalized}|${JSON.stringify(variables, Object.keys(variables).sort())}`;
  }

  /** Retrieve a cached value, or `undefined` if missing / expired. */
  get<T>(key: string): T | undefined {
    if (!this.enabled) return undefined;
    const entry = this.store.get(key);
    if (!entry) return undefined;
    if (Date.now() > entry.expiresAt) {
      this.store.delete(key);
      return undefined;
    }
    // LRU: promote to most-recently-used by re-inserting at the end
    this.store.delete(key);
    this.store.set(key, entry);
    return entry.data as T;
  }

  /** Store a value in the cache. */
  set<T>(key: string, data: T): void {
    if (!this.enabled) return;

    // Remove first so re-insert places it at the end (MRU position)
    this.store.delete(key);

    // Evict least-recently-used entry if at capacity
    if (this.maxSize > 0 && this.store.size >= this.maxSize) {
      const firstKey = this.store.keys().next().value;
      if (firstKey !== undefined) this.store.delete(firstKey);
    }

    this.store.set(key, { data, expiresAt: Date.now() + this.ttl });
  }

  /** Remove a specific entry. */
  delete(key: string): boolean {
    return this.store.delete(key);
  }

  /** Clear the entire cache. */
  clear(): void {
    this.store.clear();
  }

  /** Number of entries currently stored. */
  get size(): number | Promise<number> {
    return this.store.size;
  }

  /** Return all cache keys. */
  keys(): string[] {
    return [...this.store.keys()];
  }

  /**
   * Remove all entries whose key matches the given pattern.
   *
   * - **String**: treated as a substring match (e.g. `"Media"` removes all keys containing `"Media"`).
   * - **RegExp**: tested against each key directly.
   *
   * @param pattern — A string (substring match) or RegExp.
   * @returns Number of entries removed.
   */
  invalidate(pattern: string | RegExp): number {
    const test =
      typeof pattern === "string" ? (key: string) => key.includes(pattern) : (key: string) => pattern.test(key);
    const toDelete: string[] = [];
    for (const key of this.store.keys()) {
      if (test(key)) toDelete.push(key);
    }
    for (const key of toDelete) this.store.delete(key);
    return toDelete.length;
  }
}
