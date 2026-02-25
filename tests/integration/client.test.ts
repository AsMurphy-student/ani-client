/**
 * Integration tests — run with: pnpm test:integration
 * Hits the real AniList API (no mock).
 */
import { describe, expect, it } from "vitest";
import { AniListClient, AniListError, MediaListStatus, MediaSeason, MediaType } from "../../src";

const client = new AniListClient();

describe("AniListClient (integration)", () => {
  // ── Media ──

  describe("Media", () => {
    it("getMedia(1) returns Cowboy Bebop", async () => {
      const media = await client.getMedia(1);
      expect(media.id).toBe(1);
      expect(media.title.romaji).toBe("Cowboy Bebop");
      expect(media.type).toBe(MediaType.ANIME);
      expect(Array.isArray(media.genres)).toBe(true);
    });

    it("searchMedia({ query: 'Naruto', type: ANIME })", async () => {
      const result = await client.searchMedia({ query: "Naruto", type: MediaType.ANIME, perPage: 3 });
      expect(result.results.length).toBeGreaterThan(0);
      expect(result.pageInfo.currentPage).toBe(1);
      expect(
        result.results.some(
          (m) =>
            m.title.romaji?.toLowerCase().includes("naruto") ||
            m.title.english?.toLowerCase().includes("naruto") ||
            m.title.native?.includes("ナルト"),
        ),
      ).toBe(true);
    });

    it("searchMedia({ type: MANGA, perPage: 2 })", async () => {
      const result = await client.searchMedia({ type: MediaType.MANGA, perPage: 2 });
      expect(result.results.length).toBeGreaterThan(0);
      expect(result.results.every((m) => m.type === MediaType.MANGA)).toBe(true);
    });

    it("getTrending(ANIME)", async () => {
      const result = await client.getTrending(MediaType.ANIME, 1, 5);
      expect(result.results.length).toBeGreaterThan(0);
      expect(result.pageInfo.hasNextPage).not.toBeNull();
    });

    it("getPopular(ANIME)", async () => {
      const result = await client.getPopular(MediaType.ANIME, 1, 5);
      expect(result.results.length).toBeGreaterThan(0);
    });

    it("getTopRated(ANIME)", async () => {
      const result = await client.getTopRated(MediaType.ANIME, 1, 5);
      expect(result.results.length).toBeGreaterThan(0);
    });
  });

  // ── Characters ──

  describe("Characters", () => {
    it("getCharacter(1) returns Spike Spiegel", async () => {
      const char = await client.getCharacter(1);
      expect(char.id).toBe(1);
      expect(char.name.full).not.toBeNull();
    });

    it("searchCharacters({ query: 'Luffy' })", async () => {
      const result = await client.searchCharacters({ query: "Luffy", perPage: 3 });
      expect(result.results.length).toBeGreaterThan(0);
      expect(result.results.some((c) => c.name.full?.includes("Luffy"))).toBe(true);
    });

    it("getCharacter(1, { voiceActors: true }) returns voice actors", async () => {
      await client.clearCache();
      const char = await client.getCharacter(1, { voiceActors: true });
      expect(char.id).toBe(1);
      expect(char.media).not.toBeNull();
      expect(Array.isArray(char.media?.edges)).toBe(true);
      if (char.media?.edges && char.media.edges.length > 0) {
        const edge = char.media.edges[0];
        expect(typeof edge.node.id).toBe("number");
        expect(Array.isArray(edge.voiceActors)).toBe(true);
        if (edge.voiceActors && edge.voiceActors.length > 0) {
          const va = edge.voiceActors[0];
          expect(typeof va.id).toBe("number");
          expect(typeof va.name.full).toBe("string");
        }
      }
    });

    it("searchCharacters({ query: 'Luffy', voiceActors: true })", async () => {
      await client.clearCache();
      const result = await client.searchCharacters({ query: "Luffy", perPage: 1, voiceActors: true });
      expect(result.results.length).toBeGreaterThan(0);
      expect(Array.isArray(result.results[0].media?.edges)).toBe(true);
    });
  });

  // ── Staff ──

  describe("Staff", () => {
    it("getStaff(95001)", async () => {
      const staff = await client.getStaff(95001);
      expect(staff.id).toBe(95001);
      expect(staff.name.full).not.toBeNull();
    });

    it("getStaff(95001, { media: true })", async () => {
      await client.clearCache();
      const staff = await client.getStaff(95001, { media: true });
      expect(staff.id).toBe(95001);
      expect(staff.staffMedia).toBeDefined();
      expect(Array.isArray(staff.staffMedia?.nodes)).toBe(true);
      if (staff.staffMedia && staff.staffMedia.nodes.length > 0) {
        const m = staff.staffMedia.nodes[0];
        expect(typeof m.id).toBe("number");
        expect(m.title).toBeDefined();
      }
    });

    it("searchStaff({ query: 'Miyazaki' })", async () => {
      const result = await client.searchStaff({ query: "Miyazaki", perPage: 3 });
      expect(result.results.length).toBeGreaterThan(0);
    });
  });

  // ── Users ──

  describe("Users", () => {
    it("getUser with ID and name", async () => {
      const userByName = await client.getUser("AniList");
      const userById = await client.getUser(userByName.id);
      expect(userById.id).toBe(userByName.id);
      expect(userById.name.toLowerCase()).toBe("anilist");
    });

    it("getUserByName('AniList') (deprecated alias)", async () => {
      const user = await client.getUserByName("AniList");
      expect(user.name.toLowerCase()).toBe("anilist");
    });

    it("searchUsers({ query: 'AniList' })", async () => {
      const result = await client.searchUsers({ query: "AniList", perPage: 5 });
      expect(result.results.length).toBeGreaterThan(0);
      expect(result.results.some((u) => u.name.toLowerCase().includes("anilist"))).toBe(true);
    });
  });

  // ── Airing / Chapters / Planning ──

  describe("Airing / Chapters / Planning", () => {
    it("getAiredEpisodes() returns recently aired episodes", async () => {
      const result = await client.getAiredEpisodes({ perPage: 5 });
      expect(Array.isArray(result.results)).toBe(true);
      expect(result.pageInfo).toBeDefined();
      if (result.results.length > 0) {
        expect(typeof result.results[0].episode).toBe("number");
        expect(result.results[0].media).toBeDefined();
      }
    });

    it("getAiredEpisodes() with custom time range", async () => {
      const now = Math.floor(Date.now() / 1000);
      const result = await client.getAiredEpisodes({
        airingAtGreater: now - 7 * 24 * 3600,
        airingAtLesser: now,
        perPage: 3,
      });
      expect(Array.isArray(result.results)).toBe(true);
      expect(result.results.length).toBeGreaterThan(0);
    });

    it("getAiredChapters() returns recently updated manga", async () => {
      const result = await client.getAiredChapters({ perPage: 5 });
      expect(result.results.length).toBeGreaterThan(0);
      expect(result.results.every((m) => m.type === "MANGA")).toBe(true);
    });

    it("getPlanning() returns upcoming media", async () => {
      const result = await client.getPlanning({ perPage: 5 });
      expect(result.results.length).toBeGreaterThan(0);
      expect(result.results.every((m) => m.status === "NOT_YET_RELEASED")).toBe(true);
    });

    it("getPlanning({ type: ANIME })", async () => {
      const result = await client.getPlanning({ type: MediaType.ANIME, perPage: 5 });
      expect(result.results.length).toBeGreaterThan(0);
      expect(result.results.every((m) => m.type === "ANIME")).toBe(true);
    });
  });

  // ── Season ──

  describe("Season", () => {
    it("getMediaBySeason({ season: WINTER, seasonYear: 2025 })", async () => {
      const result = await client.getMediaBySeason({
        season: MediaSeason.WINTER,
        seasonYear: 2025,
        perPage: 5,
      });
      expect(result.results.length).toBeGreaterThan(0);
      expect(result.pageInfo.currentPage).toBe(1);
      expect(result.results.every((m) => m.season === "WINTER" && m.seasonYear === 2025)).toBe(true);
    });

    it("getMediaBySeason({ season: SPRING, seasonYear: 2025, type: MANGA })", async () => {
      const result = await client.getMediaBySeason({
        season: MediaSeason.SPRING,
        seasonYear: 2025,
        type: MediaType.MANGA,
        perPage: 3,
      });
      expect(Array.isArray(result.results)).toBe(true);
      expect(result.pageInfo).toBeDefined();
    });
  });

  // ── User Media List ──

  describe("User Media List", () => {
    it("getUserMediaList({ userName: 'AniList', type: ANIME })", async () => {
      const result = await client.getUserMediaList({
        userName: "AniList",
        type: MediaType.ANIME,
        perPage: 5,
      });
      expect(Array.isArray(result.results)).toBe(true);
      expect(result.pageInfo).toBeDefined();
      if (result.results.length > 0) {
        expect(result.results[0].media).toBeDefined();
        expect(typeof result.results[0].mediaId).toBe("number");
      }
    });

    it("getUserMediaList with status filter", async () => {
      const result = await client.getUserMediaList({
        userName: "AniList",
        type: MediaType.ANIME,
        status: MediaListStatus.COMPLETED,
        perPage: 3,
      });
      expect(Array.isArray(result.results)).toBe(true);
      if (result.results.length > 0) {
        expect(result.results.every((e) => e.status === "COMPLETED")).toBe(true);
      }
    });

    it("getUserMediaList throws without userId or userName", async () => {
      await expect(
        // biome-ignore lint/suspicious/noExplicitAny: intentionally testing invalid input
        client.getUserMediaList({ type: MediaType.ANIME } as any),
      ).rejects.toThrow(/userId|userName/);
    });
  });

  // ── Recommendations ──

  describe("Recommendations", () => {
    it("getRecommendations(1) returns recommendations for Cowboy Bebop", async () => {
      const result = await client.getRecommendations(1);
      expect(Array.isArray(result.results)).toBe(true);
      expect(result.pageInfo).toBeDefined();
      if (result.results.length > 0) {
        expect(result.results[0].mediaRecommendation).toBeDefined();
        expect(typeof result.results[0].mediaRecommendation.id).toBe("number");
      }
    });

    it("getRecommendations with pagination", async () => {
      const result = await client.getRecommendations(20, { perPage: 3 });
      expect(Array.isArray(result.results)).toBe(true);
      expect(result.results.length).toBeLessThanOrEqual(3);
    });
  });

  // ── Voice Actors ──

  describe("Voice Actors", () => {
    it("getMedia(1, { characters: { voiceActors: true } }) returns voice actors", async () => {
      await client.clearCache();
      const media = await client.getMedia(1, { characters: { voiceActors: true } });
      expect(media.characters).toBeDefined();
      expect(Array.isArray(media.characters?.edges)).toBe(true);
      if (media.characters && media.characters.edges.length > 0) {
        const edge = media.characters.edges[0];
        expect(typeof edge.role).toBe("string");
        expect(typeof edge.node.id).toBe("number");
        expect(Array.isArray(edge.voiceActors)).toBe(true);
        if (edge.voiceActors && edge.voiceActors.length > 0) {
          const va = edge.voiceActors[0];
          expect(typeof va.id).toBe("number");
          expect(typeof va.name.full).toBe("string");
          expect(typeof va.languageV2).toBe("string");
        }
      }
    });
  });

  // ── Relations ──

  describe("Relations", () => {
    it("getMedia(1) includes relations", async () => {
      await client.clearCache();
      const media = await client.getMedia(1);
      expect(media.relations).not.toBeNull();
      expect(Array.isArray(media.relations?.edges)).toBe(true);
      if (media.relations && media.relations.edges.length > 0) {
        const edge = media.relations.edges[0];
        expect(typeof edge.relationType).toBe("string");
        expect(typeof edge.node.id).toBe("number");
      }
    });
  });

  // ── Studios ──

  describe("Studios", () => {
    it("getStudio(1) returns a studio", async () => {
      const studio = await client.getStudio(1);
      expect(studio.id).toBe(1);
      expect(typeof studio.name).toBe("string");
      expect(typeof studio.isAnimationStudio).toBe("boolean");
    });

    it("searchStudios({ query: 'MAPPA' })", async () => {
      const result = await client.searchStudios({ query: "MAPPA", perPage: 3 });
      expect(result.results.length).toBeGreaterThan(0);
      expect(result.results.some((s) => s.name.toUpperCase().includes("MAPPA"))).toBe(true);
    });
  });

  // ── Genres & Tags ──

  describe("Genres & Tags", () => {
    it("getGenres() returns genre list", async () => {
      const genres = await client.getGenres();
      expect(Array.isArray(genres)).toBe(true);
      expect(genres.length).toBeGreaterThan(0);
      expect(genres).toContain("Action");
    });

    it("getTags() returns tag list", async () => {
      const tags = await client.getTags();
      expect(Array.isArray(tags)).toBe(true);
      expect(tags.length).toBeGreaterThan(0);
      expect(typeof tags[0].id).toBe("number");
      expect(typeof tags[0].name).toBe("string");
    });
  });

  // ── Paginate ──

  describe("Paginate", () => {
    it("paginate() iterates across pages", async () => {
      const items: string[] = [];
      for await (const anime of client.paginate((page) => client.getTrending(MediaType.ANIME, page, 3), 2)) {
        items.push(anime.title.romaji ?? "?");
      }
      expect(items.length).toBeGreaterThan(3);
      expect(items.length).toBeLessThanOrEqual(6);
    });
  });

  // ── Error handling ──

  describe("Error handling", () => {
    it("getMedia(999999999) throws AniListError", async () => {
      await expect(client.getMedia(999999999)).rejects.toBeInstanceOf(AniListError);
    });
  });

  // ── Raw query ──

  describe("Raw query", () => {
    it("raw() custom query", async () => {
      const data = await client.raw<{ Media: { id: number; title: { romaji: string } } }>(
        "query { Media(id: 1) { id title { romaji } } }",
      );
      expect(data.Media.id).toBe(1);
    });
  });

  // ── Cache ──

  describe("Cache", () => {
    it("cache returns same result without extra API call", async () => {
      const first = await client.getMedia(1);
      const cacheAfterFirst = client.cacheSize;
      const second = await client.getMedia(1);
      expect(first.id).toBe(second.id);
      expect(cacheAfterFirst).toBeGreaterThan(0);
      expect(client.cacheSize).toBe(cacheAfterFirst);
    });

    it("clearCache() empties the cache", async () => {
      expect(client.cacheSize).toBeGreaterThan(0);
      await client.clearCache();
      expect(client.cacheSize).toBe(0);
    });

    it("cache disabled returns fresh data each time", async () => {
      const noCacheClient = new AniListClient({ cache: { enabled: false } });
      await noCacheClient.getMedia(1);
      expect(noCacheClient.cacheSize).toBe(0);
    });
  });

  // ── Destroy ──

  describe("Destroy", () => {
    it("destroy() clears cache and in-flight requests", async () => {
      const c = new AniListClient();
      await c.getMedia(1);
      expect(c.cacheSize).toBeGreaterThan(0);
      await c.destroy();
      expect(c.cacheSize).toBe(0);
    });
  });
});
