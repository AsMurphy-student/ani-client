/**
 * Quick smoke test — run with: pnpm test
 * Hits the real AniList API (no mock).
 */

import { AniListClient, MediaType, MediaSeason, MediaListStatus, RecommendationSort, AniListError } from "../src";

const client = new AniListClient();

async function run() {
  let passed = 0;
  let failed = 0;

  async function test(name: string, fn: () => Promise<void>) {
    try {
      await fn();
      console.log(`  ✓ ${name}`);
      passed++;
    } catch (err) {
      console.error(`  ✗ ${name}`);
      console.error(`    ${err instanceof Error ? err.message : err}`);
      failed++;
    }
  }

  function assert(condition: boolean, msg: string) {
    if (!condition) throw new Error(`Assertion failed: ${msg}`);
  }

  console.log("\n🧪 ani-client tests\n");

  // ── Media ──
  console.log("Media:");

  await test("getMedia(1) returns Cowboy Bebop", async () => {
    const media = await client.getMedia(1);
    assert(media.id === 1, "id should be 1");
    assert(media.title.romaji === "Cowboy Bebop", `expected Cowboy Bebop, got ${media.title.romaji}`);
    assert(media.type === MediaType.ANIME, "type should be ANIME");
    assert(Array.isArray(media.genres), "genres should be an array");
  });

  await test("searchMedia({ query: 'Naruto', type: ANIME })", async () => {
    const result = await client.searchMedia({ query: "Naruto", type: MediaType.ANIME, perPage: 3 });
    assert(result.results.length > 0, "should return at least 1 result");
    assert(result.pageInfo.currentPage === 1, "should be page 1");
    assert(
      result.results.some(
        (m) =>
          m.title.romaji?.toLowerCase().includes("naruto") ||
          m.title.english?.toLowerCase().includes("naruto") ||
          m.title.native?.includes("ナルト")
      ),
      "should contain Naruto in at least one title field",
    );
  });

  await test("searchMedia({ type: MANGA, perPage: 2 })", async () => {
    const result = await client.searchMedia({ type: MediaType.MANGA, perPage: 2 });
    assert(result.results.length > 0, "should return manga results");
    assert(result.results.every((m) => m.type === MediaType.MANGA), "all should be MANGA");
  });

  await test("getTrending(ANIME)", async () => {
    const result = await client.getTrending(MediaType.ANIME, 1, 5);
    assert(result.results.length > 0, "should return trending anime");
    assert(result.pageInfo.hasNextPage !== null, "pageInfo should exist");
  });

  // ── Characters ──
  console.log("\nCharacters:");

  await test("getCharacter(1) returns Spike Spiegel", async () => {
    const char = await client.getCharacter(1);
    assert(char.id === 1, "id should be 1");
    assert(char.name.full !== null, "should have a name");
  });

  await test("searchCharacters({ query: 'Luffy' })", async () => {
    const result = await client.searchCharacters({ query: "Luffy", perPage: 3 });
    assert(result.results.length > 0, "should return at least 1 character");
    assert(result.results.some((c) => c.name.full?.includes("Luffy")), "should contain Luffy");
  });

  // ── Staff ──
  console.log("\nStaff:");

  await test("getStaff(95001)", async () => {
    const staff = await client.getStaff(95001);
    assert(staff.id === 95001, "id should match");
    assert(staff.name.full !== null, "should have a name");
  });

  await test("searchStaff({ query: 'Miyazaki' })", async () => {
    const result = await client.searchStaff({ query: "Miyazaki", perPage: 3 });
    assert(result.results.length > 0, "should return at least 1 staff");
  });

  // ── Users ──
  console.log("\nUsers:");

  await test("getUser via getUserByName('AniList') then getUser(id)", async () => {
    const userByName = await client.getUserByName("AniList");
    const userById = await client.getUser(userByName.id);
    assert(userById.id === userByName.id, "IDs should match");
    assert(userById.name.toLowerCase() === "anilist", "name should be AniList");
  });

  await test("getUserByName('AniList')", async () => {
    const user = await client.getUserByName("AniList");
    assert(user.name.toLowerCase() === "anilist", "name should be AniList");
  });

  // ── Airing / Chapters / Planning ──
  console.log("\nAiring / Chapters / Planning:");

  await test("getAiredEpisodes() returns recently aired episodes", async () => {
    const result = await client.getAiredEpisodes({ perPage: 5 });
    assert(Array.isArray(result.results), "results should be an array");
    assert(result.pageInfo !== undefined, "pageInfo should exist");
    if (result.results.length > 0) {
      assert(typeof result.results[0].episode === "number", "episode should be a number");
      assert(result.results[0].media !== undefined, "media should be present");
    }
  });

  await test("getAiredEpisodes() with custom time range", async () => {
    const now = Math.floor(Date.now() / 1000);
    const result = await client.getAiredEpisodes({
      airingAtGreater: now - 7 * 24 * 3600,
      airingAtLesser: now,
      perPage: 3,
    });
    assert(Array.isArray(result.results), "results should be an array");
    assert(result.results.length > 0, "should have episodes aired in the last 7 days");
  });

  await test("getAiredChapters() returns recently updated manga", async () => {
    const result = await client.getAiredChapters({ perPage: 5 });
    assert(result.results.length > 0, "should return at least 1 manga");
    assert(result.results.every((m) => m.type === "MANGA"), "all should be MANGA");
  });

  await test("getPlanning() returns upcoming media", async () => {
    const result = await client.getPlanning({ perPage: 5 });
    assert(result.results.length > 0, "should return at least 1 planned media");
    assert(
      result.results.every((m) => m.status === "NOT_YET_RELEASED"),
      "all should be NOT_YET_RELEASED",
    );
  });

  await test("getPlanning({ type: ANIME })", async () => {
    const result = await client.getPlanning({ type: MediaType.ANIME, perPage: 5 });
    assert(result.results.length > 0, "should return at least 1 planned anime");
    assert(result.results.every((m) => m.type === "ANIME"), "all should be ANIME");
  });

  // ── Season ──
  console.log("\nSeason:");

  await test("getMediaBySeason({ season: WINTER, seasonYear: 2025 })", async () => {
    const result = await client.getMediaBySeason({
      season: MediaSeason.WINTER,
      seasonYear: 2025,
      perPage: 5,
    });
    assert(result.results.length > 0, "should return at least 1 anime");
    assert(result.pageInfo.currentPage === 1, "should be page 1");
    assert(
      result.results.every((m) => m.season === "WINTER" && m.seasonYear === 2025),
      "all should be WINTER 2025",
    );
  });

  await test("getMediaBySeason({ season: SPRING, seasonYear: 2025, type: MANGA })", async () => {
    const result = await client.getMediaBySeason({
      season: MediaSeason.SPRING,
      seasonYear: 2025,
      type: MediaType.MANGA,
      perPage: 3,
    });
    assert(Array.isArray(result.results), "results should be an array");
    assert(result.pageInfo !== undefined, "pageInfo should exist");
  });

  // ── User Media List ──
  console.log("\nUser Media List:");

  await test("getUserMediaList({ userName: 'AniList', type: ANIME })", async () => {
    const result = await client.getUserMediaList({
      userName: "AniList",
      type: MediaType.ANIME,
      perPage: 5,
    });
    assert(Array.isArray(result.results), "results should be an array");
    assert(result.pageInfo !== undefined, "pageInfo should exist");
    if (result.results.length > 0) {
      assert(result.results[0].media !== undefined, "each entry should have media");
      assert(typeof result.results[0].mediaId === "number", "mediaId should be a number");
    }
  });

  await test("getUserMediaList with status filter", async () => {
    const result = await client.getUserMediaList({
      userName: "AniList",
      type: MediaType.ANIME,
      status: MediaListStatus.COMPLETED,
      perPage: 3,
    });
    assert(Array.isArray(result.results), "results should be an array");
    if (result.results.length > 0) {
      assert(
        result.results.every((e) => e.status === "COMPLETED"),
        "all entries should be COMPLETED",
      );
    }
  });

  await test("getUserMediaList throws without userId or userName", async () => {
    try {
      await client.getUserMediaList({ type: MediaType.ANIME } as any);
      throw new Error("Should have thrown");
    } catch (err: any) {
      assert(
        err.message.includes("userId") || err.message.includes("userName"),
        "should mention userId or userName",
      );
    }
  });

  // ── Recommendations ──
  console.log("\nRecommendations:");

  await test("getRecommendations(1) returns recommendations for Cowboy Bebop", async () => {
    const result = await client.getRecommendations(1);
    assert(Array.isArray(result.results), "results should be an array");
    assert(result.pageInfo !== undefined, "pageInfo should exist");
    if (result.results.length > 0) {
      assert(
        result.results[0].mediaRecommendation !== undefined,
        "should have mediaRecommendation",
      );
      assert(
        typeof result.results[0].mediaRecommendation.id === "number",
        "recommended media should have an id",
      );
    }
  });

  await test("getRecommendations with pagination", async () => {
    const result = await client.getRecommendations(20, { perPage: 3 });
    assert(Array.isArray(result.results), "results should be an array");
    assert(result.results.length <= 3, "should respect perPage limit");
  });

  // ── Relations ──
  console.log("\nRelations:");

  await test("getMedia(1) includes relations", async () => {
    client.clearCache();
    const media = await client.getMedia(1);
    assert(media.relations !== null && media.relations !== undefined, "relations should exist");
    assert(Array.isArray(media.relations.edges), "relations.edges should be an array");
    if (media.relations.edges.length > 0) {
      const edge = media.relations.edges[0];
      assert(typeof edge.relationType === "string", "relationType should be a string");
      assert(typeof edge.node.id === "number", "related media should have an id");
    }
  });

  // ── Studios ──
  console.log("\nStudios:");

  await test("getStudio(1) returns a studio", async () => {
    const studio = await client.getStudio(1);
    assert(studio.id === 1, "id should be 1");
    assert(typeof studio.name === "string", "should have a name");
    assert(typeof studio.isAnimationStudio === "boolean", "should have isAnimationStudio");
  });

  await test("searchStudios({ query: 'MAPPA' })", async () => {
    const result = await client.searchStudios({ query: "MAPPA", perPage: 3 });
    assert(result.results.length > 0, "should return at least 1 studio");
    assert(
      result.results.some((s) => s.name.toUpperCase().includes("MAPPA")),
      "should contain MAPPA",
    );
  });

  // ── Genres & Tags ──
  console.log("\nGenres & Tags:");

  await test("getGenres() returns genre list", async () => {
    const genres = await client.getGenres();
    assert(Array.isArray(genres), "should be an array");
    assert(genres.length > 0, "should have at least 1 genre");
    assert(genres.includes("Action"), "should include Action");
  });

  await test("getTags() returns tag list", async () => {
    const tags = await client.getTags();
    assert(Array.isArray(tags), "should be an array");
    assert(tags.length > 0, "should have at least 1 tag");
    assert(typeof tags[0].id === "number", "tag should have an id");
    assert(typeof tags[0].name === "string", "tag should have a name");
  });

  // ── Paginate (async iterator) ──
  console.log("\nPaginate:");

  await test("paginate() iterates across pages", async () => {
    const items: string[] = [];
    for await (const anime of client.paginate(
      (page) => client.getTrending("ANIME" as any, page, 3),
      2,
    )) {
      items.push(anime.title.romaji ?? "?");
    }
    assert(items.length > 3, "should yield items across multiple pages");
    assert(items.length <= 6, "should stop after maxPages (2 × 3)");
  });

  // ── Error handling ──
  console.log("\nError handling:");

  await test("getMedia(999999999) throws AniListError", async () => {
    try {
      await client.getMedia(999999999);
      throw new Error("Should have thrown");
    } catch (err: any) {
      assert(err instanceof AniListError, "should be AniListError");
      assert(typeof err.status === "number", "should have status");
    }
  });

  // ── Raw query ──
  console.log("\nRaw query:");

  await test("raw() custom query", async () => {
    const data = await client.raw<{ Media: { id: number; title: { romaji: string } } }>(
      `query { Media(id: 1) { id title { romaji } } }`
    );
    assert(data.Media.id === 1, "should return media with id 1");
  });

  // ── Cache ──
  console.log("\nCache:");

  await test("cache returns same result without extra API call", async () => {
    const first = await client.getMedia(1);
    const cacheAfterFirst = client.cacheSize;
    const second = await client.getMedia(1);
    assert(first.id === second.id, "should return same data");
    assert(cacheAfterFirst > 0, "cache should have entries");
    assert(client.cacheSize === cacheAfterFirst, "cache size should not increase on cache hit");
  });

  await test("clearCache() empties the cache", async () => {
    assert(client.cacheSize > 0, "cache should have entries before clear");
    client.clearCache();
    assert(client.cacheSize === 0, "cache should be empty after clear");
  });

  await test("cache disabled returns fresh data each time", async () => {
    const noCacheClient = new AniListClient({ cache: { enabled: false } });
    await noCacheClient.getMedia(1);
    assert(noCacheClient.cacheSize === 0, "cache should stay empty when disabled");
  });

  // ── Summary ──
  console.log(`\n${passed + failed} tests — ${passed} passed, ${failed} failed\n`);
  process.exit(failed > 0 ? 1 : 0);
}

run();
