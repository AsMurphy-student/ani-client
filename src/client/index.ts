import { MemoryCache } from "../cache";
import { AniListError } from "../errors";
import { buildBatchCharacterQuery, buildBatchMediaQuery, buildBatchStaffQuery } from "../queries";
import { QUERY_GENRES, QUERY_TAGS } from "../queries";
import { RateLimiter } from "../rate-limiter";
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
  MediaType,
  PageInfo,
  PagedResult,
  Recommendation,
  SearchCharacterOptions,
  SearchMediaOptions,
  SearchStaffOptions,
  SearchStudioOptions,
  SearchThreadOptions,
  SearchUserOptions,
  Staff,
  StaffIncludeOptions,
  Studio,
  Thread,
  User,
  WeeklySchedule,
} from "../types";
import { chunk, clampPerPage, normalizeQuery } from "../utils";

import * as characterMethods from "./character";
// ── Domain method imports ──
import * as mediaMethods from "./media";
import * as staffMethods from "./staff";
import * as studioMethods from "./studio";
import * as threadMethods from "./thread";
import * as userMethods from "./user";

const DEFAULT_API_URL = "https://graphql.anilist.co";

/**
 * Lightweight AniList GraphQL client with built-in caching and rate limiting.
 *
 * @example
 * ```ts
 * import { AniListClient } from "ani-client";
 *
 * const client = new AniListClient();
 * const anime = await client.getMedia(1);
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

  // ── Core infrastructure (internal) ──

  /** @internal */
  async request<T>(query: string, variables: Record<string, unknown> = {}): Promise<T> {
    const cacheKey = MemoryCache.key(query, variables);

    const cached = await this.cacheAdapter.get<T>(cacheKey);
    if (cached !== undefined) {
      this.hooks.onCacheHit?.(cacheKey);
      this.hooks.onResponse?.(query, 0, true);
      return cached;
    }

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

  /** @internal */
  async pagedRequest<T>(query: string, variables: Record<string, unknown>, field: string): Promise<PagedResult<T>> {
    const data = await this.request<{ Page: Record<string, unknown> & { pageInfo: PageInfo } }>(query, variables);
    const results = data.Page[field];
    if (!Array.isArray(results)) {
      throw new AniListError(`Unexpected response: missing field "${field}" in Page`, 0, []);
    }
    return { pageInfo: data.Page.pageInfo, results: results as T[] };
  }

  // ── Media ──

  /**
   * Fetch a single media entry by its AniList ID.
   *
   * Optionally include related data (characters, staff, relations, etc.) via the `include` parameter.
   *
   * @param id - The AniList media ID
   * @param include - Optional related data to include
   */
  async getMedia(id: number, include?: MediaIncludeOptions): Promise<Media> {
    return mediaMethods.getMedia(this, id, include);
  }

  /**
   * Search for anime or manga.
   *
   * @param options - Search / filter parameters
   * @returns Paginated results with matching media
   */
  async searchMedia(options: SearchMediaOptions = {}): Promise<PagedResult<Media>> {
    return mediaMethods.searchMedia(this, options);
  }

  /** Get currently trending anime or manga. */
  async getTrending(type?: MediaType, page?: number, perPage?: number): Promise<PagedResult<Media>> {
    return mediaMethods.getTrending(this, type, page, perPage);
  }

  /** Get the most popular anime or manga. */
  async getPopular(type?: MediaType, page?: number, perPage?: number): Promise<PagedResult<Media>> {
    return mediaMethods.getPopular(this, type, page, perPage);
  }

  /** Get the highest-rated anime or manga. */
  async getTopRated(type?: MediaType, page?: number, perPage?: number): Promise<PagedResult<Media>> {
    return mediaMethods.getTopRated(this, type, page, perPage);
  }

  /** Get recently aired anime episodes. */
  async getAiredEpisodes(options: GetAiringOptions = {}): Promise<PagedResult<AiringSchedule>> {
    return mediaMethods.getAiredEpisodes(this, options);
  }

  /** Get currently releasing manga. */
  async getAiredChapters(options: GetRecentChaptersOptions = {}): Promise<PagedResult<Media>> {
    return mediaMethods.getAiredChapters(this, options);
  }

  /** Get the detailed schedule for the current week, sorted by day. */
  async getWeeklySchedule(date?: Date): Promise<WeeklySchedule> {
    return mediaMethods.getWeeklySchedule(this, date);
  }

  /** Get upcoming (not yet released) media. */
  async getPlanning(options: GetPlanningOptions = {}): Promise<PagedResult<Media>> {
    return mediaMethods.getPlanning(this, options);
  }

  /** Get recommendations for a specific media. */
  async getRecommendations(
    mediaId: number,
    options: Omit<GetRecommendationsOptions, "mediaId"> = {},
  ): Promise<PagedResult<Recommendation>> {
    return mediaMethods.getRecommendations(this, mediaId, options);
  }

  /** Get anime (or manga) for a specific season and year. */
  async getMediaBySeason(options: GetSeasonOptions): Promise<PagedResult<Media>> {
    return mediaMethods.getMediaBySeason(this, options);
  }

  // ── Characters ──

  /** Fetch a character by AniList ID. Pass `{ voiceActors: true }` to include VA data. */
  async getCharacter(id: number, include?: CharacterIncludeOptions): Promise<Character> {
    return characterMethods.getCharacter(this, id, include);
  }

  /** Search for characters by name. */
  async searchCharacters(options: SearchCharacterOptions = {}): Promise<PagedResult<Character>> {
    return characterMethods.searchCharacters(this, options);
  }

  // ── Staff ──

  /** Fetch a staff member by AniList ID. Pass `{ media: true }` or `{ media: { perPage } }` for media credits. */
  async getStaff(id: number, include?: StaffIncludeOptions): Promise<Staff> {
    return staffMethods.getStaff(this, id, include);
  }

  /** Search for staff (voice actors, directors, etc.). */
  async searchStaff(options: SearchStaffOptions = {}): Promise<PagedResult<Staff>> {
    return staffMethods.searchStaff(this, options);
  }

  // ── Users ──

  /**
   * Fetch a user by AniList ID or username.
   *
   * @param idOrName - The AniList user ID (number) or username (string)
   */
  async getUser(idOrName: number | string): Promise<User> {
    return userMethods.getUser(this, idOrName);
  }

  /** Search for users by name. */
  async searchUsers(options: SearchUserOptions = {}): Promise<PagedResult<User>> {
    return userMethods.searchUsers(this, options);
  }

  /** Get a user's anime or manga list. */
  async getUserMediaList(options: GetUserMediaListOptions): Promise<PagedResult<MediaListEntry>> {
    return userMethods.getUserMediaList(this, options);
  }

  // ── Studios ──

  /** Fetch a studio by its AniList ID. */
  async getStudio(id: number): Promise<Studio> {
    return studioMethods.getStudio(this, id);
  }

  /** Search for studios by name. */
  async searchStudios(options: SearchStudioOptions = {}): Promise<PagedResult<Studio>> {
    return studioMethods.searchStudios(this, options);
  }

  // ── Metadata ──

  // ── Threads ──

  /** Fetch a forum thread by its AniList ID. */
  async getThread(id: number): Promise<Thread> {
    return threadMethods.getThread(this, id);
  }

  /** Get recent forum threads, optionally filtered by search, media, or category. */
  async getRecentThreads(options: SearchThreadOptions = {}): Promise<PagedResult<Thread>> {
    return threadMethods.getRecentThreads(this, options);
  }

  /** Get all available genres on AniList. */
  async getGenres(): Promise<string[]> {
    const data = await this.request<{ GenreCollection: string[] }>(QUERY_GENRES);
    return data.GenreCollection;
  }

  /** Get all available media tags on AniList. */
  async getTags(): Promise<MediaTag[]> {
    const data = await this.request<{ MediaTagCollection: MediaTag[] }>(QUERY_TAGS);
    return data.MediaTagCollection;
  }

  // ── Raw query ──

  /** Execute an arbitrary GraphQL query against the AniList API. */
  async raw<T>(query: string, variables?: Record<string, unknown>): Promise<T> {
    return this.request<T>(query, variables ?? {});
  }

  // ── Pagination ──

  /**
   * Auto-paginating async iterator. Yields individual items across all pages.
   *
   * @param fetchPage - A function that takes a page number and returns a `PagedResult<T>`
   * @param maxPages - Maximum number of pages to fetch (default: Infinity)
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

  /** Fetch multiple media entries in a single API request. */
  async getMediaBatch(ids: number[]): Promise<Media[]> {
    if (ids.length === 0) return [];
    if (ids.length === 1) return [await this.getMedia(ids[0])];
    return this.executeBatch<Media>(ids, buildBatchMediaQuery, "m");
  }

  /** Fetch multiple characters in a single API request. */
  async getCharacterBatch(ids: number[]): Promise<Character[]> {
    if (ids.length === 0) return [];
    if (ids.length === 1) return [await this.getCharacter(ids[0])];
    return this.executeBatch<Character>(ids, buildBatchCharacterQuery, "c");
  }

  /** Fetch multiple staff members in a single API request. */
  async getStaffBatch(ids: number[]): Promise<Staff[]> {
    if (ids.length === 0) return [];
    if (ids.length === 1) return [await this.getStaff(ids[0])];
    return this.executeBatch<Staff>(ids, buildBatchStaffQuery, "s");
  }

  /** @internal */
  private async executeBatch<T>(ids: number[], buildQuery: (ids: number[]) => string, prefix: string): Promise<T[]> {
    const chunks = chunk(ids, 50);
    const chunkResults: T[][] = [];
    for (const idChunk of chunks) {
      const query = buildQuery(idChunk);
      const data = await this.request<Record<string, T>>(query);
      chunkResults.push(idChunk.map((_, i) => data[`${prefix}${i}`]));
    }
    return chunkResults.flat();
  }

  // ── Cache management ──

  /** Clear the entire response cache. */
  async clearCache(): Promise<void> {
    await this.cacheAdapter.clear();
  }

  /** Number of entries currently in the cache. */
  get cacheSize(): number | Promise<number> {
    return this.cacheAdapter.size;
  }

  /** Remove cache entries whose key matches the given pattern. */
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

  /** Clean up resources held by the client. */
  async destroy(): Promise<void> {
    await this.cacheAdapter.clear();
    this.inFlight.clear();
  }
}
