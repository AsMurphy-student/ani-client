export interface PageInfo {
  total: number | null;
  perPage: number | null;
  currentPage: number | null;
  lastPage: number | null;
  hasNextPage: boolean | null;
}

export interface PagedResult<T> {
  pageInfo: PageInfo;
  results: T[];
}

export interface FuzzyDate {
  year: number | null;
  month: number | null;
  day: number | null;
}

export interface ExternalLink {
  id: number;
  url: string | null;
  site: string;
  type: string | null;
  icon: string | null;
  color: string | null;
}

/**
 * Interface that all cache adapters must implement.
 * Methods may return sync values or Promises — the client awaits all calls.
 */
export interface CacheAdapter {
  /** Retrieve a cached value, or `undefined` if missing / expired. */
  get<T>(key: string): T | undefined | Promise<T | undefined>;
  /** Store a value in the cache. */
  set<T>(key: string, data: T): void | Promise<void>;
  /** Remove a specific entry. Returns `true` if the key existed. */
  delete(key: string): boolean | Promise<boolean>;
  /** Clear the entire cache. */
  clear(): void | Promise<void>;
  /** Number of entries currently stored. */
  readonly size: number | Promise<number>;
  /** Return all cache keys. */
  keys(): string[] | Promise<string[]>;
  /** Bulk-remove entries matching a pattern. Optional — the client provides a fallback. */
  invalidate?(pattern: string | RegExp): number | Promise<number>;
}

/** Cache configuration options. */
export interface CacheOptions {
  /** Time-to-live in milliseconds (default: 86 400 000 = 24h) */
  ttl?: number;
  /** Maximum number of cached entries (default: 500, 0 = unlimited) */
  maxSize?: number;
  /** Set to false to disable caching entirely */
  enabled?: boolean;
  /**
   * Stale-while-revalidate grace period in milliseconds (default: 0 = disabled).
   * When set, expired entries are still returned within the grace window,
   * allowing the caller to refresh in the background.
   */
  staleWhileRevalidateMs?: number;
}

/** Rate limiter configuration options. */
export interface RateLimitOptions {
  /** Max requests per window (default: 85) */
  maxRequests?: number;
  /** Window size in ms (default: 60 000) */
  windowMs?: number;
  /** Max retries on 429 (default: 3) */
  maxRetries?: number;
  /** Retry delay in ms when Retry-After header is absent (default: 2000) */
  retryDelayMs?: number;
  /** Set to false to disable rate limiting entirely */
  enabled?: boolean;
  /** Timeout per request in ms (default: 30 000). 0 = no timeout. */
  timeoutMs?: number;
  /** Retry on network errors like ECONNRESET / ETIMEDOUT (default: true) */
  retryOnNetworkError?: boolean;
  /**
   * Custom retry delay strategy. Receives the attempt number (0-based) and the base delay,
   * and should return the delay in ms before retrying.
   * When omitted, the default exponential backoff with jitter is used.
   *
   * @example
   * // Linear backoff: 1s, 2s, 3s, ...
   * retryStrategy: (attempt) => (attempt + 1) * 1000
   */
  retryStrategy?: (attempt: number, baseDelayMs: number) => number;
}

/** Event hooks for logging, debugging, and monitoring. */
export interface AniListHooks {
  /** Called before every API request. */
  onRequest?: (query: string, variables: Record<string, unknown>) => void;
  /** Called when a response is served from cache. */
  onCacheHit?: (key: string) => void;
  /** Called when the rate limiter enforces a wait (429 received). */
  onRateLimit?: (retryAfterMs: number) => void;
  /** Called when a request is retried (429 or network error). */
  onRetry?: (attempt: number, reason: string, delayMs: number) => void;
  /** Called when a request completes. */
  onResponse?: (query: string, durationMs: number, fromCache: boolean, rateLimitInfo?: RateLimitInfo) => void;
  /** Called when a request fails with an error. */
  onError?: (error: Error, query: string, variables: Record<string, unknown>) => void;
}

/** Rate limit information parsed from AniList API response headers. */
export interface RateLimitInfo {
  /** Maximum number of requests allowed per window. */
  limit: number;
  /** Remaining requests in the current window. */
  remaining: number;
  /** UNIX timestamp (seconds) when the rate limit window resets. */
  reset: number;
}

/** Metadata about the last request, useful for debugging and monitoring. */
export interface ResponseMeta {
  /** Duration of the request in milliseconds. */
  durationMs: number;
  /** Whether the response was served from cache. */
  fromCache: boolean;
  /** Rate limit information from the API response headers (not present for cached responses). */
  rateLimitInfo?: RateLimitInfo;
}

/**
 * Minimal logger interface for structured log output.
 * Compatible with `console`, `pino`, `winston`, etc.
 */
export interface Logger {
  debug(message: string, ...args: unknown[]): void;
  info(message: string, ...args: unknown[]): void;
  warn(message: string, ...args: unknown[]): void;
  error(message: string, ...args: unknown[]): void;
}

export interface AniListClientOptions {
  /** Optional AniList OAuth token for authenticated requests */
  token?: string;
  /** Custom API endpoint (defaults to https://graphql.anilist.co) */
  apiUrl?: string;
  /** Cache configuration (enabled by default, 24h TTL) */
  cache?: CacheOptions;
  /** Custom cache adapter (e.g. RedisCache). Takes precedence over `cache`. */
  cacheAdapter?: CacheAdapter;
  /** Rate limiter configuration (enabled by default, 85 req/min) */
  rateLimit?: RateLimitOptions;
  /** Event hooks for logging, debugging, and monitoring */
  hooks?: AniListHooks;
  /** Optional AbortSignal to cancel all requests made by this client */
  signal?: AbortSignal;
  /**
   * Optional logger for structured log output.
   * Accepts any object with `debug`, `info`, `warn`, `error` methods.
   * Compatible with `console`, `pino`, `winston`, etc.
   *
   * @example
   * ```ts
   * const client = new AniListClient({ logger: console });
   * ```
   */
  logger?: Logger;
}
