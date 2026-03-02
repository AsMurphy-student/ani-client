import { afterEach, describe, expect, it, vi } from "vitest";
import { AniListClient } from "../../src";

describe("getUserFavorites", () => {
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
          anime: {
            nodes: [
              {
                id: 1,
                title: {
                  romaji: "Cowboy Bebop",
                  english: "Cowboy Bebop",
                  native: "カウボーイビバップ",
                  userPreferred: "Cowboy Bebop",
                },
                coverImage: { large: "https://example.com/large.jpg", medium: "https://example.com/medium.jpg" },
                type: "ANIME",
                format: "TV",
                siteUrl: "https://anilist.co/anime/1",
              },
            ],
          },
          manga: { nodes: [] },
          characters: {
            nodes: [
              {
                id: 1,
                name: { full: "Spike Spiegel", native: "スパイク・スピーゲル" },
                image: { large: "https://example.com/spike.jpg", medium: null },
                siteUrl: "https://anilist.co/character/1",
              },
            ],
          },
          staff: { nodes: [] },
          studios: {
            nodes: [{ id: 1, name: "Sunrise", siteUrl: "https://anilist.co/studio/1" }],
          },
        },
      },
    },
  };

  it("fetches favorites by user ID", async () => {
    globalThis.fetch = vi.fn(() =>
      Promise.resolve(new Response(JSON.stringify(mockFavoritesResponse), { status: 200 })),
    );

    const client = new AniListClient({ cache: { enabled: false }, rateLimit: { enabled: false } });
    const favs = await client.getUserFavorites(1);

    expect(favs.anime).toHaveLength(1);
    expect(favs.anime[0].title.romaji).toBe("Cowboy Bebop");
    expect(favs.manga).toHaveLength(0);
    expect(favs.characters).toHaveLength(1);
    expect(favs.characters[0].name.full).toBe("Spike Spiegel");
    expect(favs.staff).toHaveLength(0);
    expect(favs.studios).toHaveLength(1);
    expect(favs.studios[0].name).toBe("Sunrise");
  });

  it("fetches favorites by username", async () => {
    globalThis.fetch = vi.fn(() =>
      Promise.resolve(new Response(JSON.stringify(mockFavoritesResponse), { status: 200 })),
    );

    const client = new AniListClient({ cache: { enabled: false }, rateLimit: { enabled: false } });
    const favs = await client.getUserFavorites("TestUser");

    expect(favs.anime).toHaveLength(1);
    expect(favs.characters).toHaveLength(1);
  });

  it("throws RangeError for invalid user ID", async () => {
    const client = new AniListClient();
    await expect(client.getUserFavorites(-1)).rejects.toThrow(RangeError);
    await expect(client.getUserFavorites(0)).rejects.toThrow(RangeError);
  });

  it("returns empty arrays when user has no favorites", async () => {
    globalThis.fetch = vi.fn(() =>
      Promise.resolve(
        new Response(
          JSON.stringify({
            data: {
              User: {
                id: 2,
                name: "EmptyUser",
                favourites: {
                  anime: { nodes: [] },
                  manga: { nodes: [] },
                  characters: { nodes: [] },
                  staff: { nodes: [] },
                  studios: { nodes: [] },
                },
              },
            },
          }),
          { status: 200 },
        ),
      ),
    );

    const client = new AniListClient({ cache: { enabled: false }, rateLimit: { enabled: false } });
    const favs = await client.getUserFavorites(2);

    expect(favs.anime).toEqual([]);
    expect(favs.manga).toEqual([]);
    expect(favs.characters).toEqual([]);
    expect(favs.staff).toEqual([]);
    expect(favs.studios).toEqual([]);
  });
});

describe("rateLimitInfo", () => {
  const originalFetch = globalThis.fetch;

  afterEach(() => {
    globalThis.fetch = originalFetch;
  });

  it("parses X-RateLimit headers from response", async () => {
    globalThis.fetch = vi.fn(() =>
      Promise.resolve(
        new Response(JSON.stringify({ data: { Media: { id: 1 } } }), {
          status: 200,
          headers: {
            "X-RateLimit-Limit": "90",
            "X-RateLimit-Remaining": "85",
            "X-RateLimit-Reset": "1700000000",
          },
        }),
      ),
    );

    const client = new AniListClient({ cache: { enabled: false }, rateLimit: { enabled: false } });
    await client.getMedia(1);

    expect(client.rateLimitInfo).toEqual({
      limit: 90,
      remaining: 85,
      reset: 1700000000,
    });
  });

  it("returns undefined when no rate limit headers present", async () => {
    globalThis.fetch = vi.fn(() =>
      Promise.resolve(new Response(JSON.stringify({ data: { Media: { id: 1 } } }), { status: 200 })),
    );

    const client = new AniListClient({ cache: { enabled: false }, rateLimit: { enabled: false } });
    await client.getMedia(1);

    expect(client.rateLimitInfo).toBeUndefined();
  });
});

describe("lastRequestMeta", () => {
  const originalFetch = globalThis.fetch;

  afterEach(() => {
    globalThis.fetch = originalFetch;
  });

  it("tracks non-cached request metadata", async () => {
    globalThis.fetch = vi.fn(() =>
      Promise.resolve(
        new Response(JSON.stringify({ data: { Media: { id: 1 } } }), {
          status: 200,
          headers: {
            "X-RateLimit-Limit": "90",
            "X-RateLimit-Remaining": "89",
            "X-RateLimit-Reset": "1700000000",
          },
        }),
      ),
    );

    const client = new AniListClient({ cache: { enabled: false }, rateLimit: { enabled: false } });
    await client.getMedia(1);

    const meta = client.lastRequestMeta;
    expect(meta).toBeDefined();
    expect(meta?.fromCache).toBe(false);
    expect(meta?.durationMs).toBeGreaterThanOrEqual(0);
    expect(meta?.rateLimitInfo).toEqual({
      limit: 90,
      remaining: 89,
      reset: 1700000000,
    });
  });

  it("tracks cached request metadata", async () => {
    globalThis.fetch = vi.fn(() =>
      Promise.resolve(new Response(JSON.stringify({ data: { Media: { id: 1 } } }), { status: 200 })),
    );

    const client = new AniListClient({ rateLimit: { enabled: false } });
    await client.getMedia(1); // fills cache
    await client.getMedia(1); // cache hit

    const meta = client.lastRequestMeta;
    expect(meta).toBeDefined();
    expect(meta?.fromCache).toBe(true);
    expect(meta?.durationMs).toBe(0);
    expect(meta?.rateLimitInfo).toBeUndefined();
  });

  it("passes rateLimitInfo to onResponse hook", async () => {
    const onResponse = vi.fn();
    globalThis.fetch = vi.fn(() =>
      Promise.resolve(
        new Response(JSON.stringify({ data: { Media: { id: 1 } } }), {
          status: 200,
          headers: {
            "X-RateLimit-Limit": "90",
            "X-RateLimit-Remaining": "88",
            "X-RateLimit-Reset": "1700000000",
          },
        }),
      ),
    );

    const client = new AniListClient({
      cache: { enabled: false },
      rateLimit: { enabled: false },
      hooks: { onResponse },
    });
    await client.getMedia(1);

    expect(onResponse).toHaveBeenCalledWith(expect.any(String), expect.any(Number), false, {
      limit: 90,
      remaining: 88,
      reset: 1700000000,
    });
  });
});

describe("custom retryStrategy", () => {
  const originalFetch = globalThis.fetch;

  afterEach(() => {
    globalThis.fetch = originalFetch;
  });

  it("uses custom retry strategy when provided", async () => {
    const customStrategy = vi.fn((attempt: number) => (attempt + 1) * 100);

    let callCount = 0;
    globalThis.fetch = vi.fn(() => {
      callCount++;
      if (callCount <= 2) {
        return Promise.resolve(new Response("", { status: 429 }));
      }
      return Promise.resolve(new Response(JSON.stringify({ data: { Media: { id: 1 } } }), { status: 200 }));
    });

    const client = new AniListClient({
      cache: { enabled: false },
      rateLimit: {
        maxRetries: 3,
        retryStrategy: customStrategy,
        maxRequests: 100,
      },
    });

    await client.getMedia(1);

    expect(customStrategy).toHaveBeenCalledTimes(2);
    expect(customStrategy).toHaveBeenCalledWith(0, 2000); // first retry, base delay
    expect(customStrategy).toHaveBeenCalledWith(1, 2000); // second retry, base delay
  });
});
