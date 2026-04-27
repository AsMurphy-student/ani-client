/**
 * Unit tests for domain method modules (media, thread, studio, staff, character, user).
 * These cover the methods that were previously only exercised by integration tests.
 */
import { afterEach, describe, expect, it, vi } from "vitest";
import { AniListClient, MediaSeason, MediaType } from "../../src";

// ── Helpers ──

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
  nextAiringEpisode: null,
};

const mockThread = {
  id: 1,
  title: "Test Thread",
  body: "Thread body",
  userId: 1,
  replyUserId: null,
  replyCommentId: null,
  replyCount: 5,
  viewCount: 100,
  isLocked: false,
  isSticky: false,
  isSubscribed: false,
  repliedAt: null,
  createdAt: 1700000000,
  updatedAt: 1700000000,
  siteUrl: null,
  user: null,
  replyUser: null,
  categories: [],
  mediaCategories: [],
};

const mockStudio = {
  id: 21,
  name: "Sunrise",
  isAnimationStudio: true,
  siteUrl: "https://anilist.co/studio/21",
  favourites: 500,
};

const mockCharacter = {
  id: 1,
  name: { first: "Spike", middle: null, last: "Spiegel", full: "Spike Spiegel", native: null, alternative: [] },
  image: { large: null, medium: null },
  description: null,
  gender: "Male",
  dateOfBirth: null,
  age: "27",
  bloodType: null,
  favourites: 100,
  siteUrl: null,
};

const mockStaff = {
  id: 95001,
  name: { first: "Hayao", middle: null, last: "Miyazaki", full: "Hayao Miyazaki", native: "宮崎駿" },
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
  favourites: 5000,
  siteUrl: null,
};

const mockUser = {
  id: 1,
  name: "TestUser",
  about: null,
  avatar: { large: null, medium: null },
  bannerImage: null,
  isFollowing: null,
  isFollower: null,
  donatorTier: null,
  donatorBadge: null,
  createdAt: null,
  siteUrl: null,
  statistics: null,
};

const mockReview = {
  id: 1,
  userId: 1,
  mediaId: 1,
  mediaType: "ANIME",
  summary: "Great anime!",
  body: "This anime is amazing with great characters and story.",
  rating: 85,
  ratingAmount: 10,
  userRating: "UP_VOTE",
  score: 8,
  private: false,
  siteUrl: "https://anilist.co/review/1",
  createdAt: 1700000000,
  updatedAt: 1700000000,
  user: {
    id: 1,
    name: "Reviewer",
    avatar: { large: null, medium: null },
    siteUrl: null,
  },
  media: mockMedia,
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

function mockPagedFetch(field: string, items: unknown[], hasNextPage = false) {
  mockFetch({
    Page: {
      pageInfo: { total: items.length, perPage: 20, currentPage: 1, lastPage: 1, hasNextPage },
      [field]: items,
    },
  });
}

function newClient() {
  return new AniListClient({ cache: { enabled: false }, rateLimit: { enabled: false } });
}

// ── Tests ──

describe("Media methods", () => {
  const originalFetch = globalThis.fetch;
  afterEach(() => {
    globalThis.fetch = originalFetch;
  });

  it("searchMedia returns paged results", async () => {
    mockPagedFetch("media", [mockMedia]);
    const client = newClient();
    const result = await client.searchMedia({ query: "Test" });
    expect(result.results).toHaveLength(1);
    expect(result.pageInfo.currentPage).toBe(1);
  });

  it("getTrending returns paged results", async () => {
    mockPagedFetch("media", [mockMedia]);
    const client = newClient();
    const result = await client.getTrending();
    expect(result.results).toHaveLength(1);
  });

  it("getPopular returns paged results", async () => {
    mockPagedFetch("media", [mockMedia]);
    const client = newClient();
    const result = await client.getPopular();
    expect(result.results).toHaveLength(1);
  });

  it("getTopRated returns paged results", async () => {
    mockPagedFetch("media", [mockMedia]);
    const client = newClient();
    const result = await client.getTopRated();
    expect(result.results).toHaveLength(1);
  });

  it("getAiredEpisodes returns paged airing schedules", async () => {
    const mockAiring = { id: 1, airingAt: 1700000000, timeUntilAiring: 0, episode: 1, mediaId: 1, media: mockMedia };
    mockPagedFetch("airingSchedules", [mockAiring]);
    const client = newClient();
    const result = await client.getAiredEpisodes();
    expect(result.results).toHaveLength(1);
    expect(result.results[0].episode).toBe(1);
  });

  it("getRecentlyUpdatedManga returns paged results", async () => {
    const mangaMedia = { ...mockMedia, type: "MANGA" };
    mockPagedFetch("media", [mangaMedia]);
    const client = newClient();
    const result = await client.getRecentlyUpdatedManga();
    expect(result.results).toHaveLength(1);
  });

  it("getPlanning returns paged results", async () => {
    mockPagedFetch("media", [mockMedia]);
    const client = newClient();
    const result = await client.getPlanning();
    expect(result.results).toHaveLength(1);
  });

  it("getPlanning accepts type and sort options", async () => {
    mockPagedFetch("media", [mockMedia]);
    const client = newClient();
    const result = await client.getPlanning({ type: MediaType.ANIME, page: 1, perPage: 5 });
    expect(result.results).toHaveLength(1);
  });

  it("getRecommendations returns paged recommendations", async () => {
    const mockRec = {
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
    };
    mockFetch({
      Media: {
        recommendations: {
          pageInfo: { total: 1, perPage: 20, currentPage: 1, lastPage: 1, hasNextPage: false },
          nodes: [mockRec],
        },
      },
    });
    const client = newClient();
    const result = await client.getRecommendations(1);
    expect(result.results).toHaveLength(1);
    expect(result.results[0].mediaRecommendation.title.romaji).toBe("Samurai Champloo");
  });

  it("getRecommendations rejects invalid ID", async () => {
    const client = newClient();
    await expect(client.getRecommendations(-1)).rejects.toThrow(RangeError);
    await expect(client.getRecommendations(0)).rejects.toThrow(RangeError);
  });

  it("getMediaBySeason returns paged results", async () => {
    mockPagedFetch("media", [mockMedia]);
    const client = newClient();
    const result = await client.getMediaBySeason({ season: MediaSeason.WINTER, seasonYear: 2025 });
    expect(result.results).toHaveLength(1);
  });

  it("getWeeklySchedule returns a schedule grouped by day", async () => {
    // Mock paginate: first call returns items, second call returns empty (no next page)
    const monday = new Date("2025-01-06T12:00:00Z"); // a Monday
    const mondayTimestamp = Math.floor(monday.getTime() / 1000);
    const mockAiring = {
      id: 1,
      airingAt: mondayTimestamp,
      timeUntilAiring: 0,
      episode: 1,
      mediaId: 1,
      media: mockMedia,
    };

    mockFetch({
      Page: {
        pageInfo: { total: 1, perPage: 50, currentPage: 1, lastPage: 1, hasNextPage: false },
        airingSchedules: [mockAiring],
      },
    });

    const client = newClient();
    const schedule = await client.getWeeklySchedule(monday);
    expect(schedule).toHaveProperty("Monday");
    expect(schedule).toHaveProperty("Sunday");
    expect(schedule.Monday.length).toBeGreaterThanOrEqual(1);
  });

  it("getAiredEpisodes with custom options", async () => {
    const mockAiring = { id: 1, airingAt: 1700000000, timeUntilAiring: 0, episode: 5, mediaId: 1, media: mockMedia };
    mockPagedFetch("airingSchedules", [mockAiring]);
    const client = newClient();
    const result = await client.getAiredEpisodes({
      airingAtGreater: 1699990000,
      airingAtLesser: 1700010000,
      page: 1,
      perPage: 10,
    });
    expect(result.results[0].episode).toBe(5);
  });
});

// ── Thread ──

describe("Thread methods", () => {
  const originalFetch = globalThis.fetch;
  afterEach(() => {
    globalThis.fetch = originalFetch;
  });

  it("getThread fetches a thread by ID", async () => {
    mockFetch({ Thread: mockThread });
    const client = newClient();
    const thread = await client.getThread(1);
    expect(thread.id).toBe(1);
    expect(thread.title).toBe("Test Thread");
  });

  it("getThread rejects invalid ID", async () => {
    const client = newClient();
    await expect(client.getThread(-1)).rejects.toThrow(RangeError);
    await expect(client.getThread(0)).rejects.toThrow(RangeError);
  });

  it("getRecentThreads returns paged results", async () => {
    mockPagedFetch("threads", [mockThread]);
    const client = newClient();
    const result = await client.getRecentThreads();
    expect(result.results).toHaveLength(1);
    expect(result.results[0].title).toBe("Test Thread");
  });

  it("getRecentThreads with search options", async () => {
    mockPagedFetch("threads", [mockThread]);
    const client = newClient();
    const result = await client.getRecentThreads({ query: "Test", page: 1, perPage: 5 });
    expect(result.results).toHaveLength(1);
  });

  it("getRecentThreads with mediaId and categoryId", async () => {
    mockPagedFetch("threads", [mockThread]);
    const client = newClient();
    const result = await client.getRecentThreads({ mediaId: 1, categoryId: 5 });
    expect(result.results).toHaveLength(1);
  });
});

// ── Studio ──

describe("Studio methods", () => {
  const originalFetch = globalThis.fetch;
  afterEach(() => {
    globalThis.fetch = originalFetch;
  });

  it("getStudio fetches a studio by ID", async () => {
    mockFetch({ Studio: mockStudio });
    const client = newClient();
    const studio = await client.getStudio(21);
    expect(studio.id).toBe(21);
    expect(studio.name).toBe("Sunrise");
  });

  it("getStudio rejects invalid ID", async () => {
    const client = newClient();
    await expect(client.getStudio(-1)).rejects.toThrow(RangeError);
    await expect(client.getStudio(0)).rejects.toThrow(RangeError);
  });

  it("getStudio with { media: true } includes media", async () => {
    const studioWithMedia = {
      ...mockStudio,
      media: {
        pageInfo: { total: 1, perPage: 25, currentPage: 1, lastPage: 1, hasNextPage: false },
        nodes: [
          {
            id: 1,
            title: mockMedia.title,
            type: "ANIME",
            format: "TV",
            coverImage: mockMedia.coverImage,
            siteUrl: null,
          },
        ],
      },
    };
    mockFetch({ Studio: studioWithMedia });
    const client = newClient();
    const studio = await client.getStudio(21, { media: true });
    expect(studio.media?.nodes).toHaveLength(1);
  });

  it("getStudio with { media: { perPage: 50 } } uses custom perPage", async () => {
    mockFetch({ Studio: { ...mockStudio, media: { pageInfo: {}, nodes: [] } } });
    const client = newClient();
    await client.getStudio(21, { media: { perPage: 50 } });

    const fetchCall = vi.mocked(fetch).mock.calls[0];
    const body = JSON.parse(fetchCall[1]?.body as string);
    expect(body.query).toContain("media");
  });

  it("searchStudios returns paged results", async () => {
    mockPagedFetch("studios", [mockStudio]);
    const client = newClient();
    const result = await client.searchStudios();
    expect(result.results).toHaveLength(1);
    expect(result.results[0].name).toBe("Sunrise");
  });

  it("searchStudios with query and sort", async () => {
    mockPagedFetch("studios", [mockStudio]);
    const client = newClient();
    const result = await client.searchStudios({ query: "Sunrise", page: 1, perPage: 5 });
    expect(result.results).toHaveLength(1);
  });
});

// ── Character ──

describe("Character methods", () => {
  const originalFetch = globalThis.fetch;
  afterEach(() => {
    globalThis.fetch = originalFetch;
  });

  it("getCharacter fetches a character by ID", async () => {
    mockFetch({ Character: mockCharacter });
    const client = newClient();
    const char = await client.getCharacter(1);
    expect(char.id).toBe(1);
    expect(char.name.full).toBe("Spike Spiegel");
  });

  it("getCharacter with { voiceActors: true }", async () => {
    const charWithVA = {
      ...mockCharacter,
      media: {
        edges: [
          {
            voiceActors: [
              {
                id: 100,
                name: { full: "Test VA", native: null },
                language: "Japanese",
                image: { large: null, medium: null },
              },
            ],
            node: { id: 1, title: mockMedia.title, type: "ANIME" },
          },
        ],
      },
    };
    mockFetch({ Character: charWithVA });
    const client = newClient();
    const char = await client.getCharacter(1, { voiceActors: true });
    expect(char.media?.edges).toHaveLength(1);
  });

  it("getCharacter rejects invalid ID", async () => {
    const client = newClient();
    await expect(client.getCharacter(-1)).rejects.toThrow(RangeError);
  });

  it("searchCharacters returns paged results", async () => {
    mockPagedFetch("characters", [mockCharacter]);
    const client = newClient();
    const result = await client.searchCharacters({ query: "Spike" });
    expect(result.results).toHaveLength(1);
    expect(result.results[0].name.full).toBe("Spike Spiegel");
  });

  it("searchCharacters with voiceActors option", async () => {
    mockPagedFetch("characters", [mockCharacter]);
    const client = newClient();
    const result = await client.searchCharacters({ query: "Spike", voiceActors: true });
    expect(result.results).toHaveLength(1);
  });
});

// ── User ──

describe("User methods", () => {
  const originalFetch = globalThis.fetch;
  afterEach(() => {
    globalThis.fetch = originalFetch;
  });

  it("getUser fetches by ID", async () => {
    mockFetch({ User: mockUser });
    const client = newClient();
    const user = await client.getUser(1);
    expect(user.id).toBe(1);
    expect(user.name).toBe("TestUser");
  });

  it("getUser fetches by username", async () => {
    mockFetch({ User: mockUser });
    const client = newClient();
    const user = await client.getUser("TestUser");
    expect(user.name).toBe("TestUser");
  });

  it("getUser rejects invalid ID", async () => {
    const client = newClient();
    await expect(client.getUser(-1)).rejects.toThrow(RangeError);
  });

  it("searchUsers returns paged results", async () => {
    mockPagedFetch("users", [mockUser]);
    const client = newClient();
    const result = await client.searchUsers({ query: "Test" });
    expect(result.results).toHaveLength(1);
  });

  it("getUserMediaList returns paged results", async () => {
    const mockEntry = {
      id: 1,
      mediaId: 1,
      status: "COMPLETED",
      score: 9,
      progress: 26,
      progressVolumes: null,
      repeat: 0,
      priority: 0,
      private: false,
      notes: null,
      startedAt: null,
      completedAt: null,
      updatedAt: 1700000000,
      createdAt: 1700000000,
      media: mockMedia,
    };
    mockPagedFetch("mediaList", [mockEntry]);
    const client = newClient();
    const result = await client.getUserMediaList({ userId: 1, type: MediaType.ANIME });
    expect(result.results).toHaveLength(1);
    expect(result.results[0].status).toBe("COMPLETED");
  });

  it("getUserMediaList with userName", async () => {
    mockPagedFetch("mediaList", []);
    const client = newClient();
    const result = await client.getUserMediaList({ userName: "TestUser", type: MediaType.ANIME });
    expect(result.results).toHaveLength(0);
  });

  it("getUserMediaList throws without userId or userName", async () => {
    const client = newClient();
    // @ts-expect-error testing missing required fields
    await expect(client.getUserMediaList({})).rejects.toThrow(TypeError);
  });

  it("getUserMediaList rejects invalid userId", async () => {
    const client = newClient();
    await expect(client.getUserMediaList({ userId: -1, type: MediaType.ANIME })).rejects.toThrow(RangeError);
  });

  it("getUserFavorites with perPage option (by ID)", async () => {
    mockFetch({
      User: {
        favourites: {
          anime: { nodes: [] },
          manga: { nodes: [] },
          characters: { nodes: [] },
          staff: { nodes: [] },
          studios: { nodes: [] },
        },
      },
    });
    const client = newClient();
    const favs = await client.getUserFavorites(1, { perPage: 50 });
    expect(favs.anime).toEqual([]);
  });

  it("getUserFavorites with perPage option (by name)", async () => {
    mockFetch({
      User: {
        favourites: {
          anime: { nodes: [] },
          manga: { nodes: [] },
          characters: { nodes: [] },
          staff: { nodes: [] },
          studios: { nodes: [] },
        },
      },
    });
    const client = newClient();
    const favs = await client.getUserFavorites("TestUser", { perPage: 50 });
    expect(favs.anime).toEqual([]);
  });
});

// ── Metadata methods ──

describe("Metadata methods", () => {
  const originalFetch = globalThis.fetch;
  afterEach(() => {
    globalThis.fetch = originalFetch;
  });

  it("getGenres returns genre list", async () => {
    mockFetch({ GenreCollection: ["Action", "Adventure", "Comedy"] });
    const client = newClient();
    const genres = await client.getGenres();
    expect(genres).toEqual(["Action", "Adventure", "Comedy"]);
  });

  it("getTags returns tag list", async () => {
    const mockTags = [
      {
        id: 1,
        name: "Mecha",
        description: "Robots",
        category: "Theme",
        rank: 90,
        isGeneralSpoiler: false,
        isMediaSpoiler: false,
        isAdult: false,
      },
    ];
    mockFetch({ MediaTagCollection: mockTags });
    const client = newClient();
    const tags = await client.getTags();
    expect(tags).toHaveLength(1);
    expect(tags[0].name).toBe("Mecha");
  });
});

// ── Raw query ──

describe("raw query", () => {
  const originalFetch = globalThis.fetch;
  afterEach(() => {
    globalThis.fetch = originalFetch;
  });

  it("executes an arbitrary GraphQL query", async () => {
    mockFetch({ Media: mockMedia });
    const client = newClient();
    const result = await client.raw<{ Media: typeof mockMedia }>("query { Media(id: 1) { id } }");
    expect(result.Media.id).toBe(1);
  });
});

// ── Batch queries (character + staff) ──

describe("Batch queries", () => {
  const originalFetch = globalThis.fetch;
  afterEach(() => {
    globalThis.fetch = originalFetch;
  });

  it("getCharacterBatch with empty array returns empty", async () => {
    const client = newClient();
    const results = await client.getCharacterBatch([]);
    expect(results).toHaveLength(0);
  });

  it("getCharacterBatch with single ID falls back to getCharacter", async () => {
    mockFetch({ Character: mockCharacter });
    const client = newClient();
    const results = await client.getCharacterBatch([1]);
    expect(results).toHaveLength(1);
    expect(results[0].id).toBe(1);
  });

  it("getCharacterBatch with multiple IDs", async () => {
    const c0 = { ...mockCharacter, id: 1 };
    const c1 = { ...mockCharacter, id: 2, name: { ...mockCharacter.name, full: "Faye Valentine" } };
    mockFetch({ c0, c1 });
    const client = newClient();
    const results = await client.getCharacterBatch([1, 2]);
    expect(results).toHaveLength(2);
  });

  it("getStaffBatch with empty array returns empty", async () => {
    const client = newClient();
    const results = await client.getStaffBatch([]);
    expect(results).toHaveLength(0);
  });

  it("getStaffBatch with single ID falls back to getStaff", async () => {
    mockFetch({ Staff: mockStaff });
    const client = newClient();
    const results = await client.getStaffBatch([95001]);
    expect(results).toHaveLength(1);
    expect(results[0].id).toBe(95001);
  });

  it("getStaffBatch with multiple IDs", async () => {
    const s0 = { ...mockStaff, id: 1 };
    const s1 = { ...mockStaff, id: 2 };
    mockFetch({ s0, s1 });
    const client = newClient();
    const results = await client.getStaffBatch([1, 2]);
    expect(results).toHaveLength(2);
  });
});

// ── Cache & destroy ──

describe("Cache and lifecycle", () => {
  const originalFetch = globalThis.fetch;
  afterEach(() => {
    globalThis.fetch = originalFetch;
  });

  it("invalidateCache with string pattern", async () => {
    mockFetch({ Media: mockMedia });
    const client = new AniListClient({ rateLimit: { enabled: false } });

    await client.getMedia(1);
    const removed = await client.invalidateCache("Media");
    expect(removed).toBeGreaterThan(0);
  });

  it("destroy clears cache and disposes rate limiter", async () => {
    mockFetch({ Media: mockMedia });
    const client = new AniListClient({ rateLimit: { enabled: false } });

    await client.getMedia(1);
    expect(await client.cacheSize()).toBeGreaterThan(0);

    await client.destroy();
    expect(await client.cacheSize()).toBe(0);
  });
});

// ── Paginator ──

describe("paginate", () => {
  const originalFetch = globalThis.fetch;
  afterEach(() => {
    globalThis.fetch = originalFetch;
  });

  it("iterates across multiple pages", async () => {
    let page = 0;
    globalThis.fetch = vi.fn(() => {
      page++;
      const hasNextPage = page < 3;
      return Promise.resolve(
        new Response(
          JSON.stringify({
            data: {
              Page: {
                pageInfo: { total: 3, perPage: 1, currentPage: page, lastPage: 3, hasNextPage },
                media: [{ ...mockMedia, id: page }],
              },
            },
          }),
          { status: 200 },
        ),
      );
    });

    const client = new AniListClient({ cache: { enabled: false }, rateLimit: { enabled: false } });
    const items: unknown[] = [];
    for await (const item of client.paginate((p) => client.searchMedia({ page: p, perPage: 1 }))) {
      items.push(item);
    }
    expect(items).toHaveLength(3);
  });

  it("respects maxPages limit", async () => {
    let page = 0;
    globalThis.fetch = vi.fn(() => {
      page++;
      return Promise.resolve(
        new Response(
          JSON.stringify({
            data: {
              Page: {
                pageInfo: { total: 100, perPage: 1, currentPage: page, lastPage: 100, hasNextPage: true },
                media: [{ ...mockMedia, id: page }],
              },
            },
          }),
          { status: 200 },
        ),
      );
    });

    const client = new AniListClient({ cache: { enabled: false }, rateLimit: { enabled: false } });
    const items: unknown[] = [];
    for await (const item of client.paginate((p) => client.searchMedia({ page: p, perPage: 1 }), 2)) {
      items.push(item);
    }
    expect(items).toHaveLength(2);
  });
});

// ── Review ──

describe("Review methods", () => {
  const originalFetch = globalThis.fetch;
  afterEach(() => {
    globalThis.fetch = originalFetch;
  });

  it("getReview fetches a review by ID", async () => {
    mockFetch({ Review: mockReview });
    const client = newClient();
    const review = await client.getReview(1);
    expect(review.id).toBe(1);
    expect(review.summary).toBe("Great anime!");
  });

  it("getReview rejects invalid ID", async () => {
    const client = newClient();
    await expect(client.getReview(-1)).rejects.toThrow(RangeError);
    await expect(client.getReview(0)).rejects.toThrow(RangeError);
  });

  it("searchReviews returns paged results", async () => {
    mockPagedFetch("reviews", [mockReview]);
    const client = newClient();
    const result = await client.searchReviews();
    expect(result.results).toHaveLength(1);
    expect(result.results[0].summary).toBe("Great anime!");
  });

  it("searchReviews with mediaId filter", async () => {
    mockPagedFetch("reviews", [mockReview]);
    const client = newClient();
    const result = await client.searchReviews({ mediaId: 1, page: 1, perPage: 5 });
    expect(result.results).toHaveLength(1);
  });

  it("searchReviews with userId filter", async () => {
    mockPagedFetch("reviews", [mockReview]);
    const client = newClient();
    const result = await client.searchReviews({ userId: 1, sort: ["SCORE_DESC"] });
    expect(result.results).toHaveLength(1);
  });
});
