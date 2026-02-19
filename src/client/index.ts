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
  PagedResult,
  SearchMediaOptions,
  SearchCharacterOptions,
  SearchStaffOptions,
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
