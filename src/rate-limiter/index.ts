/**
 * Rate limiter with automatic retry for AniList API.
 *
 * AniList allows 90 requests per minute.
 * When a 429 (Too Many Requests) is received, the client
 * waits for the Retry-After header and retries automatically.
 */

export interface RateLimitOptions {
  /** Max requests per window (default: 85, conservative under AniList's 90/min) */
  maxRequests?: number;
  /** Window size in milliseconds (default: 60 000 = 1 minute) */
  windowMs?: number;
  /** Max number of retries on 429 responses (default: 3) */
  maxRetries?: number;
  /** Default retry delay in ms when Retry-After header is missing (default: 2000) */
  retryDelayMs?: number;
  /** Disable rate limiting entirely (default: false) */
  enabled?: boolean;
  /** Timeout per request in milliseconds (default: 30 000). 0 = no timeout. */
  timeoutMs?: number;
  /** Retry on network errors like ECONNRESET / ETIMEDOUT (default: true) */
  retryOnNetworkError?: boolean;
}

export class RateLimiter {
  private readonly maxRequests: number;
  private readonly windowMs: number;
  private readonly maxRetries: number;
  private readonly retryDelayMs: number;
  private readonly enabled: boolean;
  private readonly timeoutMs: number;
  private readonly retryOnNetworkError: boolean;

  /** @internal */
  private timestamps: number[] = [];

  constructor(options: RateLimitOptions = {}) {
    this.maxRequests = options.maxRequests ?? 85;
    this.windowMs = options.windowMs ?? 60_000;
    this.maxRetries = options.maxRetries ?? 3;
    this.retryDelayMs = options.retryDelayMs ?? 2_000;
    this.enabled = options.enabled ?? true;
    this.timeoutMs = options.timeoutMs ?? 30_000;
    this.retryOnNetworkError = options.retryOnNetworkError ?? true;
  }

  /**
   * Wait until it's safe to make a request (respects rate limit window).
   */
  async acquire(): Promise<void> {
    if (!this.enabled) return;

    const now = Date.now();
    this.timestamps = this.timestamps.filter((t) => now - t < this.windowMs);

    if (this.timestamps.length >= this.maxRequests) {
      const oldest = this.timestamps[0]!;
      const waitMs = this.windowMs - (now - oldest) + 50;
      await this.sleep(waitMs);
      return this.acquire(); // Re-check after waiting
    }

    this.timestamps.push(Date.now());
  }

  /**
   * Execute a fetch with automatic retry on 429 responses and network errors.
   */
  async fetchWithRetry(
    url: string,
    init: RequestInit,
    hooks?: {
      onRetry?: (attempt: number, reason: string, delayMs: number) => void;
      onRateLimit?: (retryAfterMs: number) => void;
    },
  ): Promise<Response> {
    await this.acquire();

    let lastResponse: Response | undefined;
    let lastError: unknown;

    for (let attempt = 0; attempt <= this.maxRetries; attempt++) {
      try {
        const res = await this.fetchWithTimeout(url, init);

        if (res.status !== 429) return res;

        lastResponse = res;
        if (attempt === this.maxRetries) break;

        const retryAfter = res.headers.get("Retry-After");
        const delayMs = retryAfter ? Number.parseInt(retryAfter, 10) * 1000 : this.retryDelayMs * (attempt + 1);

        hooks?.onRateLimit?.(delayMs);
        hooks?.onRetry?.(attempt + 1, "HTTP 429", delayMs);

        await this.sleep(delayMs);
        await this.acquire();
      } catch (err) {
        lastError = err;

        if (this.retryOnNetworkError && isNetworkError(err) && attempt < this.maxRetries) {
          const delayMs = this.retryDelayMs * (attempt + 1);
          hooks?.onRetry?.(attempt + 1, `Network error: ${(err as Error).message}`, delayMs);
          await this.sleep(delayMs);
          await this.acquire();
          continue;
        }

        throw err;
      }
    }

    if (lastResponse) return lastResponse;
    throw lastError;
  }

  /** @internal */
  private async fetchWithTimeout(url: string, init: RequestInit): Promise<Response> {
    if (this.timeoutMs <= 0) return fetch(url, init);

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), this.timeoutMs);

    try {
      return await fetch(url, { ...init, signal: controller.signal });
    } finally {
      clearTimeout(timer);
    }
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

/** Set of Node.js error codes that indicate a transient network failure. */
const RETRYABLE_NETWORK_CODES = new Set([
  "ECONNRESET",
  "ECONNREFUSED",
  "ETIMEDOUT",
  "ENOTFOUND",
  "EAI_AGAIN",
  "UND_ERR_CONNECT_TIMEOUT",
  "UND_ERR_SOCKET",
]);

/** @internal */
function isNetworkError(err: unknown): boolean {
  if (err instanceof TypeError && err.message === "fetch failed") return true;
  const code = (err as NodeJS.ErrnoException)?.code;
  if (code && RETRYABLE_NETWORK_CODES.has(code)) return true;
  const cause = (err as { cause?: { code?: string } })?.cause?.code;
  if (cause && RETRYABLE_NETWORK_CODES.has(cause)) return true;
  return false;
}
