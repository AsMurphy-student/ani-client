import {
  QUERY_MEDIA_BY_ID,
  QUERY_MEDIA_SEARCH,
  QUERY_TRENDING,
  QUERY_CHARACTER_BY_ID,
  QUERY_CHARACTER_SEARCH,
  QUERY_STAFF_BY_ID,
  QUERY_STAFF_SEARCH,
  QUERY_USER_BY_ID,
  QUERY_USER_BY_NAME,
  QUERY_AIRING_SCHEDULE,
  QUERY_RECENT_CHAPTERS,
  QUERY_PLANNING,
  QUERY_MEDIA_BY_SEASON,
  QUERY_USER_MEDIA_LIST,
  QUERY_RECOMMENDATIONS,
  QUERY_STUDIO_BY_ID,
  QUERY_STUDIO_SEARCH,
  QUERY_GENRES,
  QUERY_TAGS,
} from "../queries";

import { AniListError } from "../errors";
import { MemoryCache } from "../cache";
import { RateLimiter } from "../rate-limiter";

import type {
  AniListClientOptions,
  Media,
  Character,
  Staff,
  User,
  AiringSchedule,
  MediaListEntry,
  Recommendation,
  StudioDetail,
  MediaTag,
  PagedResult,
  SearchMediaOptions,
  SearchCharacterOptions,
  SearchStaffOptions,
  SearchStudioOptions,
  GetAiringOptions,
  GetRecentChaptersOptions,
  GetPlanningOptions,
  GetSeasonOptions,
  GetUserMediaListOptions,
  GetRecommendationsOptions,
  MediaType,
} from "../types";

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
  private readonly cache: MemoryCache;
  private readonly rateLimiter: RateLimiter;

  constructor(options: AniListClientOptions = {}) {
    this.apiUrl = options.apiUrl ?? DEFAULT_API_URL;
    this.headers = {
      "Content-Type": "application/json",
      Accept: "application/json",
    };
    if (options.token) {
      this.headers["Authorization"] = `Bearer ${options.token}`;
    }
    this.cache = new MemoryCache(options.cache);
    this.rateLimiter = new RateLimiter(options.rateLimit);
  }

  /**
   * @internal
   */
  private async request<T>(query: string, variables: Record<string, unknown> = {}): Promise<T> {
    const cacheKey = MemoryCache.key(query, variables);
    const cached = this.cache.get<T>(cacheKey);
    if (cached !== undefined) return cached;

    const res = await this.rateLimiter.fetchWithRetry(this.apiUrl, {
      method: "POST",
      headers: this.headers,
      body: JSON.stringify({ query, variables }),
    });

    const json = (await res.json()) as { data?: T; errors?: unknown[] };

    if (!res.ok || json.errors) {
      const message =
        (json.errors as Array<{ message?: string }>)?.[0]?.message ??
        `AniList API error (HTTP ${res.status})`;
      throw new AniListError(message, res.status, json.errors ?? []);
    }

    const data = json.data as T;
    this.cache.set(cacheKey, data);
    return data;
  }

  /**
   * Fetch a single media entry by its AniList ID.
   *
   * @param id - The AniList media ID
   * @returns The media object
   */
  async getMedia(id: number): Promise<Media> {
    const data = await this.request<{ Media: Media }>(QUERY_MEDIA_BY_ID, { id });
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
    const variables: Record<string, unknown> = {
      search: options.query,
      type: options.type,
      format: options.format,
      status: options.status,
      season: options.season,
      seasonYear: options.seasonYear,
      genre: options.genre,
      tag: options.tag,
      isAdult: options.isAdult,
      sort: options.sort,
      page: options.page ?? 1,
      perPage: options.perPage ?? 20,
    };

    const data = await this.request<{
      Page: { pageInfo: PagedResult<Media>["pageInfo"]; media: Media[] };
    }>(QUERY_MEDIA_SEARCH, variables);

    return { pageInfo: data.Page.pageInfo, results: data.Page.media };
  }

  /**
   * Get currently trending anime or manga.
   *
   * @param type - `MediaType.ANIME` or `MediaType.MANGA` (defaults to ANIME)
   * @param page - Page number (default 1)
   * @param perPage - Results per page (default 20, max 50)
   */
  async getTrending(
    type: MediaType = "ANIME" as MediaType,
    page = 1,
    perPage = 20,
  ): Promise<PagedResult<Media>> {
    const data = await this.request<{
      Page: { pageInfo: PagedResult<Media>["pageInfo"]; media: Media[] };
    }>(QUERY_TRENDING, { type, page, perPage });

    return { pageInfo: data.Page.pageInfo, results: data.Page.media };
  }

  /**
   * Fetch a character by AniList ID.
   */
  async getCharacter(id: number): Promise<Character> {
    const data = await this.request<{ Character: Character }>(QUERY_CHARACTER_BY_ID, { id });
    return data.Character;
  }

  /**
   * Search for characters by name.
   */
  async searchCharacters(options: SearchCharacterOptions = {}): Promise<PagedResult<Character>> {
    const variables: Record<string, unknown> = {
      search: options.query,
      sort: options.sort,
      page: options.page ?? 1,
      perPage: options.perPage ?? 20,
    };

    const data = await this.request<{
      Page: { pageInfo: PagedResult<Character>["pageInfo"]; characters: Character[] };
    }>(QUERY_CHARACTER_SEARCH, variables);

    return { pageInfo: data.Page.pageInfo, results: data.Page.characters };
  }

  /**
   * Fetch a staff member by AniList ID.
   */
  async getStaff(id: number): Promise<Staff> {
    const data = await this.request<{ Staff: Staff }>(QUERY_STAFF_BY_ID, { id });
    return data.Staff;
  }

  /**
   * Search for staff (voice actors, directors, etc.).
   */
  async searchStaff(options: SearchStaffOptions = {}): Promise<PagedResult<Staff>> {
    const variables: Record<string, unknown> = {
      search: options.query,
      page: options.page ?? 1,
      perPage: options.perPage ?? 20,
    };

    const data = await this.request<{
      Page: { pageInfo: PagedResult<Staff>["pageInfo"]; staff: Staff[] };
    }>(QUERY_STAFF_SEARCH, variables);

    return { pageInfo: data.Page.pageInfo, results: data.Page.staff };
  }

  /**
   * Fetch a user by AniList ID.
   */
  async getUser(id: number): Promise<User> {
    const data = await this.request<{ User: User }>(QUERY_USER_BY_ID, { id });
    return data.User;
  }

  /**
   * Fetch a user by username.
   */
  async getUserByName(name: string): Promise<User> {
    const data = await this.request<{ User: User }>(QUERY_USER_BY_NAME, { name });
    return data.User;
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
      perPage: options.perPage ?? 20,
    };

    const data = await this.request<{
      Page: { pageInfo: PagedResult<AiringSchedule>["pageInfo"]; airingSchedules: AiringSchedule[] };
    }>(QUERY_AIRING_SCHEDULE, variables);

    return { pageInfo: data.Page.pageInfo, results: data.Page.airingSchedules };
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
    const variables: Record<string, unknown> = {
      page: options.page ?? 1,
      perPage: options.perPage ?? 20,
    };

    const data = await this.request<{
      Page: { pageInfo: PagedResult<Media>["pageInfo"]; media: Media[] };
    }>(QUERY_RECENT_CHAPTERS, variables);

    return { pageInfo: data.Page.pageInfo, results: data.Page.media };
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
    const variables: Record<string, unknown> = {
      type: options.type,
      sort: options.sort ?? ["POPULARITY_DESC"],
      page: options.page ?? 1,
      perPage: options.perPage ?? 20,
    };

    const data = await this.request<{
      Page: { pageInfo: PagedResult<Media>["pageInfo"]; media: Media[] };
    }>(QUERY_PLANNING, variables);

    return { pageInfo: data.Page.pageInfo, results: data.Page.media };
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
      perPage: options.perPage ?? 20,
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
    const variables: Record<string, unknown> = {
      season: options.season,
      seasonYear: options.seasonYear,
      type: options.type ?? "ANIME",
      sort: options.sort ?? ["POPULARITY_DESC"],
      page: options.page ?? 1,
      perPage: options.perPage ?? 20,
    };

    const data = await this.request<{
      Page: { pageInfo: PagedResult<Media>["pageInfo"]; media: Media[] };
    }>(QUERY_MEDIA_BY_SEASON, variables);

    return { pageInfo: data.Page.pageInfo, results: data.Page.media };
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

    const variables: Record<string, unknown> = {
      userId: options.userId,
      userName: options.userName,
      type: options.type,
      status: options.status,
      sort: options.sort,
      page: options.page ?? 1,
      perPage: options.perPage ?? 20,
    };

    const data = await this.request<{
      Page: { pageInfo: PagedResult<MediaListEntry>["pageInfo"]; mediaList: MediaListEntry[] };
    }>(QUERY_USER_MEDIA_LIST, variables);

    return { pageInfo: data.Page.pageInfo, results: data.Page.mediaList };
  }

  /**
   * Fetch a studio by its AniList ID.
   *
   * Returns studio details along with its most popular productions.
   *
   * @param id - The AniList studio ID
   */
  async getStudio(id: number): Promise<StudioDetail> {
    const data = await this.request<{ Studio: StudioDetail }>(QUERY_STUDIO_BY_ID, { id });
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
  async searchStudios(options: SearchStudioOptions = {}): Promise<PagedResult<StudioDetail>> {
    const variables: Record<string, unknown> = {
      search: options.query,
      page: options.page ?? 1,
      perPage: options.perPage ?? 20,
    };

    const data = await this.request<{
      Page: { pageInfo: PagedResult<StudioDetail>["pageInfo"]; studios: StudioDetail[] };
    }>(QUERY_STUDIO_SEARCH, variables);

    return { pageInfo: data.Page.pageInfo, results: data.Page.studios };
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
    maxPages = Infinity,
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

  /**
   * Clear the entire response cache.
   */
  clearCache(): void {
    this.cache.clear();
  }

  /**
   * Number of entries currently in the cache.
   */
  get cacheSize(): number {
    return this.cache.size;
  }
}
