import { describe, expect, it } from "vitest";
import { NormalizedCache } from "../../src/cache";

describe("NormalizedCache", () => {
  it("stores and retrieves plain values", () => {
    const cache = new NormalizedCache();
    cache.set("key", { value: 42 });
    expect(cache.get("key")).toEqual({ value: 42 });
  });

  it("normalizes and merges entities with id and __typename", () => {
    const cache = new NormalizedCache();

    cache.set("query1", {
      anime: {
        __typename: "Media",
        id: 1,
        title: "Cowboy Bebop",
      },
    });

    expect(cache.stats.entitiesCount).toBe(1);

    cache.set("query2", {
      search: {
        __typename: "Media",
        id: 1,
        episodes: 26,
      },
    });

    // query1 should now have the episodes field because they share the same entity
    expect(cache.get<{ anime: Record<string, unknown> }>("query1")?.anime).toEqual({
      __typename: "Media",
      id: 1,
      title: "Cowboy Bebop",
      episodes: 26,
    });
  });

  it("handles arrays of entities", () => {
    const cache = new NormalizedCache();
    cache.set("query", {
      list: [
        { __typename: "Character", id: 10, name: "Spike" },
        { __typename: "Character", id: 11, name: "Faye" },
      ],
    });

    expect(cache.stats.entitiesCount).toBe(2);
    expect(cache.get("query")).toEqual({
      list: [
        { __typename: "Character", id: 10, name: "Spike" },
        { __typename: "Character", id: 11, name: "Faye" },
      ],
    });
  });

  it("handles circular references gracefully", () => {
    const cache = new NormalizedCache();

    // Simulate a GraphQL response with a circular reference
    // In reality JSON.stringify would fail on this before it gets to the cache if it was real circular,
    // but NormalizedCache handles __ref cycles during denormalization
    const media: Record<string, unknown> = { __typename: "Media", id: 1, characters: [] };
    const char = { __typename: "Character", id: 10, media: media };
    (media.characters as Record<string, unknown>[]).push(char);

    cache.set("query", media);

    const result = cache.get<{ __typename: string; characters: { __typename: string; media: unknown }[] }>("query");

    // It should denormalize the first level and return null for the cycle to prevent infinite loops
    expect(result?.__typename).toBe("Media");
    expect(result?.characters[0].__typename).toBe("Character");
    expect(result?.characters[0].media).toBeNull();
  });

  it("returns undefined if an entity goes missing", () => {
    const cache = new NormalizedCache();
    cache.set("query", {
      anime: { __typename: "Media", id: 1, title: "Test" },
    });

    // Manually break the cache
    cache.clear();
    cache.set("query", { __ref: "Media:1" }); // Fake a broken query

    expect(cache.get("query")).toBeUndefined();
  });

  it("uses LRU eviction", () => {
    const cache = new NormalizedCache({ maxSize: 2 });
    cache.set("a", 1);
    cache.set("b", 2);
    cache.get("a"); // bump a
    cache.set("c", 3); // should evict b

    expect(cache.get("a")).toBe(1);
    expect(cache.get("b")).toBeUndefined();
    expect(cache.get("c")).toBe(3);
  });

  it("expires entries after TTL", async () => {
    const cache = new NormalizedCache({ ttl: 50 });
    cache.set("k", "v");
    expect(cache.get("k")).toBe("v");

    await new Promise((r) => setTimeout(r, 80));
    expect(cache.get("k")).toBeUndefined();
  });

  it("handles staleWhileRevalidateMs", async () => {
    const cache = new NormalizedCache({ ttl: 50, staleWhileRevalidateMs: 100 });
    cache.set("k", "v");

    await new Promise((r) => setTimeout(r, 80));

    const meta = cache.getWithMeta("k");
    expect(meta?.data).toBe("v");
    expect(meta?.stale).toBe(true);
  });

  it("does nothing when disabled", () => {
    const cache = new NormalizedCache({ enabled: false });
    cache.set("k", "v");
    expect(cache.get("k")).toBeUndefined();
    expect(cache.getWithMeta("k")).toBeUndefined();
  });

  it("clears and returns stats", () => {
    const cache = new NormalizedCache();
    cache.set("k", "v");
    cache.get("k");
    cache.get("missing");

    const stats = cache.stats;
    expect(stats.hits).toBe(1);
    expect(stats.misses).toBe(1);

    cache.resetStats();
    expect(cache.stats.hits).toBe(0);

    cache.clear();
    expect(cache.size).toBe(0);
  });

  it("returns keys", () => {
    const cache = new NormalizedCache();
    cache.set("k1", "v");
    expect(cache.keys()).toEqual(["k1"]);
  });

  it("invalidates by pattern", () => {
    const cache = new NormalizedCache();
    cache.set("media:1", "v");
    cache.set("user:1", "v");

    const removed = cache.invalidate(/^media/);
    expect(removed).toBe(1);
    expect(cache.get("media:1")).toBeUndefined();
    expect(cache.get("user:1")).toBe("v");

    cache.invalidate("user");
    expect(cache.get("user:1")).toBeUndefined();
  });

  it("deletes by key", () => {
    const cache = new NormalizedCache();
    cache.set("k", "v");
    cache.delete("k");
    expect(cache.get("k")).toBeUndefined();
  });
});
