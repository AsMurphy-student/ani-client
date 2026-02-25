import {
  QUERY_AIRING_SCHEDULE,
  QUERY_CHARACTER_BY_ID,
  QUERY_CHARACTER_BY_ID_WITH_VA,
  QUERY_CHARACTER_SEARCH,
  QUERY_CHARACTER_SEARCH_WITH_VA,
  QUERY_GENRES,
  QUERY_MEDIA_BY_ID,
  QUERY_MEDIA_BY_SEASON,
  QUERY_MEDIA_SEARCH,
  QUERY_PLANNING,
  QUERY_RECENT_CHAPTERS,
  QUERY_RECOMMENDATIONS,
  QUERY_STAFF_BY_ID,
  QUERY_STAFF_BY_ID_WITH_MEDIA,
  QUERY_STAFF_SEARCH,
  QUERY_STUDIO_BY_ID,
  QUERY_STUDIO_SEARCH,
  QUERY_TAGS,
  QUERY_TRENDING,
  QUERY_USER_BY_ID,
  QUERY_USER_BY_NAME,
  QUERY_USER_MEDIA_LIST,
  QUERY_USER_SEARCH,
  buildBatchCharacterQuery,
  buildBatchMediaQuery,
  buildBatchStaffQuery,
  buildMediaByIdQuery,
} from "../queries";

import { MemoryCache } from "../cache";
import { AniListError } from "../errors";
import { RateLimiter } from "../rate-limiter";

import { MediaSort, MediaType } from "../types";
import type {
  AiringSchedule,
  AniListClientOptions,
  AniListHooks,
  CacheAdapter,
  Character,
  CharacterIncludeOptions,
  GetAiringOptions,
  GetPlanningOptions,
  GetRecentChaptersOptions,
  GetRecommendationsOptions,
  GetSeasonOptions,
  GetUserMediaListOptions,
  Media,
  MediaIncludeOptions,
  MediaListEntry,
  MediaTag,
  PageInfo,
  PagedResult,
  Recommendation,
  SearchCharacterOptions,
  SearchMediaOptions,
  SearchStaffOptions,
  SearchStudioOptions,
  SearchUserOptions,
  Staff,
  StaffIncludeOptions,
  Studio,
  User,
} from "../types";

import { chunk, clampPerPage, normalizeQuery } from "../utils";

const DEFAULT_API_URL = "https://graphql.anilist.co";

/**
 * Lightweight AniList GraphQL client with built-in caching and rate limiting.
 *
 * @example
 * ```ts
 * import { AniListClient } from "ani-client";
 *
 * const client = new AniListClient();
 * const anime = await client.getMedia(1); // Cowboy Bebop
 * console.log(anime.title.romaji);
 *
 * // Custom cache & rate limit options
 * const client2 = new AniListClient({
 *   cache: { ttl: 1000 * 60 * 60 }, // 1 hour cache
 *   rateLimit: { maxRequests: 60 },
 * });
 * ```
 */
export class AniListClient {
  private readonly apiUrl: string;
  private readonly headers: Record<string, string>;
  private readonly cacheAdapter: CacheAdapter;
  private readonly rateLimiter: RateLimiter;
  private readonly hooks: AniListHooks;
  private readonly inFlight = new Map<string, Promise<unknown>>();

  constructor(options: AniListClientOptions = {}) {
    this.apiUrl = options.apiUrl ?? DEFAULT_API_URL;
    this.headers = {
      "Content-Type": "application/json",
      Accept: "application/json",
    };
    if (options.token) {
      this.headers.Authorization = `Bearer ${options.token}`;
    }
    this.cacheAdapter = options.cacheAdapter ?? new MemoryCache(options.cache);
    this.rateLimiter = new RateLimiter(options.rateLimit);
    this.hooks = options.hooks ?? {};
  }

  /**
   * @internal
   */
  private async request<T>(query: string, variables: Record<string, unknown> = {}): Promise<T> {
    const cacheKey = MemoryCache.key(query, variables);

    // Check cache (await handles both sync and async adapters)
    const cached = await this.cacheAdapter.get<T>(cacheKey);
    if (cached !== undefined) {
      this.hooks.onCacheHit?.(cacheKey);
      this.hooks.onResponse?.(query, 0, true);
      return cached;
    }

    // Request deduplication — reuse in-flight request for the same key
    const existing = this.inFlight.get(cacheKey);
    if (existing) return existing as Promise<T>;

    const promise = this.executeRequest<T>(query, variables, cacheKey);
    this.inFlight.set(cacheKey, promise);

    try {
      return await promise;
    } finally {
      this.inFlight.delete(cacheKey);
    }
  }

  /** @internal */
  private async executeRequest<T>(query: string, variables: Record<string, unknown>, cacheKey: string): Promise<T> {
    const start = Date.now();
    this.hooks.onRequest?.(query, variables);

    const minifiedQuery = normalizeQuery(query);

    const res = await this.rateLimiter.fetchWithRetry(
      this.apiUrl,
      {
        method: "POST",
        headers: this.headers,
        body: JSON.stringify({ query: minifiedQuery, variables }),
      },
      { onRetry: this.hooks.onRetry, onRateLimit: this.hooks.onRateLimit },
    );

    const json = (await res.json()) as { data?: T; errors?: unknown[] };

    if (!res.ok || json.errors) {
      const message =
        (json.errors as Array<{ message?: string }>)?.[0]?.message ?? `AniList API error (HTTP ${res.status})`;
      throw new AniListError(message, res.status, json.errors ?? []);
    }

    const data = json.data as T;
    await this.cacheAdapter.set(cacheKey, data);
    this.hooks.onResponse?.(query, Date.now() - start, false);
    return data;
  }

  /**
   * @internal
   * Shorthand for paginated queries that follow the `Page { pageInfo, <field>[] }` pattern.
   */
  private async pagedRequest<T>(
    query: string,
    variables: Record<string, unknown>,
    field: string,
  ): Promise<PagedResult<T>> {
    const data = await this.request<{ Page: Record<string, unknown> & { pageInfo: PageInfo } }>(query, variables);
    const results = data.Page[field];
    if (!Array.isArray(results)) {
      throw new AniListError(`Unexpected response: missing field "${field}" in Page`, 0, []);
    }
    return { pageInfo: data.Page.pageInfo, results: results as T[] };
  }

  /**
   * Fetch a single media entry by its AniList ID.
   *
   * Optionally include related data (characters, staff, relations, etc.) via the `include` parameter.
   *
   * @param id - The AniList media ID
   * @param include - Optional related data to include
   * @returns The media object
   *
   * @example
   * ```ts
   * // Basic usage — same as before (includes relations by default)
   * const anime = await client.getMedia(1);
   *
   * // Include characters sorted by role, 25 results
   * const anime = await client.getMedia(1, { characters: true });
   *
   * // Include characters with voice actors
   * const anime = await client.getMedia(1, { characters: { voiceActors: true } });
   *
   * // Full control
   * const anime = await client.getMedia(1, {
   *   characters: { perPage: 50, sort: true },
   *   staff: true,
   *   relations: true,
   *   streamingEpisodes: true,
   *   externalLinks: true,
   *   stats: true,
   *   recommendations: { perPage: 5 },
   * });
   *
   * // Exclude relations for a lighter response
   * const anime = await client.getMedia(1, { characters: true, relations: false });
   * ```
   */
  async getMedia(id: number, include?: MediaIncludeOptions): Promise<Media> {
    const query = include ? buildMediaByIdQuery(include) : QUERY_MEDIA_BY_ID;
    const data = await this.request<{ Media: Media }>(query, { id });
    return data.Media;
  }

  /**
   * Search for anime or manga.
   *
   * @param options - Search / filter parameters
   * @returns Paginated results with matching media
   *
   * @example
   * ```ts
   * const results = await client.searchMedia({
   *   query: "Naruto",
   *   type: MediaType.ANIME,
   *   perPage: 5,
   * });
   * ```
   */
  async searchMedia(options: SearchMediaOptions = {}): Promise<PagedResult<Media>> {
    const { query: search, page = 1, perPage = 20, genres, tags, genresExclude, tagsExclude, ...filters } = options;
    return this.pagedRequest<Media>(
      QUERY_MEDIA_SEARCH,
      {
        search,
        ...filters,
        genre_in: genres,
        tag_in: tags,
        genre_not_in: genresExclude,
        tag_not_in: tagsExclude,
        page,
        perPage: clampPerPage(perPage),
      },
      "media",
    );
  }

  /**
   * Get currently trending anime or manga.
   *
   * @param type - `MediaType.ANIME` or `MediaType.MANGA` (defaults to ANIME)
   * @param page - Page number (default 1)
   * @param perPage - Results per page (default 20, max 50)
   */
  async getTrending(type: MediaType = MediaType.ANIME, page = 1, perPage = 20): Promise<PagedResult<Media>> {
    return this.pagedRequest<Media>(QUERY_TRENDING, { type, page, perPage: clampPerPage(perPage) }, "media");
  }

  /**
   * Get the most popular anime or manga.
   *
   * Convenience wrapper around `searchMedia` with `sort: POPULARITY_DESC`.
   *
   * @param type - `MediaType.ANIME` or `MediaType.MANGA` (defaults to ANIME)
   * @param page - Page number (default 1)
   * @param perPage - Results per page (default 20, max 50)
   */
  async getPopular(type: MediaType = MediaType.ANIME, page = 1, perPage = 20): Promise<PagedResult<Media>> {
    return this.searchMedia({ type, sort: [MediaSort.POPULARITY_DESC], page, perPage });
  }

  /**
   * Get the highest-rated anime or manga.
   *
   * Convenience wrapper around `searchMedia` with `sort: SCORE_DESC`.
   *
   * @param type - `MediaType.ANIME` or `MediaType.MANGA` (defaults to ANIME)
   * @param page - Page number (default 1)
   * @param perPage - Results per page (default 20, max 50)
   */
  async getTopRated(type: MediaType = MediaType.ANIME, page = 1, perPage = 20): Promise<PagedResult<Media>> {
    return this.searchMedia({ type, sort: [MediaSort.SCORE_DESC], page, perPage });
  }

  /**
   * Fetch a character by AniList ID.
   *
   * @param id - The AniList character ID
   * @param include - Optional include options (e.g. voice actors)
   * @returns The character object
   *
   * @example
   * ```ts
   * const spike = await client.getCharacter(1);
   * console.log(spike.name.full); // "Spike Spiegel"
   *
   * // With voice actors
   * const spike = await client.getCharacter(1, { voiceActors: true });
   * spike.media?.edges?.forEach((e) => {
   *   console.log(e.node.title.romaji);
   *   e.voiceActors?.forEach((va) => console.log(`  VA: ${va.name.full}`));
   * });
   * ```
   */
  async getCharacter(id: number, include?: CharacterIncludeOptions): Promise<Character> {
    const query = include?.voiceActors ? QUERY_CHARACTER_BY_ID_WITH_VA : QUERY_CHARACTER_BY_ID;
    const data = await this.request<{ Character: Character }>(query, { id });
    return data.Character;
  }

  /**
   * Search for characters by name.
   *
   * @param options - Search / pagination parameters (includes optional `voiceActors`)
   * @returns Paginated results with matching characters
   *
   * @example
   * ```ts
   * const result = await client.searchCharacters({ query: "Luffy", perPage: 5 });
   *
   * // With voice actors
   * const result = await client.searchCharacters({ query: "Luffy", voiceActors: true });
   * ```
   */
  async searchCharacters(options: SearchCharacterOptions = {}): Promise<PagedResult<Character>> {
    const { query: search, page = 1, perPage = 20, voiceActors, ...rest } = options;
    const gqlQuery = voiceActors ? QUERY_CHARACTER_SEARCH_WITH_VA : QUERY_CHARACTER_SEARCH;
    return this.pagedRequest<Character>(
      gqlQuery,
      { search, ...rest, page, perPage: clampPerPage(perPage) },
      "characters",
    );
  }

  /**
   * Fetch a staff member by AniList ID.
   *
   * @param id - The AniList staff ID
   * @param include - Optional include options to fetch related data (e.g. media)
   * @returns The staff object
   *
   * @example
   * ```ts
   * const staff = await client.getStaff(95001);
   * console.log(staff.name.full);
   *
   * // With media the staff worked on
   * const staff = await client.getStaff(95001, { media: true });
   * staff.staffMedia?.nodes.forEach((m) => console.log(m.title.romaji));
   * ```
   */
  async getStaff(id: number, include?: StaffIncludeOptions): Promise<Staff> {
    if (include?.media) {
      const opts = typeof include.media === "object" ? include.media : {};
      const perPage = opts.perPage ?? 25;
      const data = await this.request<{ Staff: Staff }>(QUERY_STAFF_BY_ID_WITH_MEDIA, { id, perPage });
      return data.Staff;
    }
    const data = await this.request<{ Staff: Staff }>(QUERY_STAFF_BY_ID, { id });
    return data.Staff;
  }

  /**
   * Search for staff (voice actors, directors, etc.).
   *
   * @param options - Search / pagination parameters
   * @returns Paginated results with matching staff
   *
   * @example
   * ```ts
   * const result = await client.searchStaff({ query: "Miyazaki", perPage: 5 });
   * ```
   */
  async searchStaff(options: SearchStaffOptions = {}): Promise<PagedResult<Staff>> {
    const { query: search, page = 1, perPage = 20, sort } = options;
    return this.pagedRequest<Staff>(
      QUERY_STAFF_SEARCH,
      { search, sort, page, perPage: clampPerPage(perPage) },
      "staff",
    );
  }

  /**
   * Fetch a user by AniList ID or username.
   *
   * @param idOrName - The AniList user ID (number) or username (string)
   * @returns The user object
   *
   * @example
   * ```ts
   * const user = await client.getUser(1);
   * const user2 = await client.getUser("AniList");
   * console.log(user.name);
   * ```
   */
  async getUser(idOrName: number | string): Promise<User> {
    if (typeof idOrName === "number") {
      const data = await this.request<{ User: User }>(QUERY_USER_BY_ID, { id: idOrName });
      return data.User;
    }
    const data = await this.request<{ User: User }>(QUERY_USER_BY_NAME, { name: idOrName });
    return data.User;
  }

  /**
   * Fetch a user by username.
   *
   * @deprecated Use `getUser(name)` instead.
   * @param name - The AniList username
   * @returns The user object
   */
  async getUserByName(name: string): Promise<User> {
    return this.getUser(name);
  }

  /**
   * Search for users by name.
   *
   * @param options - Search / pagination parameters
   * @returns Paginated results with matching users
   *
   * @example
   * ```ts
   * const result = await client.searchUsers({ query: "AniList", perPage: 5 });
   * ```
   */
  async searchUsers(options: SearchUserOptions = {}): Promise<PagedResult<User>> {
    const { query: search, page = 1, perPage = 20, sort } = options;
    return this.pagedRequest<User>(QUERY_USER_SEARCH, { search, sort, page, perPage: clampPerPage(perPage) }, "users");
  }

  /**
   * Execute an arbitrary GraphQL query against the AniList API.
   * Useful for advanced use-cases not covered by the built-in methods.
   *
   * @param query - A valid GraphQL query string
   * @param variables - Optional variables object
   */
  async raw<T = unknown>(query: string, variables?: Record<string, unknown>): Promise<T> {
    return this.request<T>(query, variables);
  }

  /**
   * Get recently aired anime episodes.
   *
   * By default returns episodes that aired in the last 24 hours.
   *
   * @param options - Filter / pagination parameters
   * @returns Paginated list of airing schedule entries
   *
   * @example
   * ```ts
   * // Episodes that aired in the last 48h
   * const recent = await client.getAiredEpisodes({
   *   airingAtGreater: Math.floor(Date.now() / 1000) - 48 * 3600,
   * });
   * ```
   */
  async getAiredEpisodes(options: GetAiringOptions = {}): Promise<PagedResult<AiringSchedule>> {
    const now = Math.floor(Date.now() / 1000);
    const variables: Record<string, unknown> = {
      airingAt_greater: options.airingAtGreater ?? now - 24 * 3600,
      airingAt_lesser: options.airingAtLesser ?? now,
      sort: options.sort ?? ["TIME_DESC"],
      page: options.page ?? 1,
      perPage: clampPerPage(options.perPage ?? 20),
    };

    return this.pagedRequest<AiringSchedule>(QUERY_AIRING_SCHEDULE, variables, "airingSchedules");
  }

  /**
   * Get manga that are currently releasing, sorted by most recently updated.
   *
   * This is the closest equivalent to "recently released chapters" on AniList,
   * since the API does not expose per-chapter airing schedules for manga.
   *
   * @param options - Pagination parameters
   * @returns Paginated list of currently releasing manga
   *
   * @example
   * ```ts
   * const chapters = await client.getAiredChapters({ perPage: 10 });
   * ```
   */
  async getAiredChapters(options: GetRecentChaptersOptions = {}): Promise<PagedResult<Media>> {
    return this.pagedRequest<Media>(
      QUERY_RECENT_CHAPTERS,
      {
        page: options.page ?? 1,
        perPage: clampPerPage(options.perPage ?? 20),
      },
      "media",
    );
  }

  /**
   * Get upcoming (not yet released) anime and/or manga, sorted by popularity.
   *
   * @param options - Filter / pagination parameters
   * @returns Paginated list of planned media
   *
   * @example
   * ```ts
   * import { MediaType } from "ani-client";
   *
   * // Most anticipated upcoming anime
   * const planning = await client.getPlanning({ type: MediaType.ANIME, perPage: 10 });
   * ```
   */
  async getPlanning(options: GetPlanningOptions = {}): Promise<PagedResult<Media>> {
    return this.pagedRequest<Media>(
      QUERY_PLANNING,
      {
        type: options.type,
        sort: options.sort ?? ["POPULARITY_DESC"],
        page: options.page ?? 1,
        perPage: clampPerPage(options.perPage ?? 20),
      },
      "media",
    );
  }

  /**
   * Get recommendations for a specific media.
   *
   * Returns other anime/manga that users have recommended based on the given media.
   *
   * @param mediaId - The AniList media ID
   * @param options - Optional sort / pagination parameters
   * @returns Paginated list of recommendations
   *
   * @example
   * ```ts
   * // Get recommendations for Cowboy Bebop
   * const recs = await client.getRecommendations(1);
   * recs.results.forEach((r) =>
   *   console.log(`${r.mediaRecommendation.title.romaji} (rating: ${r.rating})`)
   * );
   * ```
   */
  async getRecommendations(
    mediaId: number,
    options: Omit<GetRecommendationsOptions, "mediaId"> = {},
  ): Promise<PagedResult<Recommendation>> {
    const variables: Record<string, unknown> = {
      mediaId,
      sort: options.sort ?? ["RATING_DESC"],
      page: options.page ?? 1,
      perPage: clampPerPage(options.perPage ?? 20),
    };

    const data = await this.request<{
      Media: {
        recommendations: {
          pageInfo: PagedResult<Recommendation>["pageInfo"];
          nodes: Recommendation[];
        };
      };
    }>(QUERY_RECOMMENDATIONS, variables);

    return {
      pageInfo: data.Media.recommendations.pageInfo,
      results: data.Media.recommendations.nodes,
    };
  }

  /**
   * Get anime (or manga) for a specific season and year.
   *
   * @param options - Season, year and optional filter / pagination parameters
   * @returns Paginated list of media for the given season
   *
   * @example
   * ```ts
   * import { MediaSeason } from "ani-client";
   *
   * const winter2026 = await client.getMediaBySeason({
   *   season: MediaSeason.WINTER,
   *   seasonYear: 2026,
   *   perPage: 10,
   * });
   * ```
   */
  async getMediaBySeason(options: GetSeasonOptions): Promise<PagedResult<Media>> {
    return this.pagedRequest<Media>(
      QUERY_MEDIA_BY_SEASON,
      {
        season: options.season,
        seasonYear: options.seasonYear,
        type: options.type ?? "ANIME",
        sort: options.sort ?? ["POPULARITY_DESC"],
        page: options.page ?? 1,
        perPage: clampPerPage(options.perPage ?? 20),
      },
      "media",
    );
  }

  /**
   * Get a user's anime or manga list.
   *
   * Provide either `userId` or `userName` to identify the user.
   * Requires `type` (ANIME or MANGA). Optionally filter by list status.
   *
   * @param options - User identifier, media type, and optional filters
   * @returns Paginated list of media list entries
   *
   * @example
   * ```ts
   * import { MediaType, MediaListStatus } from "ani-client";
   *
   * // Get a user's completed anime list
   * const list = await client.getUserMediaList({
   *   userName: "AniList",
   *   type: MediaType.ANIME,
   *   status: MediaListStatus.COMPLETED,
   * });
   * list.results.forEach((entry) =>
   *   console.log(`${entry.media.title.romaji} — ${entry.score}/100`)
   * );
   * ```
   */
  async getUserMediaList(options: GetUserMediaListOptions): Promise<PagedResult<MediaListEntry>> {
    if (!options.userId && !options.userName) {
      throw new Error("Either userId or userName must be provided");
    }

    return this.pagedRequest<MediaListEntry>(
      QUERY_USER_MEDIA_LIST,
      {
        userId: options.userId,
        userName: options.userName,
        type: options.type,
        status: options.status,
        sort: options.sort,
        page: options.page ?? 1,
        perPage: clampPerPage(options.perPage ?? 20),
      },
      "mediaList",
    );
  }

  /**
   * Fetch a studio by its AniList ID.
   *
   * Returns studio details along with its most popular productions.
   *
   * @param id - The AniList studio ID
   */
  async getStudio(id: number): Promise<Studio> {
    const data = await this.request<{ Studio: Studio }>(QUERY_STUDIO_BY_ID, { id });
    return data.Studio;
  }

  /**
   * Search for studios by name.
   *
   * @param options - Search / pagination parameters
   * @returns Paginated list of studios
   *
   * @example
   * ```ts
   * const studios = await client.searchStudios({ query: "MAPPA" });
   * ```
   */
  async searchStudios(options: SearchStudioOptions = {}): Promise<PagedResult<Studio>> {
    return this.pagedRequest<Studio>(
      QUERY_STUDIO_SEARCH,
      {
        search: options.query,
        page: options.page ?? 1,
        perPage: clampPerPage(options.perPage ?? 20),
      },
      "studios",
    );
  }

  /**
   * Get all available genres on AniList.
   *
   * @returns Array of genre strings (e.g. "Action", "Adventure", ...)
   */
  async getGenres(): Promise<string[]> {
    const data = await this.request<{ GenreCollection: string[] }>(QUERY_GENRES);
    return data.GenreCollection;
  }

  /**
   * Get all available media tags on AniList.
   *
   * @returns Array of tag objects with id, name, description, category, isAdult
   */
  async getTags(): Promise<MediaTag[]> {
    const data = await this.request<{ MediaTagCollection: MediaTag[] }>(QUERY_TAGS);
    return data.MediaTagCollection;
  }

  /**
   * Auto-paginating async iterator.
   *
   * Wraps any paginated method and yields individual items across all pages.
   * Stops when `hasNextPage` is `false` or `maxPages` is reached.
   *
   * @param fetchPage - A function that takes a page number and returns a `PagedResult<T>`
   * @param maxPages - Maximum number of pages to fetch (default: Infinity)
   * @returns An async iterable iterator of individual items
   *
   * @example
   * ```ts
   * // Iterate over all search results
   * for await (const anime of client.paginate((page) =>
   *   client.searchMedia({ query: "Naruto", page, perPage: 10 })
   * )) {
   *   console.log(anime.title.romaji);
   * }
   *
   * // Limit to 3 pages
   * for await (const anime of client.paginate(
   *   (page) => client.getTrending(MediaType.ANIME, page, 20),
   *   3,
   * )) {
   *   console.log(anime.title.romaji);
   * }
   * ```
   */
  async *paginate<T>(
    fetchPage: (page: number) => Promise<PagedResult<T>>,
    maxPages = Number.POSITIVE_INFINITY,
  ): AsyncGenerator<T, void, undefined> {
    let page = 1;
    let hasNext = true;

    while (hasNext && page <= maxPages) {
      const result = await fetchPage(page);
      for (const item of result.results) {
        yield item;
      }
      hasNext = result.pageInfo.hasNextPage === true;
      page++;
    }
  }

  // ── Batch queries ──

  /**
   * Fetch multiple media entries in a single API request.
   * Uses GraphQL aliases to batch up to 50 IDs per call.
   *
   * @param ids - Array of AniList media IDs
   * @returns Array of media objects (same order as input IDs)
   */
  async getMediaBatch(ids: number[]): Promise<Media[]> {
    if (ids.length === 0) return [];
    if (ids.length === 1) return [await this.getMedia(ids[0])];
    return this.executeBatch<Media>(ids, buildBatchMediaQuery, "m");
  }

  /**
   * Fetch multiple characters in a single API request.
   *
   * @param ids - Array of AniList character IDs
   * @returns Array of character objects (same order as input IDs)
   */
  async getCharacterBatch(ids: number[]): Promise<Character[]> {
    if (ids.length === 0) return [];
    if (ids.length === 1) return [await this.getCharacter(ids[0])];
    return this.executeBatch<Character>(ids, buildBatchCharacterQuery, "c");
  }

  /**
   * Fetch multiple staff members in a single API request.
   *
   * @param ids - Array of AniList staff IDs
   * @returns Array of staff objects (same order as input IDs)
   */
  async getStaffBatch(ids: number[]): Promise<Staff[]> {
    if (ids.length === 0) return [];
    if (ids.length === 1) return [await this.getStaff(ids[0])];
    return this.executeBatch<Staff>(ids, buildBatchStaffQuery, "s");
  }

  /** @internal */
  private async executeBatch<T>(ids: number[], buildQuery: (ids: number[]) => string, prefix: string): Promise<T[]> {
    const chunks = chunk(ids, 50);

    const chunkResults: T[][] = [];
    // Process chunks sequentially to prevent overloading the network queue
    for (const idChunk of chunks) {
      const query = buildQuery(idChunk);
      const data = await this.request<Record<string, T>>(query);
      chunkResults.push(idChunk.map((_, i) => data[`${prefix}${i}`]));
    }

    return chunkResults.flat();
  }

  // ── Cache management ──

  /**
   * Clear the entire response cache.
   */
  async clearCache(): Promise<void> {
    await this.cacheAdapter.clear();
  }

  /**
   * Number of entries currently in the cache.
   * For async adapters like Redis, this may return a Promise.
   */
  get cacheSize(): number | Promise<number> {
    return this.cacheAdapter.size;
  }

  /**
   * Remove cache entries whose key matches the given pattern.
   *
   * @param pattern — A string (converted to RegExp) or RegExp
   * @returns Number of entries removed
   */
  async invalidateCache(pattern: string | RegExp): Promise<number> {
    if (this.cacheAdapter.invalidate) {
      return this.cacheAdapter.invalidate(pattern);
    }

    const allKeys = await this.cacheAdapter.keys();
    const regex = typeof pattern === "string" ? new RegExp(pattern) : pattern;
    let count = 0;
    for (const key of allKeys) {
      if (regex.test(key)) {
        await this.cacheAdapter.delete(key);
        count++;
      }
    }
    return count;
  }

  /**
   * Clean up resources held by the client.
   *
   * Clears the in-memory cache and aborts any pending in-flight requests.
   * If using a custom cache adapter (e.g. Redis), call its close/disconnect
   * method separately.
   */
  async destroy(): Promise<void> {
    await this.cacheAdapter.clear();
    this.inFlight.clear();
  }
}
