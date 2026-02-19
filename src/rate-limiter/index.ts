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
}

export class RateLimiter {
  private readonly maxRequests: number;
  private readonly windowMs: number;
  private readonly maxRetries: number;
  private readonly retryDelayMs: number;
  private readonly enabled: boolean;

  /** @internal */
  private timestamps: number[] = [];

  constructor(options: RateLimitOptions = {}) {
    this.maxRequests = options.maxRequests ?? 85;
    this.windowMs = options.windowMs ?? 60_000;
    this.maxRetries = options.maxRetries ?? 3;
    this.retryDelayMs = options.retryDelayMs ?? 2_000;
    this.enabled = options.enabled ?? true;
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
   * Execute a fetch with automatic retry on 429 responses.
   */
  async fetchWithRetry(
    url: string,
    init: RequestInit,
  ): Promise<Response> {
    await this.acquire();

    let lastResponse: Response | undefined;

    for (let attempt = 0; attempt <= this.maxRetries; attempt++) {
      const res = await fetch(url, init);

      if (res.status !== 429) {
        return res;
      }

      lastResponse = res;

      if (attempt === this.maxRetries) break;

      const retryAfter = res.headers.get("Retry-After");
      const delayMs = retryAfter
        ? parseInt(retryAfter, 10) * 1000
        : this.retryDelayMs * (attempt + 1);

      await this.sleep(delayMs);
      await this.acquire();
    }

    return lastResponse!;
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
