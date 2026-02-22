import type { CacheAdapter } from "../types";

/**
 * Minimal interface representing a Redis client.
 * Compatible with both `ioredis` and `redis` (node-redis v4+).
 */
export interface RedisLikeClient {
  get(key: string): Promise<string | null>;
  set(key: string, value: string, ...args: unknown[]): Promise<unknown>;
  del(...keys: (string | string[])[]): Promise<number>;
  keys(pattern: string): Promise<string[]>;
  /** Optional SCAN-based iteration — used when available to avoid blocking the server. */
  scanIterator?(options: { MATCH: string; COUNT?: number }): AsyncIterable<string>;
}

export interface RedisCacheOptions {
  /** A Redis client instance (ioredis or node-redis). */
  client: RedisLikeClient;
  /** Key prefix to namespace ani-client entries (default: `"ani:"`) */
  prefix?: string;
  /** TTL in seconds (default: 86 400 = 24 h) */
  ttl?: number;
}

/**
 * Redis-backed cache adapter for AniListClient.
 *
 * @example
 * ```ts
 * import Redis from "ioredis";
 * import { AniListClient, RedisCache } from "ani-client";
 *
 * const redis = new Redis();
 * const client = new AniListClient({
 *   cacheAdapter: new RedisCache({ client: redis }),
 * });
 * ```
 */
export class RedisCache implements CacheAdapter {
  private readonly client: RedisLikeClient;
  private readonly prefix: string;
  private readonly ttl: number;

  constructor(options: RedisCacheOptions) {
    this.client = options.client;
    this.prefix = options.prefix ?? "ani:";
    this.ttl = options.ttl ?? 86_400;
  }

  private prefixedKey(key: string): string {
    return `${this.prefix}${key}`;
  }

  async get<T>(key: string): Promise<T | undefined> {
    const raw = await this.client.get(this.prefixedKey(key));
    if (raw === null) return undefined;
    try {
      return JSON.parse(raw) as T;
    } catch {
      return undefined;
    }
  }

  async set<T>(key: string, data: T): Promise<void> {
    await this.client.set(this.prefixedKey(key), JSON.stringify(data), "EX", this.ttl);
  }

  async delete(key: string): Promise<boolean> {
    const count = await this.client.del(this.prefixedKey(key));
    return count > 0;
  }

  /**
   * Collect keys matching a pattern. Uses SCAN when available, falls back to KEYS.
   *
   * **Warning:** The `KEYS` fallback is O(N) and blocks the Redis server.
   * Provide a client with `scanIterator` support for production use.
   * @internal
   */
  private async collectKeys(pattern: string): Promise<string[]> {
    if (this.client.scanIterator) {
      const keys: string[] = [];
      for await (const key of this.client.scanIterator({ MATCH: pattern, COUNT: 100 })) {
        keys.push(key);
      }
      return keys;
    }
    return this.client.keys(pattern);
  }

  async clear(): Promise<void> {
    const keys = await this.collectKeys(`${this.prefix}*`);
    if (keys.length > 0) {
      await this.client.del(...keys);
    }
  }

  /**
   * Returns -1 because Redis keys can expire silently via TTL.
   * Use `getSize()` for an accurate count.
   */
  get size(): number {
    return -1;
  }

  /** Get the actual number of keys with this prefix in Redis. */
  async getSize(): Promise<number> {
    const keys = await this.client.keys(`${this.prefix}*`);
    return keys.length;
  }

  async keys(): Promise<string[]> {
    const raw = await this.collectKeys(`${this.prefix}*`);
    return raw.map((k) => k.slice(this.prefix.length));
  }

  /**
   * Remove all entries whose key matches the given glob pattern.
   *
   * @param pattern — A glob pattern (e.g. `"*Media*"`)
   * @returns Number of entries removed.
   */
  async invalidate(pattern: string | RegExp): Promise<number> {
    if (typeof pattern === "string") {
      const keys = await this.collectKeys(`${this.prefix}${pattern}`);
      if (keys.length === 0) return 0;
      return this.client.del(...keys);
    }
    // RegExp: collect all keys and filter
    const allKeys = await this.collectKeys(`${this.prefix}*`);
    const matching = allKeys.filter((k) => pattern.test(k.slice(this.prefix.length)));
    if (matching.length === 0) return 0;
    return this.client.del(...matching);
  }
}
