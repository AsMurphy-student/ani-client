import { MemoryCache } from "../cache";
import { AniListError } from "../errors";
import {
  buildBatchCharacterQuery,
  buildBatchMediaQuery,
  buildBatchStaffQuery,
  QUERY_GENRES,
  QUERY_TAGS,
} from "../queries";
import { RateLimiter } from "../rate-limiter";
import type {
  AiringSchedule,
  AniListClientOptions,
  AniListHooks,
  CacheAdapter,
  Character,
  CharacterIncludeOptions,
  GeneralMediaQueryOptions,
  GetAiringOptions,
  GetMediaCharactersOptions,
  GetMediaStaffOptions,
  GetPlanningOptions,
  GetRecentChaptersOptions,
  GetRecommendationsOptions,
  GetSeasonOptions,
  GetUserMediaListOptions,
  Logger,
  Media,
  MediaCharacterEdge,
  MediaIncludeOptions,
  MediaListEntry,
  MediaStaffEdge,
  MediaTag,
  MediaType,
  PagedResult,
  PageInfo,
  RateLimitInfo,
  Recommendation,
  ResponseMeta,
  SearchCharacterOptions,
  SearchMediaOptions,
  SearchStaffOptions,
  SearchStudioOptions,
  SearchThreadOptions,
  SearchUserOptions,
  Staff,
  StaffIncludeOptions,
  Studio,
  StudioIncludeOptions,
  Thread,
  User,
  UserFavorites,
  UserFavoritesOptions,
  WeeklySchedule,
} from "../types";
import { chunk, normalizeQuery, validateIds } from "../utils";

import * as characterMethods from "./character";
import * as mediaMethods from "./media";
import * as staffMethods from "./staff";
import * as studioMethods from "./studio";
import * as threadMethods from "./thread";
import * as userMethods from "./user";

const DEFAULT_API_URL = "https://graphql.anilist.co";

declare const __VERSION__: string;
/** Injected at build time by tsup — falls back to `"dev"` in test/dev environments. */
const LIB_VERSION = typeof __VERSION__ !== "undefined" ? __VERSION__ : "dev";

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
  private readonly logger?: Logger;
  private readonly signal?: AbortSignal;
  private readonly inFlight = new Map<string, Promise<unknown>>();
  private _rateLimitInfo?: RateLimitInfo;
  private _lastRequestMeta?: ResponseMeta;

  constructor(options: AniListClientOptions = {}) {
    this.apiUrl = options.apiUrl ?? DEFAULT_API_URL;
    this.headers = {
      "Content-Type": "application/json",
      Accept: "application/json",
      "User-Agent": `ani-client/${LIB_VERSION}`,
    };
    if (options.token) {
      this.headers.Authorization = `Bearer ${options.token}`;
    }
    this.cacheAdapter = options.cacheAdapter ?? new MemoryCache(options.cache);
    this.rateLimiter = new RateLimiter(options.rateLimit);
    this.hooks = options.hooks ?? {};
    this.logger = options.logger;
    this.signal = options.signal;
  }

  /**
   * The current rate limit information from the last API response.
   * Updated after every non-cached request.
   */
  get rateLimitInfo(): RateLimitInfo | undefined {
    return this._rateLimitInfo;
  }

  /**
   * Metadata about the last request (duration, cache status, rate limit info).
   * Useful for debugging and monitoring.
   */
  get lastRequestMeta(): ResponseMeta | undefined {
    return this._lastRequestMeta;
  }

  /** @internal */
  async request<T>(query: string, variables: Record<string, unknown> = {}): Promise<T> {
    const cacheKey = MemoryCache.key(query, variables);

    const cached = await this.cacheAdapter.get<T>(cacheKey);
    if (cached !== undefined) {
      this.hooks.onCacheHit?.(cacheKey);
      this.logger?.debug("Cache hit", { cacheKey });
      const meta: ResponseMeta = { durationMs: 0, fromCache: true };
      this._lastRequestMeta = meta;
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
    this.logger?.debug("API request", { variables });

    const minifiedQuery = normalizeQuery(query);

    let res: Response;
    try {
      res = await this.rateLimiter.fetchWithRetry(
        this.apiUrl,
        {
          method: "POST",
          headers: this.headers,
          body: JSON.stringify({ query: minifiedQuery, variables }),
          signal: this.signal,
        },
        { onRetry: this.hooks.onRetry, onRateLimit: this.hooks.onRateLimit },
      );
    } catch (err) {
      const error =
        err instanceof AniListError
          ? err
          : new AniListError((err as Error).message ?? "Network request failed", 0, [err]);
      this.logger?.error("Request failed", { error: error.message, status: error.status });
      this.hooks.onError?.(error, query, variables);
      throw error;
    }

    let json: { data?: T; errors?: unknown[] };
    try {
      json = (await res.json()) as { data?: T; errors?: unknown[] };
    } catch {
      const error = new AniListError(`Non-JSON response from AniList (HTTP ${res.status})`, res.status, []);
      this.logger?.error("Request failed", { error: error.message, status: error.status });
      this.hooks.onError?.(error, query, variables);
      throw error;
    }

    if (!res.ok || json.errors) {
      const message =
        (json.errors as Array<{ message?: string }>)?.[0]?.message ?? `AniList API error (HTTP ${res.status})`;
      const error = new AniListError(message, res.status, json.errors ?? []);
      this.logger?.error("Request failed", { error: error.message, status: error.status });
      this.hooks.onError?.(error, query, variables);
      throw error;
    }

    const rlLimit = res.headers.get("X-RateLimit-Limit");
    const rlRemaining = res.headers.get("X-RateLimit-Remaining");
    const rlReset = res.headers.get("X-RateLimit-Reset");
    if (rlLimit && rlRemaining && rlReset) {
      this._rateLimitInfo = {
        limit: Number.parseInt(rlLimit, 10),
        remaining: Number.parseInt(rlRemaining, 10),
        reset: Number.parseInt(rlReset, 10),
      };
    }

    const durationMs = Date.now() - start;
    const data = json.data as T;
    await this.cacheAdapter.set(cacheKey, data);

    const meta: ResponseMeta = { durationMs, fromCache: false, rateLimitInfo: this._rateLimitInfo };
    this._lastRequestMeta = meta;
    this.logger?.debug("Request complete", { durationMs, rateLimitInfo: this._rateLimitInfo });
    this.hooks.onResponse?.(query, durationMs, false, this._rateLimitInfo);
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

  async getMediaCharacters(
    mediaId: number,
    options: GetMediaCharactersOptions = {},
  ): Promise<PagedResult<MediaCharacterEdge>> {
    return mediaMethods.getMediaCharacters(this, mediaId, options);
  }

  async getMediaStaff(mediaId: number, options: GetMediaStaffOptions = {}): Promise<PagedResult<MediaStaffEdge>> {
    return mediaMethods.getMediaStaff(this, mediaId, options);
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
  async getTrending(options: GeneralMediaQueryOptions = {}): Promise<PagedResult<Media>> {
    return mediaMethods.getTrending(this, options);
  }

  /** Get the most popular anime or manga. */
  async getPopular(options: GeneralMediaQueryOptions = {}): Promise<PagedResult<Media>> {
    return mediaMethods.getPopular(this, options);
  }

  /** Get the highest-rated anime or manga. */
  async getTopRated(options: GeneralMediaQueryOptions = {}): Promise<PagedResult<Media>> {
    return mediaMethods.getTopRated(this, options);
  }

  /** Get recently aired anime episodes. */
  async getAiredEpisodes(options: GetAiringOptions = {}): Promise<PagedResult<AiringSchedule>> {
    return mediaMethods.getAiredEpisodes(this, options);
  }

  /**
   * Get currently releasing manga sorted by most recently updated.
   *
   * @param options - Pagination parameters
   */
  async getRecentlyUpdatedManga(options: GetRecentChaptersOptions = {}): Promise<PagedResult<Media>> {
    return mediaMethods.getRecentlyUpdatedManga(this, options);
  }

  /**
   * @deprecated Use `getRecentlyUpdatedManga()` instead. This alias will be removed in v3.
   */
  async getAiredChapters(options: GetRecentChaptersOptions = {}): Promise<PagedResult<Media>> {
    return this.getRecentlyUpdatedManga(options);
  }

  /**
   * Fetch a media entry by its MyAnimeList (MAL) ID.
   *
   * @param malId - The MyAnimeList ID
   * @param type - Optional media type to disambiguate (some MAL IDs map to both ANIME and MANGA)
   */
  async getMediaByMalId(malId: number, type?: MediaType): Promise<Media> {
    return mediaMethods.getMediaByMalId(this, malId, type);
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

  /** Fetch a character by AniList ID. Pass `{ voiceActors: true }` to include VA data. */
  async getCharacter(id: number, include?: CharacterIncludeOptions): Promise<Character> {
    return characterMethods.getCharacter(this, id, include);
  }

  /** Search for characters by name. */
  async searchCharacters(options: SearchCharacterOptions = {}): Promise<PagedResult<Character>> {
    return characterMethods.searchCharacters(this, options);
  }

  /** Fetch a staff member by AniList ID. Pass `{ media: true }` or `{ media: { perPage } }` for media credits. */
  async getStaff(id: number, include?: StaffIncludeOptions): Promise<Staff> {
    return staffMethods.getStaff(this, id, include);
  }

  /** Search for staff (voice actors, directors, etc.). */
  async searchStaff(options: SearchStaffOptions = {}): Promise<PagedResult<Staff>> {
    return staffMethods.searchStaff(this, options);
  }

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

  /**
   * Fetch a user's favorite anime, manga, characters, staff, and studios.
   *
   * @param idOrName - AniList user ID (number) or username (string)
   * @param options - Optional pagination options (perPage per category)
   * @returns The user's favorites grouped by category
   *
   * @example
   * ```typescript
   * const favs = await client.getUserFavorites("AniList");
   * favs.anime.forEach(a => console.log(a.title.romaji));
   *
   * // Fetch more results per category
   * const moreResults = await client.getUserFavorites(1, { perPage: 50 });
   * ```
   */
  async getUserFavorites(idOrName: number | string, options?: UserFavoritesOptions): Promise<UserFavorites> {
    return userMethods.getUserFavorites(this, idOrName, options);
  }

  /**
   * Fetch a studio by its AniList ID.
   * Pass `include` to customise the number of media returned.
   *
   * @example
   * ```typescript
   * const studio = await client.getStudio(21, { media: { perPage: 50 } });
   * ```
   */
  async getStudio(id: number, include?: StudioIncludeOptions): Promise<Studio> {
    return studioMethods.getStudio(this, id, include);
  }

  /** Search for studios by name. */
  async searchStudios(options: SearchStudioOptions = {}): Promise<PagedResult<Studio>> {
    return studioMethods.searchStudios(this, options);
  }

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

  /** Execute an arbitrary GraphQL query against the AniList API. */
  async raw<T>(query: string, variables?: Record<string, unknown>): Promise<T> {
    return this.request<T>(query, variables ?? {});
  }

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

  /** Fetch multiple media entries in a single API request. */
  async getMediaBatch(ids: number[]): Promise<Media[]> {
    if (ids.length === 0) return [];
    validateIds(ids, "mediaId");
    const [singleMediaId] = ids;
    if (ids.length === 1 && singleMediaId !== undefined) return [await this.getMedia(singleMediaId)];
    return this.executeBatch<Media>(ids, buildBatchMediaQuery, "m");
  }

  /** Fetch multiple characters in a single API request. */
  async getCharacterBatch(ids: number[]): Promise<Character[]> {
    if (ids.length === 0) return [];
    validateIds(ids, "characterId");
    const [singleCharId] = ids;
    if (ids.length === 1 && singleCharId !== undefined) return [await this.getCharacter(singleCharId)];
    return this.executeBatch<Character>(ids, buildBatchCharacterQuery, "c");
  }

  /** Fetch multiple staff members in a single API request. */
  async getStaffBatch(ids: number[]): Promise<Staff[]> {
    if (ids.length === 0) return [];
    validateIds(ids, "staffId");
    const [singleStaffId] = ids;
    if (ids.length === 1 && singleStaffId !== undefined) return [await this.getStaff(singleStaffId)];
    return this.executeBatch<Staff>(ids, buildBatchStaffQuery, "s");
  }

  /** @internal */
  private async executeBatch<T>(ids: number[], buildQuery: (ids: number[]) => string, prefix: string): Promise<T[]> {
    const chunks = chunk(ids, 50);
    const chunkResults = await Promise.all(
      chunks.map(async (idChunk) => {
        const query = buildQuery(idChunk);
        const data = await this.request<Record<string, T>>(query);
        return idChunk.map((_, i) => data[`${prefix}${i}`] as T);
      }),
    );
    return chunkResults.flat();
  }

  /** Clear the entire response cache. */
  async clearCache(): Promise<void> {
    await this.cacheAdapter.clear();
  }

  /** Number of entries currently in the cache. */
  async cacheSize(): Promise<number> {
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
    this.rateLimiter.dispose();
  }

  /**
   * Return a scoped view of this client where every request uses the given `AbortSignal`.
   * The returned object shares the same cache, rate limiter, and hooks.
   *
   * @example
   * ```ts
   * const controller = new AbortController();
   * const media = await client.withSignal(controller.signal).getMedia(1);
   *
   * // Cancel all in-flight requests made through the scoped view
   * controller.abort();
   * ```
   */
  withSignal(signal: AbortSignal): AniListClient {
    const scoped = Object.create(this) as AniListClient;
    Object.defineProperty(scoped, "signal", { value: signal, configurable: true });
    return scoped;
  }
}
