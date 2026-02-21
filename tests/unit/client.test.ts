import { afterEach, describe, expect, it, vi } from "vitest";
import type { CacheAdapter } from "../../src";
import { AniListClient } from "../../src/client";

const mockMedia = {
  id: 1,
  title: { romaji: "Test Anime", english: null, native: null, userPreferred: null },
  type: "ANIME",
  format: null,
  status: null,
  description: null,
  startDate: null,
  endDate: null,
  season: null,
  seasonYear: null,
  episodes: null,
  duration: null,
  chapters: null,
  volumes: null,
  countryOfOrigin: null,
  isLicensed: null,
  source: null,
  hashtag: null,
  trailer: null,
  coverImage: { extraLarge: null, large: null, medium: null, color: null },
  bannerImage: null,
  genres: [],
  synonyms: [],
  averageScore: null,
  meanScore: null,
  popularity: null,
  favourites: null,
  trending: null,
  tags: [],
  studios: { nodes: [] },
  relations: null,
  isAdult: null,
  siteUrl: null,
};

function mockFetch(data: unknown) {
  globalThis.fetch = vi.fn(() =>
    Promise.resolve(
      new Response(JSON.stringify({ data }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }),
    ),
  );
}

describe("AniListClient", () => {
  const originalFetch = globalThis.fetch;

  afterEach(() => {
    globalThis.fetch = originalFetch;
  });

  // ── Request deduplication ──

  it("deduplicates identical in-flight requests", async () => {
    mockFetch({ Media: mockMedia });
    const client = new AniListClient({ cache: { enabled: false } });

    const [a, b] = await Promise.all([client.getMedia(1), client.getMedia(1)]);

    expect(a.id).toBe(b.id);
    expect(vi.mocked(fetch)).toHaveBeenCalledTimes(1);
  });

  it("does NOT deduplicate different requests", async () => {
    const m1 = { ...mockMedia, id: 1 };
    const m2 = { ...mockMedia, id: 2, title: { ...mockMedia.title, romaji: "Other" } };

    let calls = 0;
    globalThis.fetch = vi.fn(() => {
      calls++;
      const media = calls === 1 ? m1 : m2;
      return Promise.resolve(new Response(JSON.stringify({ data: { Media: media } }), { status: 200 }));
    });

    const client = new AniListClient({ cache: { enabled: false } });
    const [a, b] = await Promise.all([client.getMedia(1), client.getMedia(2)]);

    expect(a.id).toBe(1);
    expect(b.id).toBe(2);
    expect(vi.mocked(fetch)).toHaveBeenCalledTimes(2);
  });

  // ── Hooks ──

  it("fires onRequest and onResponse hooks", async () => {
    mockFetch({ Media: mockMedia });

    const onRequest = vi.fn();
    const onResponse = vi.fn();

    const client = new AniListClient({
      cache: { enabled: false },
      hooks: { onRequest, onResponse },
    });

    await client.getMedia(1);

    expect(onRequest).toHaveBeenCalledOnce();
    expect(onResponse).toHaveBeenCalledOnce();
    expect(onResponse.mock.calls[0][2]).toBe(false); // fromCache = false
  });

  it("fires onCacheHit on cached response", async () => {
    mockFetch({ Media: mockMedia });

    const onCacheHit = vi.fn();
    const onResponse = vi.fn();
    const client = new AniListClient({ hooks: { onCacheHit, onResponse } });

    await client.getMedia(1); // miss
    expect(onCacheHit).not.toHaveBeenCalled();

    await client.getMedia(1); // hit
    expect(onCacheHit).toHaveBeenCalledOnce();
    expect(onResponse).toHaveBeenCalledTimes(2);
    // Second call should report fromCache = true
    expect(onResponse.mock.calls[1][2]).toBe(true);
  });

  // ── Batch queries ──

  it("batch fetches multiple media in one request", async () => {
    const m0 = { ...mockMedia, id: 1 };
    const m1 = { ...mockMedia, id: 20, title: { ...mockMedia.title, romaji: "Naruto" } };

    globalThis.fetch = vi.fn(() =>
      Promise.resolve(
        new Response(JSON.stringify({ data: { m0, m1 } }), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        }),
      ),
    );

    const client = new AniListClient({ cache: { enabled: false } });
    const results = await client.getMediaBatch([1, 20]);

    expect(results).toHaveLength(2);
    expect(results[0].id).toBe(1);
    expect(results[1].id).toBe(20);
    expect(vi.mocked(fetch)).toHaveBeenCalledTimes(1);
  });

  it("getMediaBatch with single ID falls back to getMedia", async () => {
    mockFetch({ Media: mockMedia });

    const client = new AniListClient({ cache: { enabled: false } });
    const results = await client.getMediaBatch([1]);

    expect(results).toHaveLength(1);
    expect(results[0].id).toBe(1);
  });

  it("getMediaBatch with empty array returns empty", async () => {
    const client = new AniListClient({ cache: { enabled: false } });
    const results = await client.getMediaBatch([]);
    expect(results).toHaveLength(0);
  });

  // ── Cache management ──

  it("invalidateCache removes matching entries", async () => {
    mockFetch({ Media: mockMedia });
    const client = new AniListClient();

    await client.getMedia(1);
    expect(client.cacheSize).toBeGreaterThan(0);

    const removed = await client.invalidateCache(/./);
    expect(removed).toBeGreaterThan(0);
    expect(client.cacheSize).toBe(0);
  });

  it("clearCache empties the cache", async () => {
    mockFetch({ Media: mockMedia });
    const client = new AniListClient();

    await client.getMedia(1);
    expect(client.cacheSize).toBeGreaterThan(0);

    await client.clearCache();
    expect(client.cacheSize).toBe(0);
  });

  // ── Custom cache adapter ──

  it("accepts a custom CacheAdapter", async () => {
    mockFetch({ Media: mockMedia });

    const store = new Map<string, unknown>();
    const customAdapter = {
      get: vi.fn((key: string) => store.get(key)),
      set: vi.fn((key: string, data: unknown) => {
        store.set(key, data);
      }),
      delete: vi.fn((key: string) => store.delete(key)),
      clear: vi.fn(() => store.clear()),
      get size() {
        return store.size;
      },
      keys: vi.fn(() => store.keys()),
    };

    const client = new AniListClient({ cacheAdapter: customAdapter as CacheAdapter });

    await client.getMedia(1);
    expect(customAdapter.set).toHaveBeenCalled();

    await client.getMedia(1);
    expect(customAdapter.get).toHaveBeenCalled();
  });
});
