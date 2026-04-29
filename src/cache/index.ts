import type { CacheAdapter, CacheOptions } from "../types";
import { normalizeQuery, sortObjectKeys } from "../utils";

/**
 * Simple in-memory cache with configurable TTL, LRU eviction, and optional stale-while-revalidate.
 * Used internally by AniListClient to avoid redundant API calls.
 */
export type { CacheOptions };

/** Cache performance statistics. */
export interface CacheStats {
  /** Total cache hits. */
  hits: number;
  /** Total cache misses. */
  misses: number;
  /** Stale entries returned (only with stale-while-revalidate). */
  stales: number;
  /** Hit rate as a ratio 0–1 (NaN if no requests yet). */
  hitRate: number;
}

interface CacheEntry<T> {
  data: T;
  expiresAt: number;
}

const ONE_DAY_MS = 24 * 60 * 60 * 1000;

export class MemoryCache implements CacheAdapter {
  private readonly ttl: number;
  private readonly maxSize: number;
  private readonly enabled: boolean;
  private readonly swrMs: number;
  private readonly store = new Map<string, CacheEntry<unknown>>();

  private _hits = 0;
  private _misses = 0;
  private _stales = 0;

  constructor(options: CacheOptions = {}) {
    this.ttl = options.ttl ?? ONE_DAY_MS;
    this.maxSize = options.maxSize ?? 500;
    this.enabled = options.enabled ?? true;
    this.swrMs = options.staleWhileRevalidateMs ?? 0;
  }

  /** Build a deterministic cache key from a query + variables pair. */
  static key(query: string, variables: Record<string, unknown>): string {
    const normalized = normalizeQuery(query);
    return `${normalized}|${JSON.stringify(sortObjectKeys(variables))}`;
  }

  /**
   * Retrieve a cached value, or `undefined` if missing / expired.
   * With stale-while-revalidate enabled, returns stale data within the grace window
   * and flags it so the caller can refresh in the background.
   */
  /**
   * Retrieve a cached value and its stale status.
   */
  getWithMeta<T>(key: string): { data: T; stale: boolean } | undefined {
    if (!this.enabled) return undefined;
    const entry = this.store.get(key);
    if (!entry) {
      this._misses++;
      return undefined;
    }
    const now = Date.now();
    if (now > entry.expiresAt) {
      if (this.swrMs > 0 && now <= entry.expiresAt + this.swrMs) {
        this.store.delete(key);
        this.store.set(key, entry);
        this._stales++;
        return { data: entry.data as T, stale: true };
      }
      this.store.delete(key);
      this._misses++;
      return undefined;
    }
    this.store.delete(key);
    this.store.set(key, entry);
    this._hits++;
    return { data: entry.data as T, stale: false };
  }

  get<T>(key: string): T | undefined {
    const res = this.getWithMeta<T>(key);
    return res ? res.data : undefined;
  }

  /** Store a value in the cache. */
  set<T>(key: string, data: T): void {
    if (!this.enabled) return;

    this.store.delete(key);

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

  /** Clear the entire cache and reset statistics. */
  clear(): void {
    this.store.clear();
    this._hits = 0;
    this._misses = 0;
    this._stales = 0;
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
   * Get cache performance statistics.
   *
   * @example
   * ```ts
   * const cache = new MemoryCache();
   * // ... after some usage ...
   * console.log(cache.stats);
   * // { hits: 42, misses: 8, stales: 0, hitRate: 0.84 }
   * ```
   */
  get stats(): CacheStats {
    const total = this._hits + this._misses + this._stales;
    return {
      hits: this._hits,
      misses: this._misses,
      stales: this._stales,
      hitRate: total === 0 ? Number.NaN : this._hits / total,
    };
  }

  /** Reset cache statistics without clearing stored data. */
  resetStats(): void {
    this._hits = 0;
    this._misses = 0;
    this._stales = 0;
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
