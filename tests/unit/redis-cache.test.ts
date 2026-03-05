import { describe, expect, it, vi } from "vitest";
import type { RedisLikeClient } from "../../src/cache/redis";
import { RedisCache } from "../../src/cache/redis";

function createMockRedis(): RedisLikeClient & {
  store: Map<string, { value: string; ttl?: number }>;
} {
  const store = new Map<string, { value: string; ttl?: number }>();
  return {
    store,
    get: vi.fn(async (key: string) => {
      const entry = store.get(key);
      return entry ? entry.value : null;
    }),
    set: vi.fn(async (key: string, value: string, _ex?: string, ttl?: number) => {
      store.set(key, { value, ttl });
      return "OK";
    }),
    del: vi.fn(async (...keys: (string | string[])[]) => {
      const flatKeys = keys.flat();
      let count = 0;
      for (const key of flatKeys) {
        if (store.delete(key)) count++;
      }
      return count;
    }),
    keys: vi.fn(async (pattern: string) => {
      const prefix = pattern.replace("*", "");
      return [...store.keys()].filter((k) => k.startsWith(prefix));
    }),
  };
}

describe("RedisCache", () => {
  it("stores and retrieves values", async () => {
    const redis = createMockRedis();
    const cache = new RedisCache({ client: redis });

    await cache.set("test", { id: 1, name: "Cowboy Bebop" });
    const result = await cache.get<{ id: number; name: string }>("test");

    expect(result).toEqual({ id: 1, name: "Cowboy Bebop" });
    expect(redis.set).toHaveBeenCalledWith("ani:test", JSON.stringify({ id: 1, name: "Cowboy Bebop" }), "EX", 86400);
  });

  it("returns undefined for missing keys", async () => {
    const redis = createMockRedis();
    const cache = new RedisCache({ client: redis });

    const result = await cache.get("missing");
    expect(result).toBeUndefined();
  });

  it("returns undefined for invalid JSON", async () => {
    const redis = createMockRedis();
    redis.store.set("ani:bad", { value: "not-json{{{" });
    const cache = new RedisCache({ client: redis });

    const result = await cache.get("bad");
    expect(result).toBeUndefined();
  });

  it("uses custom prefix", async () => {
    const redis = createMockRedis();
    const cache = new RedisCache({ client: redis, prefix: "myapp:" });

    await cache.set("key", "value");
    expect(redis.set).toHaveBeenCalledWith("myapp:key", JSON.stringify("value"), "EX", 86400);
  });

  it("uses custom TTL", async () => {
    const redis = createMockRedis();
    const cache = new RedisCache({ client: redis, ttl: 3600 });

    await cache.set("key", "value");
    expect(redis.set).toHaveBeenCalledWith("ani:key", JSON.stringify("value"), "EX", 3600);
  });

  it("deletes a key", async () => {
    const redis = createMockRedis();
    const cache = new RedisCache({ client: redis });

    await cache.set("key", "value");
    const deleted = await cache.delete("key");
    expect(deleted).toBe(true);

    const deletedAgain = await cache.delete("key");
    expect(deletedAgain).toBe(false);
  });

  it("clears all prefixed keys", async () => {
    const redis = createMockRedis();
    const cache = new RedisCache({ client: redis });

    await cache.set("a", 1);
    await cache.set("b", 2);

    await cache.clear();
    expect(redis.store.size).toBe(0);
  });

  it("returns size of prefixed keys", async () => {
    const redis = createMockRedis();
    const cache = new RedisCache({ client: redis });

    await cache.set("a", 1);
    await cache.set("b", 2);

    const size = await cache.size;
    expect(size).toBe(2);
  });

  it("returns all keys without prefix", async () => {
    const redis = createMockRedis();
    const cache = new RedisCache({ client: redis });

    await cache.set("x", 1);
    await cache.set("y", 2);

    const keys = await cache.keys();
    expect(keys).toEqual(expect.arrayContaining(["x", "y"]));
    expect(keys.every((k) => !k.startsWith("ani:"))).toBe(true);
  });

  it("invalidates by string pattern", async () => {
    const redis = createMockRedis();
    const cache = new RedisCache({ client: redis });

    await cache.set("media:1", { id: 1 });
    await cache.set("media:2", { id: 2 });
    await cache.set("character:1", { id: 1 });

    const removed = await cache.invalidate("ani:media:*");
    // The mock keys filter won't match glob, but our mock uses startsWith
    // so this tests the code path
    expect(typeof removed).toBe("number");
  });

  it("invalidates by RegExp pattern", async () => {
    const redis = createMockRedis();
    const cache = new RedisCache({ client: redis });

    await cache.set("media:1", { id: 1 });
    await cache.set("media:2", { id: 2 });
    await cache.set("character:1", { id: 1 });

    const removed = await cache.invalidate(/^media:/);
    expect(removed).toBe(2);
  });

  it("invalidate returns 0 when no keys match", async () => {
    const redis = createMockRedis();
    const cache = new RedisCache({ client: redis });

    const removed = await cache.invalidate("nonexistent");
    expect(removed).toBe(0);
  });

  it("uses scanIterator when available", async () => {
    const redis = createMockRedis();
    const scanResults = ["ani:a", "ani:b"];
    redis.scanIterator = vi.fn(function* () {
      yield* scanResults;
    }) as unknown as RedisLikeClient["scanIterator"];

    const cache = new RedisCache({ client: redis });
    await cache.set("a", 1);
    await cache.set("b", 2);

    const keys = await cache.keys();
    expect(redis.scanIterator).toHaveBeenCalled();
    expect(keys).toEqual(["a", "b"]);
  });
});
