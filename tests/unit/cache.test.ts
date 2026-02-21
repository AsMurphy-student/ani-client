import { describe, expect, it } from "vitest";
import { MemoryCache } from "../../src/cache";

describe("MemoryCache", () => {
  it("stores and retrieves values", () => {
    const cache = new MemoryCache();
    cache.set("key", { value: 42 });
    expect(cache.get("key")).toEqual({ value: 42 });
  });

  it("returns undefined for missing keys", () => {
    const cache = new MemoryCache();
    expect(cache.get("missing")).toBeUndefined();
  });

  it("uses LRU eviction (not FIFO)", () => {
    const cache = new MemoryCache({ maxSize: 3 });
    cache.set("a", 1);
    cache.set("b", 2);
    cache.set("c", 3);

    // Access "a" to promote it to most-recently-used
    cache.get("a");

    // Insert "d" — should evict "b" (least recently used), NOT "a"
    cache.set("d", 4);

    expect(cache.get("a")).toBe(1); // still alive — was promoted
    expect(cache.get("b")).toBeUndefined(); // evicted (LRU)
    expect(cache.get("c")).toBe(3);
    expect(cache.get("d")).toBe(4);
  });

  it("updates position on set() for existing key", () => {
    const cache = new MemoryCache({ maxSize: 3 });
    cache.set("a", 1);
    cache.set("b", 2);
    cache.set("c", 3);

    // Re-set "a" to move it to end
    cache.set("a", 10);

    // Insert "d" — should evict "b" (now the LRU)
    cache.set("d", 4);

    expect(cache.get("a")).toBe(10);
    expect(cache.get("b")).toBeUndefined();
    expect(cache.get("c")).toBe(3);
    expect(cache.get("d")).toBe(4);
  });

  it("invalidates by regex pattern", () => {
    const cache = new MemoryCache();
    cache.set("media:1", { id: 1 });
    cache.set("media:2", { id: 2 });
    cache.set("character:1", { id: 1 });

    const removed = cache.invalidate(/^media:/);
    expect(removed).toBe(2);
    expect(cache.size).toBe(1);
    expect(cache.get("character:1")).toEqual({ id: 1 });
  });

  it("invalidates by string pattern (converted to RegExp)", () => {
    const cache = new MemoryCache();
    cache.set("media:1", { id: 1 });
    cache.set("media:2", { id: 2 });

    const removed = cache.invalidate("media:");
    expect(removed).toBe(2);
    expect(cache.size).toBe(0);
  });

  it("expires entries after TTL", async () => {
    const cache = new MemoryCache({ ttl: 50 });
    cache.set("key", "value");
    expect(cache.get("key")).toBe("value");

    await new Promise((r) => setTimeout(r, 80));
    expect(cache.get("key")).toBeUndefined();
  });

  it("does nothing when disabled", () => {
    const cache = new MemoryCache({ enabled: false });
    cache.set("key", "value");
    expect(cache.get("key")).toBeUndefined();
    expect(cache.size).toBe(0);
  });

  it("returns all keys", () => {
    const cache = new MemoryCache();
    cache.set("a", 1);
    cache.set("b", 2);

    const keys = [...cache.keys()];
    expect(keys).toEqual(["a", "b"]);
  });

  it("generates deterministic cache keys", () => {
    const k1 = MemoryCache.key("query { Media }", { id: 1, type: "ANIME" });
    const k2 = MemoryCache.key("query { Media }", { type: "ANIME", id: 1 });
    expect(k1).toBe(k2);
  });
});
