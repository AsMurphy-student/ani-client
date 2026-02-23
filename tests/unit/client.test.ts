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
      keys: vi.fn(() => [...store.keys()]),
    };

    const client = new AniListClient({ cacheAdapter: customAdapter as CacheAdapter });

    await client.getMedia(1);
    expect(customAdapter.set).toHaveBeenCalled();

    await client.getMedia(1);
    expect(customAdapter.get).toHaveBeenCalled();
  });

  // ── getMedia with include options ──

  it("getMedia with { characters: true } sends a query containing 'characters'", async () => {
    const mediaWithCharacters = {
      ...mockMedia,
      characters: {
        edges: [
          {
            role: "MAIN",
            node: {
              id: 1,
              name: {
                first: "Spike",
                middle: null,
                last: "Spiegel",
                full: "Spike Spiegel",
                native: null,
                alternative: [],
              },
              image: { large: null, medium: null },
              description: null,
              gender: "Male",
              dateOfBirth: null,
              age: "27",
              bloodType: null,
              favourites: 100,
              siteUrl: null,
            },
          },
        ],
      },
    };
    mockFetch({ Media: mediaWithCharacters });

    const client = new AniListClient({ cache: { enabled: false } });
    const result = await client.getMedia(1, { characters: true });

    expect(result.characters).toBeDefined();
    expect(result.characters?.edges).toHaveLength(1);
    expect(result.characters?.edges[0].role).toBe("MAIN");
    expect(result.characters?.edges[0].node.name.full).toBe("Spike Spiegel");

    // Verify the query sent to fetch contains "characters"
    const fetchCall = vi.mocked(fetch).mock.calls[0];
    const body = JSON.parse(fetchCall[1]?.body as string);
    expect(body.query).toContain("characters");
  });

  it("getMedia with { staff: true } sends a query containing 'staff'", async () => {
    const mediaWithStaff = {
      ...mockMedia,
      staff: {
        edges: [
          {
            role: "Director",
            node: {
              id: 10,
              name: { first: "Shinichiro", middle: null, last: "Watanabe", full: "Shinichiro Watanabe", native: null },
              language: "Japanese",
              image: { large: null, medium: null },
              description: null,
              primaryOccupations: ["Director"],
              gender: "Male",
              dateOfBirth: null,
              dateOfDeath: null,
              age: null,
              yearsActive: [],
              homeTown: null,
              bloodType: null,
              favourites: 50,
              siteUrl: null,
            },
          },
        ],
      },
    };
    mockFetch({ Media: mediaWithStaff });

    const client = new AniListClient({ cache: { enabled: false } });
    const result = await client.getMedia(1, { staff: true });

    expect(result.staff).toBeDefined();
    expect(result.staff?.edges).toHaveLength(1);
    expect(result.staff?.edges[0].role).toBe("Director");

    const fetchCall = vi.mocked(fetch).mock.calls[0];
    const body = JSON.parse(fetchCall[1]?.body as string);
    expect(body.query).toContain("staff");
  });

  it("getMedia without include does NOT send characters/staff in query", async () => {
    mockFetch({ Media: mockMedia });

    const client = new AniListClient({ cache: { enabled: false } });
    await client.getMedia(1);

    const fetchCall = vi.mocked(fetch).mock.calls[0];
    const body = JSON.parse(fetchCall[1]?.body as string);
    expect(body.query).not.toContain("characters");
    expect(body.query).not.toMatch(/\bstaff\s*\(/);
  });

  it("getMedia with { characters: { perPage: 50 } } customises pagination", async () => {
    mockFetch({ Media: { ...mockMedia, characters: { edges: [] } } });

    const client = new AniListClient({ cache: { enabled: false } });
    await client.getMedia(1, { characters: { perPage: 50 } });

    const fetchCall = vi.mocked(fetch).mock.calls[0];
    const body = JSON.parse(fetchCall[1]?.body as string);
    expect(body.query).toContain("characters(perPage: 50");
  });

  it("getMedia with { characters: { sort: false } } omits sort clause", async () => {
    mockFetch({ Media: { ...mockMedia, characters: { edges: [] } } });

    const client = new AniListClient({ cache: { enabled: false } });
    await client.getMedia(1, { characters: { sort: false } });

    const fetchCall = vi.mocked(fetch).mock.calls[0];
    const body = JSON.parse(fetchCall[1]?.body as string);
    expect(body.query).toContain("characters(perPage: 25)");
    expect(body.query).not.toMatch(/characters\([^)]*sort:/);
  });

  it("getMedia with { relations: false } excludes relations from query", async () => {
    mockFetch({ Media: { ...mockMedia, relations: null } });

    const client = new AniListClient({ cache: { enabled: false } });
    await client.getMedia(1, { relations: false });

    const fetchCall = vi.mocked(fetch).mock.calls[0];
    const body = JSON.parse(fetchCall[1]?.body as string);
    expect(body.query).not.toContain("relations");
  });

  it("getMedia with { streamingEpisodes: true } includes streaming fields", async () => {
    mockFetch({
      Media: {
        ...mockMedia,
        streamingEpisodes: [{ title: "Ep 1", thumbnail: null, url: "https://example.com", site: "Crunchyroll" }],
      },
    });

    const client = new AniListClient({ cache: { enabled: false } });
    const result = await client.getMedia(1, { streamingEpisodes: true });

    const fetchCall = vi.mocked(fetch).mock.calls[0];
    const body = JSON.parse(fetchCall[1]?.body as string);
    expect(body.query).toContain("streamingEpisodes");
    expect(result.streamingEpisodes).toHaveLength(1);
    expect(result.streamingEpisodes?.[0].site).toBe("Crunchyroll");
  });

  it("getMedia with { externalLinks: true } includes external link fields", async () => {
    mockFetch({
      Media: {
        ...mockMedia,
        externalLinks: [{ id: 1, url: "https://mal.net", site: "MyAnimeList", type: "INFO", icon: null, color: null }],
      },
    });

    const client = new AniListClient({ cache: { enabled: false } });
    const result = await client.getMedia(1, { externalLinks: true });

    const fetchCall = vi.mocked(fetch).mock.calls[0];
    const body = JSON.parse(fetchCall[1]?.body as string);
    expect(body.query).toContain("externalLinks");
    expect(result.externalLinks).toHaveLength(1);
    expect(result.externalLinks?.[0].site).toBe("MyAnimeList");
  });

  it("getMedia with { stats: true } includes score/status distribution", async () => {
    mockFetch({
      Media: {
        ...mockMedia,
        stats: {
          scoreDistribution: [{ score: 80, amount: 500 }],
          statusDistribution: [{ status: "COMPLETED", amount: 1000 }],
        },
      },
    });

    const client = new AniListClient({ cache: { enabled: false } });
    const result = await client.getMedia(1, { stats: true });

    const fetchCall = vi.mocked(fetch).mock.calls[0];
    const body = JSON.parse(fetchCall[1]?.body as string);
    expect(body.query).toContain("scoreDistribution");
    expect(body.query).toContain("statusDistribution");
    expect(result.stats?.scoreDistribution[0].score).toBe(80);
    expect(result.stats?.statusDistribution[0].status).toBe("COMPLETED");
  });

  it("getMedia with { recommendations: { perPage: 5 } } includes recommendations", async () => {
    mockFetch({
      Media: {
        ...mockMedia,
        recommendations: {
          nodes: [
            {
              id: 1,
              rating: 50,
              mediaRecommendation: {
                id: 5,
                title: { romaji: "Samurai Champloo", english: null, native: null, userPreferred: null },
                type: "ANIME",
                format: "TV",
                coverImage: { large: null, medium: null },
                averageScore: 85,
                siteUrl: null,
              },
            },
          ],
        },
      },
    });

    const client = new AniListClient({ cache: { enabled: false } });
    const result = await client.getMedia(1, { recommendations: { perPage: 5 } });

    const fetchCall = vi.mocked(fetch).mock.calls[0];
    const body = JSON.parse(fetchCall[1]?.body as string);
    expect(body.query).toContain("recommendations(perPage: 5");
    expect(result.recommendations?.nodes).toHaveLength(1);
    expect(result.recommendations?.nodes[0].mediaRecommendation.title.romaji).toBe("Samurai Champloo");
  });

  it("getStaff with { media: true } sends a query containing 'staffMedia'", async () => {
    const staffWithMedia = {
      id: 95001,
      name: { first: "Hayao", middle: null, last: "Miyazaki", full: "Hayao Miyazaki", native: "宮崎駿" },
      language: "Japanese",
      image: { large: null, medium: null },
      description: "Famous director",
      primaryOccupations: ["Director"],
      gender: "Male",
      dateOfBirth: { year: 1941, month: 1, day: 5 },
      dateOfDeath: null,
      age: null,
      yearsActive: [1963],
      homeTown: "Tokyo",
      bloodType: null,
      favourites: 5000,
      siteUrl: null,
      staffMedia: {
        nodes: [
          {
            id: 164,
            title: {
              romaji: "Sen to Chihiro no Kamikakushi",
              english: "Spirited Away",
              native: "千と千尋の神隠し",
              userPreferred: "Sen to Chihiro no Kamikakushi",
            },
            type: "ANIME",
            format: "MOVIE",
            status: "FINISHED",
            coverImage: { extraLarge: null, large: null, medium: null, color: null },
            bannerImage: null,
            genres: ["Adventure", "Drama"],
            averageScore: 87,
            meanScore: 87,
            popularity: 100000,
            favourites: 12000,
            episodes: 1,
            trending: 10,
            hashtag: null,
            season: "SUMMER",
            seasonYear: 2001,
            startDate: { year: 2001, month: 7, day: 20 },
            endDate: { year: 2001, month: 7, day: 20 },
            nextAiringEpisode: null,
            studios: { edges: [{ node: { name: "Studio Ghibli" } }] },
            siteUrl: null,
          },
        ],
      },
    };
    mockFetch({ Staff: staffWithMedia });

    const client = new AniListClient({ cache: { enabled: false } });
    const result = await client.getStaff(95001, { media: true });

    expect(result.staffMedia).toBeDefined();
    expect(result.staffMedia?.nodes).toHaveLength(1);
    expect(result.staffMedia?.nodes[0].title.romaji).toBe("Sen to Chihiro no Kamikakushi");
    expect(result.staffMedia?.nodes[0].genres).toContain("Adventure");

    const fetchCall = vi.mocked(fetch).mock.calls[0];
    const body = JSON.parse(fetchCall[1]?.body as string);
    expect(body.query).toContain("staffMedia");
    expect(body.variables.perPage).toBe(25);
  });

  it("getStaff with { media: { perPage: 10 } } sends custom perPage", async () => {
    const mockStaff = {
      id: 95001,
      name: { first: "Hayao", middle: null, last: "Miyazaki", full: "Hayao Miyazaki", native: "宮崎駿" },
      language: "Japanese",
      image: { large: null, medium: null },
      description: null,
      primaryOccupations: [],
      gender: null,
      dateOfBirth: null,
      dateOfDeath: null,
      age: null,
      yearsActive: [],
      homeTown: null,
      bloodType: null,
      favourites: null,
      siteUrl: null,
      staffMedia: { nodes: [] },
    };
    mockFetch({ Staff: mockStaff });

    const client = new AniListClient({ cache: { enabled: false } });
    await client.getStaff(95001, { media: { perPage: 10 } });

    const fetchCall = vi.mocked(fetch).mock.calls[0];
    const body = JSON.parse(fetchCall[1]?.body as string);
    expect(body.query).toContain("staffMedia");
    expect(body.variables.perPage).toBe(10);
  });

  it("getStaff without include does NOT send staffMedia in query", async () => {
    const mockStaff = {
      id: 95001,
      name: { first: "Hayao", middle: null, last: "Miyazaki", full: "Hayao Miyazaki", native: "宮崎駿" },
      language: "Japanese",
      image: { large: null, medium: null },
      description: null,
      primaryOccupations: [],
      gender: null,
      dateOfBirth: null,
      dateOfDeath: null,
      age: null,
      yearsActive: [],
      homeTown: null,
      bloodType: null,
      favourites: null,
      siteUrl: null,
    };
    mockFetch({ Staff: mockStaff });

    const client = new AniListClient({ cache: { enabled: false } });
    await client.getStaff(95001);

    const fetchCall = vi.mocked(fetch).mock.calls[0];
    const body = JSON.parse(fetchCall[1]?.body as string);
    expect(body.query).not.toContain("staffMedia");
  });
});
