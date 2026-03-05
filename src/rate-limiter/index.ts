/**
 * Rate limiter with automatic retry for AniList API.
 *
 * AniList allows 90 requests per minute.
 * When a 429 (Too Many Requests) is received, the client
 * waits for the Retry-After header and retries automatically.
 */

import type { RateLimitOptions } from "../types";
export type { RateLimitOptions };

export class RateLimiter {
  private readonly maxRequests: number;
  private readonly windowMs: number;
  private readonly maxRetries: number;
  private readonly retryDelayMs: number;
  private readonly enabled: boolean;
  private readonly timeoutMs: number;
  private readonly retryOnNetworkError: boolean;
  private readonly retryStrategy?: (attempt: number, baseDelayMs: number) => number;

  /** @internal — sliding window: circular buffer of timestamps */
  private readonly timestamps: number[];
  private head = 0;
  private count = 0;
  /** @internal — active sleep timers for cleanup */
  private readonly activeTimers = new Set<ReturnType<typeof setTimeout>>();

  constructor(options: RateLimitOptions = {}) {
    this.maxRequests = options.maxRequests ?? 85;
    this.windowMs = options.windowMs ?? 60_000;
    this.maxRetries = options.maxRetries ?? 3;
    this.retryDelayMs = options.retryDelayMs ?? 2_000;
    this.enabled = options.enabled ?? true;
    this.timeoutMs = options.timeoutMs ?? 30_000;
    this.retryOnNetworkError = options.retryOnNetworkError ?? true;
    this.retryStrategy = options.retryStrategy;
    this.timestamps = new Array<number>(this.maxRequests).fill(0);
  }

  /**
   * Wait until it's safe to make a request (respects rate limit window).
   */
  async acquire(): Promise<void> {
    if (!this.enabled) return;

    if (this.count >= this.maxRequests) {
      const oldest = this.timestamps[this.head] as number;
      const elapsed = Date.now() - oldest;
      if (elapsed < this.windowMs) {
        const waitMs = this.windowMs - elapsed + 50;
        await this.sleep(waitMs);
      }
    }

    const now = Date.now();
    if (this.count < this.maxRequests) {
      this.timestamps[(this.head + this.count) % this.maxRequests] = now;
      this.count++;
    } else {
      this.timestamps[this.head] = now;
      this.head = (this.head + 1) % this.maxRequests;
    }
  }

  /**
   * Execute a fetch with automatic retry on 429 responses and network errors.
   * Uses exponential backoff with jitter for retry delays.
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
        const delayMs = retryAfter ? Number.parseInt(retryAfter, 10) * 1000 : this.exponentialDelay(attempt);

        hooks?.onRateLimit?.(delayMs);
        hooks?.onRetry?.(attempt + 1, "HTTP 429", delayMs);

        await this.sleep(delayMs);
        await this.acquire();
      } catch (err) {
        lastError = err;

        if (this.retryOnNetworkError && isNetworkError(err) && attempt < this.maxRetries) {
          const delayMs = this.exponentialDelay(attempt);
          hooks?.onRetry?.(attempt + 1, `Network error: ${(err as Error).message}`, delayMs);
          await this.sleep(delayMs);
          await this.acquire();
          continue;
        }

        throw err;
      }
    }

    if (lastResponse) return lastResponse;
    throw lastError ?? new Error(`Request failed after ${this.maxRetries} retries`);
  }

  /** @internal — Exponential backoff with jitter, capped at 30s (or custom strategy) */
  private exponentialDelay(attempt: number): number {
    if (this.retryStrategy) {
      return this.retryStrategy(attempt, this.retryDelayMs);
    }
    const base = this.retryDelayMs * 2 ** attempt;
    const jitter = Math.random() * 1000;
    return Math.min(base + jitter, 30_000);
  }

  /** @internal */
  private async fetchWithTimeout(url: string, init: RequestInit): Promise<Response> {
    if (this.timeoutMs <= 0) return fetch(url, init);

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), this.timeoutMs);

    const signals = [controller.signal, init.signal].filter(Boolean) as AbortSignal[];
    const combinedSignal = signals.length > 1 ? AbortSignal.any(signals) : signals[0];

    try {
      return await fetch(url, { ...init, signal: combinedSignal });
    } finally {
      clearTimeout(timer);
    }
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => {
      const timer = setTimeout(() => {
        this.activeTimers.delete(timer);
        resolve();
      }, ms);
      this.activeTimers.add(timer);
    });
  }

  /** Cancel all pending sleep timers and reset internal state. */
  dispose(): void {
    for (const timer of this.activeTimers) {
      clearTimeout(timer);
    }
    this.activeTimers.clear();
    this.head = 0;
    this.count = 0;
    this.timestamps.fill(0);
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
