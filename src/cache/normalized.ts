import type { CacheAdapter, CacheOptions } from "../types";
import { normalizeQuery, sortObjectKeys } from "../utils";
import type { CacheStats } from "./index";

/**
 * Normalized Cache Adapter for AniListClient.
 *
 * This cache intercepts GraphQL responses, extracts objects with `__typename` and `id`,
 * and stores them flat in an entity store.
 * This ensures data consistency across all queries (e.g., `getMedia(1)` and `searchMedia`
 * share the exact same `Media` object).
 */
export class NormalizedCache implements CacheAdapter {
  private readonly ttl: number;
  private readonly maxSize: number;
  private readonly enabled: boolean;
  private readonly swrMs: number;

  private readonly queryStore = new Map<string, { data: unknown; expiresAt: number }>();
  private readonly entityStore = new Map<string, Record<string, unknown>>();

  private _hits = 0;
  private _misses = 0;
  private _stales = 0;

  constructor(options: CacheOptions = {}) {
    this.ttl = options.ttl ?? 24 * 60 * 60 * 1000;
    this.maxSize = options.maxSize ?? 500;
    this.enabled = options.enabled ?? true;
    this.swrMs = options.staleWhileRevalidateMs ?? 0;
  }

  static key(query: string, variables: Record<string, unknown>): string {
    const normalized = normalizeQuery(query);
    return `${normalized}|${JSON.stringify(sortObjectKeys(variables))}`;
  }

  /** Normalizes a GraphQL response, extracting entities and returning a tree of references. */
  private normalize(data: unknown): unknown {
    if (Array.isArray(data)) {
      return data.map((item) => this.normalize(item));
    }
    if (data !== null && typeof data === "object") {
      const obj = data as Record<string, unknown>;

      // If it's an entity with an ID and __typename
      if (typeof obj.__typename === "string" && (typeof obj.id === "number" || typeof obj.id === "string")) {
        const ref = `${obj.__typename}:${obj.id}`;

        const normalizedObj: Record<string, unknown> = {};
        for (const [k, v] of Object.entries(obj)) {
          normalizedObj[k] = this.normalize(v);
        }

        const existing = this.entityStore.get(ref) || {};
        // Merge the newly fetched fields with existing ones
        this.entityStore.set(ref, { ...existing, ...normalizedObj });

        return { __ref: ref };
      }

      // Plain object
      const result: Record<string, unknown> = {};
      for (const [k, v] of Object.entries(obj)) {
        result[k] = this.normalize(v);
      }
      return result;
    }
    return data;
  }

  /** Reconstructs a GraphQL response from references. */
  private denormalize(data: unknown, seen = new Set<string>()): unknown {
    if (Array.isArray(data)) {
      return data.map((item) => this.denormalize(item, seen));
    }
    if (data !== null && typeof data === "object") {
      const obj = data as Record<string, unknown>;

      if (typeof obj.__ref === "string") {
        const ref = obj.__ref;
        if (seen.has(ref)) {
          // Circular reference protection. We return a shallow un-expanded reference to break the cycle.
          return { __ref: ref };
        }
        seen.add(ref);
        const entity = this.entityStore.get(ref);
        if (!entity) return undefined; // Entity missing from cache

        const result = this.denormalize(entity, seen);
        seen.delete(ref);
        return result;
      }

      const result: Record<string, unknown> = {};
      for (const [k, v] of Object.entries(obj)) {
        const denormalized = this.denormalize(v, seen);
        if (denormalized === undefined) return undefined; // Missing nested reference
        result[k] = denormalized;
      }
      return result;
    }
    return data;
  }

  getWithMeta<T>(key: string): { data: T; stale: boolean } | undefined {
    if (!this.enabled) return undefined;
    const entry = this.queryStore.get(key);
    if (!entry) {
      this._misses++;
      return undefined;
    }

    const now = Date.now();
    let isStale = false;

    if (now > entry.expiresAt) {
      if (this.swrMs > 0 && now <= entry.expiresAt + this.swrMs) {
        isStale = true;
      } else {
        this.queryStore.delete(key);
        this._misses++;
        return undefined;
      }
    }

    // Denormalize the data
    const denormalized = this.denormalize(entry.data);
    if (denormalized === undefined) {
      // Something was missing in the entity store
      this.queryStore.delete(key);
      this._misses++;
      return undefined;
    }

    // Update LRU position
    this.queryStore.delete(key);
    this.queryStore.set(key, entry);

    if (isStale) {
      this._stales++;
    } else {
      this._hits++;
    }

    return { data: denormalized as T, stale: isStale };
  }

  get<T>(key: string): T | undefined {
    const res = this.getWithMeta<T>(key);
    return res ? res.data : undefined;
  }

  set<T>(key: string, data: T): void {
    if (!this.enabled) return;

    // Normalizing extracts entities to entityStore and replaces them with __ref
    const normalizedData = this.normalize(data);

    this.queryStore.delete(key);

    if (this.maxSize > 0 && this.queryStore.size >= this.maxSize) {
      const firstKey = this.queryStore.keys().next().value;
      if (firstKey !== undefined) this.queryStore.delete(firstKey);
    }

    this.queryStore.set(key, { data: normalizedData, expiresAt: Date.now() + this.ttl });
  }

  delete(key: string): boolean {
    return this.queryStore.delete(key);
  }

  clear(): void {
    this.queryStore.clear();
    this.entityStore.clear();
    this._hits = 0;
    this._misses = 0;
    this._stales = 0;
  }

  get size(): number {
    return this.queryStore.size;
  }

  keys(): string[] {
    return [...this.queryStore.keys()];
  }

  invalidate(pattern: string | RegExp): number {
    const test =
      typeof pattern === "string" ? (key: string) => key.includes(pattern) : (key: string) => pattern.test(key);
    const toDelete: string[] = [];
    for (const key of this.queryStore.keys()) {
      if (test(key)) toDelete.push(key);
    }
    for (const key of toDelete) this.queryStore.delete(key);
    return toDelete.length;
  }

  get stats(): CacheStats & { entitiesCount: number } {
    const total = this._hits + this._misses + this._stales;
    return {
      hits: this._hits,
      misses: this._misses,
      stales: this._stales,
      hitRate: total === 0 ? Number.NaN : this._hits / total,
      entitiesCount: this.entityStore.size,
    };
  }

  resetStats(): void {
    this._hits = 0;
    this._misses = 0;
    this._stales = 0;
  }
}
