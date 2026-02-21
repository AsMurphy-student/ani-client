import { afterEach, describe, expect, it, vi } from "vitest";
import { RateLimiter } from "../../src/rate-limiter";

describe("RateLimiter", () => {
  const originalFetch = globalThis.fetch;

  afterEach(() => {
    globalThis.fetch = originalFetch;
  });

  it("aborts requests after timeout", async () => {
    const limiter = new RateLimiter({
      timeoutMs: 100,
      enabled: false,
      maxRetries: 0,
      retryOnNetworkError: false,
    });

    globalThis.fetch = vi.fn(
      (_url: string | URL | Request, init?: RequestInit) =>
        new Promise<Response>((_resolve, reject) => {
          const timer = setTimeout(() => _resolve(new Response()), 10_000);
          init?.signal?.addEventListener("abort", () => {
            clearTimeout(timer);
            reject(new DOMException("The operation was aborted.", "AbortError"));
          });
        }),
    );

    await expect(limiter.fetchWithRetry("https://example.com", {})).rejects.toThrow("aborted");
  });

  it("retries on network errors", async () => {
    const limiter = new RateLimiter({
      enabled: false,
      retryDelayMs: 10,
      maxRetries: 2,
      timeoutMs: 0,
    });

    let calls = 0;
    globalThis.fetch = vi.fn(() => {
      calls++;
      if (calls <= 2) return Promise.reject(new TypeError("fetch failed"));
      return Promise.resolve(new Response(JSON.stringify({}), { status: 200 }));
    });

    const res = await limiter.fetchWithRetry("https://example.com", {});
    expect(res.status).toBe(200);
    expect(calls).toBe(3);
  });

  it("retries on 429 with Retry-After header", async () => {
    const limiter = new RateLimiter({
      enabled: false,
      retryDelayMs: 10,
      maxRetries: 1,
      timeoutMs: 0,
    });

    let calls = 0;
    globalThis.fetch = vi.fn(() => {
      calls++;
      if (calls === 1) {
        return Promise.resolve(new Response("", { status: 429, headers: { "Retry-After": "0" } }));
      }
      return Promise.resolve(new Response(JSON.stringify({}), { status: 200 }));
    });

    const res = await limiter.fetchWithRetry("https://example.com", {});
    expect(res.status).toBe(200);
    expect(calls).toBe(2);
  });

  it("calls onRetry hook on network retry", async () => {
    const limiter = new RateLimiter({
      enabled: false,
      retryDelayMs: 10,
      maxRetries: 1,
      timeoutMs: 0,
    });
    const onRetry = vi.fn();

    let calls = 0;
    globalThis.fetch = vi.fn(() => {
      calls++;
      if (calls === 1) return Promise.reject(new TypeError("fetch failed"));
      return Promise.resolve(new Response(JSON.stringify({}), { status: 200 }));
    });

    await limiter.fetchWithRetry("https://example.com", {}, { onRetry });
    expect(onRetry).toHaveBeenCalledOnce();
    expect(onRetry.mock.calls[0][0]).toBe(1); // attempt
  });

  it("calls onRateLimit hook on 429", async () => {
    const limiter = new RateLimiter({
      enabled: false,
      retryDelayMs: 10,
      maxRetries: 1,
      timeoutMs: 0,
    });
    const onRateLimit = vi.fn();

    let calls = 0;
    globalThis.fetch = vi.fn(() => {
      calls++;
      if (calls === 1) {
        return Promise.resolve(new Response("", { status: 429 }));
      }
      return Promise.resolve(new Response(JSON.stringify({}), { status: 200 }));
    });

    await limiter.fetchWithRetry("https://example.com", {}, { onRateLimit });
    expect(onRateLimit).toHaveBeenCalledOnce();
  });

  it("does not retry network errors when retryOnNetworkError is false", async () => {
    const limiter = new RateLimiter({
      enabled: false,
      retryDelayMs: 10,
      maxRetries: 2,
      timeoutMs: 0,
      retryOnNetworkError: false,
    });

    globalThis.fetch = vi.fn(() => Promise.reject(new TypeError("fetch failed")));

    await expect(limiter.fetchWithRetry("https://example.com", {})).rejects.toThrow("fetch failed");
    expect(vi.mocked(fetch)).toHaveBeenCalledTimes(1);
  });

  it("respects rate limit window", async () => {
    const limiter = new RateLimiter({
      maxRequests: 2,
      windowMs: 100,
      timeoutMs: 0,
    });

    globalThis.fetch = vi.fn(() => Promise.resolve(new Response(JSON.stringify({}), { status: 200 })));

    // These should both pass through immediately
    await limiter.fetchWithRetry("https://example.com", {});
    await limiter.fetchWithRetry("https://example.com", {});

    expect(vi.mocked(fetch)).toHaveBeenCalledTimes(2);
  });
});
