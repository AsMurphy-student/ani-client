import { afterEach, describe, expect, it, vi } from "vitest";
import { AniListClient, type Logger, type MediaType, MemoryCache } from "../../src";

function firstFetchCall() {
  const call = vi.mocked(fetch).mock.calls[0];
  if (!call) throw new Error("No fetch call recorded");
  return call;
}

const mockMedia = {
  id: 1,
  idMal: 21,
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
  nextAiringEpisode: null,
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

// ── withSignal ──

describe("withSignal", () => {
  const originalFetch = globalThis.fetch;

  afterEach(() => {
    globalThis.fetch = originalFetch;
  });

  it("returns a scoped client that uses the given signal", async () => {
    mockFetch({ Media: mockMedia });

    const client = new AniListClient({ cache: { enabled: false }, rateLimit: { enabled: false } });
    const controller = new AbortController();
    const scoped = client.withSignal(controller.signal);

    const media = await scoped.getMedia(1);
    expect(media.id).toBe(1);

    const fetchCall = firstFetchCall();
    const init = fetchCall[1] as RequestInit;
    expect(init.signal).toBeDefined();
  });

  it("scoped client shares the same cache as the parent", async () => {
    mockFetch({ Media: mockMedia });

    const client = new AniListClient({ rateLimit: { enabled: false } });
    const scoped = client.withSignal(new AbortController().signal);

    await client.getMedia(1);
    // The scoped client should use the cached result
    const media = await scoped.getMedia(1);
    expect(media.id).toBe(1);
    expect(vi.mocked(fetch)).toHaveBeenCalledTimes(1); // only 1 fetch, second was cache hit
  });

  it("aborted signal causes fetch to throw", async () => {
    globalThis.fetch = vi.fn(() => {
      throw new DOMException("The operation was aborted.", "AbortError");
    });

    const client = new AniListClient({ cache: { enabled: false }, rateLimit: { enabled: false } });
    const controller = new AbortController();
    controller.abort();
    const scoped = client.withSignal(controller.signal);

    await expect(scoped.getMedia(1)).rejects.toThrow();
  });
});

// ── Logger ──

describe("injectable logger", () => {
  const originalFetch = globalThis.fetch;

  afterEach(() => {
    globalThis.fetch = originalFetch;
  });

  it("calls logger.debug on cache hit", async () => {
    mockFetch({ Media: mockMedia });

    const logger: Logger = {
      debug: vi.fn(),
      info: vi.fn(),
      warn: vi.fn(),
      error: vi.fn(),
    };

    const client = new AniListClient({ logger, rateLimit: { enabled: false } });
    await client.getMedia(1); // cache miss
    await client.getMedia(1); // cache hit

    expect(logger.debug).toHaveBeenCalledWith("Cache hit", expect.any(Object));
  });

  it("calls logger.debug on request complete", async () => {
    mockFetch({ Media: mockMedia });

    const logger: Logger = {
      debug: vi.fn(),
      info: vi.fn(),
      warn: vi.fn(),
      error: vi.fn(),
    };

    const client = new AniListClient({ logger, cache: { enabled: false }, rateLimit: { enabled: false } });
    await client.getMedia(1);

    expect(logger.debug).toHaveBeenCalledWith("API request", expect.any(Object));
    expect(logger.debug).toHaveBeenCalledWith("Request complete", expect.any(Object));
  });

  it("calls logger.error on request failure", async () => {
    globalThis.fetch = vi.fn(() =>
      Promise.resolve(new Response(JSON.stringify({ errors: [{ message: "Not Found" }] }), { status: 404 })),
    );

    const logger: Logger = {
      debug: vi.fn(),
      info: vi.fn(),
      warn: vi.fn(),
      error: vi.fn(),
    };

    const client = new AniListClient({ logger, cache: { enabled: false }, rateLimit: { enabled: false } });
    await expect(client.getMedia(1)).rejects.toThrow();

    expect(logger.error).toHaveBeenCalledWith("Request failed", expect.objectContaining({ status: 404 }));
  });

  it("works without a logger (no errors)", async () => {
    mockFetch({ Media: mockMedia });
    const client = new AniListClient({ cache: { enabled: false }, rateLimit: { enabled: false } });
    const media = await client.getMedia(1);
    expect(media.id).toBe(1);
  });
});

// ── getMediaByMalId ──

describe("getMediaByMalId", () => {
  const originalFetch = globalThis.fetch;

  afterEach(() => {
    globalThis.fetch = originalFetch;
  });

  it("fetches media by MAL ID", async () => {
    mockFetch({ Media: mockMedia });

    const client = new AniListClient({ cache: { enabled: false }, rateLimit: { enabled: false } });
    const media = await client.getMediaByMalId(21);

    expect(media.id).toBe(1);
    const fetchCall = firstFetchCall();
    const body = JSON.parse(fetchCall[1]?.body as string);
    expect(body.variables.idMal).toBe(21);
  });

  it("passes type filter when provided", async () => {
    mockFetch({ Media: mockMedia });

    const client = new AniListClient({ cache: { enabled: false }, rateLimit: { enabled: false } });
    await client.getMediaByMalId(21, "ANIME" as MediaType);

    const fetchCall = firstFetchCall();
    const body = JSON.parse(fetchCall[1]?.body as string);
    expect(body.variables.type).toBe("ANIME");
  });

  it("rejects invalid MAL ID", async () => {
    const client = new AniListClient();
    await expect(client.getMediaByMalId(-1)).rejects.toThrow(RangeError);
    await expect(client.getMediaByMalId(0)).rejects.toThrow(RangeError);
    await expect(client.getMediaByMalId(1.5)).rejects.toThrow(RangeError);
  });
});

// ── Cache Stats ──

describe("MemoryCache stats", () => {
  it("tracks hits and misses", () => {
    const cache = new MemoryCache({ ttl: 60000 });
    cache.set("key", "value");

    cache.get("key"); // hit
    cache.get("key"); // hit
    cache.get("missing"); // miss

    const stats = cache.stats;
    expect(stats.hits).toBe(2);
    expect(stats.misses).toBe(1);
    expect(stats.stales).toBe(0);
    expect(stats.hitRate).toBeCloseTo(2 / 3);
  });

  it("returns NaN hitRate when no requests", () => {
    const cache = new MemoryCache();
    expect(cache.stats.hitRate).toBeNaN();
  });

  it("resets stats on clear()", () => {
    const cache = new MemoryCache();
    cache.set("a", 1);
    cache.get("a");
    cache.clear();

    expect(cache.stats.hits).toBe(0);
    expect(cache.stats.misses).toBe(0);
  });

  it("resetStats() resets counters without clearing data", () => {
    const cache = new MemoryCache();
    cache.set("a", 1);
    cache.get("a"); // hit
    cache.get("b"); // miss

    cache.resetStats();
    expect(cache.stats.hits).toBe(0);
    expect(cache.stats.misses).toBe(0);
    expect(cache.get("a")).toBe(1); // data still present
  });
});

// ── Stale-While-Revalidate ──

describe("MemoryCache stale-while-revalidate", () => {
  it("returns stale data within the SWR window", async () => {
    const cache = new MemoryCache({ ttl: 50, staleWhileRevalidateMs: 200 });
    cache.set("key", "value");

    // Wait for TTL to expire
    await new Promise((r) => setTimeout(r, 80));

    // Should still return stale data within the SWR window
    const result = cache.get("key");
    expect(result).toBe("value");
    expect(cache.stats.stales).toBe(1);
    expect(cache.stats.hits).toBe(0);
  });

  it("returns undefined after SWR window expires", async () => {
    const cache = new MemoryCache({ ttl: 30, staleWhileRevalidateMs: 50 });
    cache.set("key", "value");

    // Wait for both TTL + SWR to expire
    await new Promise((r) => setTimeout(r, 120));

    const result = cache.get("key");
    expect(result).toBeUndefined();
    expect(cache.stats.misses).toBe(1);
  });

  it("does not use SWR when disabled (default)", async () => {
    const cache = new MemoryCache({ ttl: 30 });
    cache.set("key", "value");

    await new Promise((r) => setTimeout(r, 60));

    const result = cache.get("key");
    expect(result).toBeUndefined();
  });
});

// ── Studio with include ──

describe("getStudio with include", () => {
  const originalFetch = globalThis.fetch;

  afterEach(() => {
    globalThis.fetch = originalFetch;
  });

  it("getStudio with { media: { perPage: 50 } } sends custom query", async () => {
    const mockStudio = {
      id: 21,
      name: "Studio Ghibli",
      isAnimationStudio: true,
      siteUrl: null,
      favourites: 1000,
      media: { pageInfo: { total: 50, perPage: 50, currentPage: 1, lastPage: 1, hasNextPage: false }, nodes: [] },
    };
    mockFetch({ Studio: mockStudio });

    const client = new AniListClient({ cache: { enabled: false }, rateLimit: { enabled: false } });
    const studio = await client.getStudio(21, { media: { perPage: 50 } });

    expect(studio.id).toBe(21);
    expect(studio.name).toBe("Studio Ghibli");

    const fetchCall = firstFetchCall();
    const body = JSON.parse(fetchCall[1]?.body as string);
    expect(body.query).toContain("perPage: 50");
  });

  it("getStudio without include uses default query", async () => {
    const mockStudio = {
      id: 21,
      name: "Studio Ghibli",
      isAnimationStudio: true,
      siteUrl: null,
      favourites: 1000,
      media: { pageInfo: { total: 25, perPage: 25, currentPage: 1, lastPage: 1, hasNextPage: false }, nodes: [] },
    };
    mockFetch({ Studio: mockStudio });

    const client = new AniListClient({ cache: { enabled: false }, rateLimit: { enabled: false } });
    await client.getStudio(21);

    const fetchCall = firstFetchCall();
    const body = JSON.parse(fetchCall[1]?.body as string);
    expect(body.query).toContain("perPage");
  });
});

// ── getUserFavorites with options ──

describe("getUserFavorites with options", () => {
  const originalFetch = globalThis.fetch;

  afterEach(() => {
    globalThis.fetch = originalFetch;
  });

  const mockFavoritesResponse = {
    data: {
      User: {
        id: 1,
        name: "TestUser",
        favourites: {
          anime: { nodes: [] },
          manga: { nodes: [] },
          characters: { nodes: [] },
          staff: { nodes: [] },
          studios: { nodes: [] },
        },
      },
    },
  };

  it("getUserFavorites with { perPage: 50 } sends custom query", async () => {
    globalThis.fetch = vi.fn(() =>
      Promise.resolve(new Response(JSON.stringify(mockFavoritesResponse), { status: 200 })),
    );

    const client = new AniListClient({ cache: { enabled: false }, rateLimit: { enabled: false } });
    await client.getUserFavorites(1, { perPage: 50 });

    const fetchCall = firstFetchCall();
    const body = JSON.parse(fetchCall[1]?.body as string);
    expect(body.query).toContain("perPage: 50");
  });

  it("getUserFavorites without options uses default query", async () => {
    globalThis.fetch = vi.fn(() =>
      Promise.resolve(new Response(JSON.stringify(mockFavoritesResponse), { status: 200 })),
    );

    const client = new AniListClient({ cache: { enabled: false }, rateLimit: { enabled: false } });
    await client.getUserFavorites(1);

    const fetchCall = firstFetchCall();
    const body = JSON.parse(fetchCall[1]?.body as string);
    expect(body.query).toContain("perPage: 25");
  });
});
