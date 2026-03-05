/**
 * Tests for all bugs and issues identified in the project audit.
 */
import { afterEach, describe, expect, it, vi } from "vitest";
import { AniListClient, AniListError, MediaType, MemoryCache } from "../../src";
import { chunk } from "../../src/utils";

// ── Helpers ──

const originalFetch = globalThis.fetch;

function mockFetchJson(data: unknown, status = 200) {
  globalThis.fetch = vi.fn(() =>
    Promise.resolve(
      new Response(JSON.stringify({ data }), {
        status,
        headers: { "Content-Type": "application/json" },
      }),
    ),
  );
}

function mockFetchHtml(body: string, status: number) {
  globalThis.fetch = vi.fn(() =>
    Promise.resolve(
      new Response(body, {
        status,
        headers: { "Content-Type": "text/html" },
      }),
    ),
  );
}

afterEach(() => {
  globalThis.fetch = originalFetch;
});

// ── Bug #1: chunk() infinite loop when size <= 0 ──

describe("chunk() size guard", () => {
  it("throws RangeError when size is 0", () => {
    expect(() => chunk([1, 2, 3], 0)).toThrow(RangeError);
    expect(() => chunk([1, 2, 3], 0)).toThrow("chunk size must be >= 1");
  });

  it("throws RangeError when size is negative", () => {
    expect(() => chunk([1, 2, 3], -1)).toThrow(RangeError);
  });

  it("throws RangeError when size is fractional < 1", () => {
    expect(() => chunk([1, 2, 3], 0.5)).toThrow(RangeError);
  });

  it("still works with valid sizes", () => {
    expect(chunk([1, 2, 3, 4], 2)).toEqual([
      [1, 2],
      [3, 4],
    ]);
    expect(chunk([1, 2, 3], 1)).toEqual([[1], [2], [3]]);
    expect(chunk([], 5)).toEqual([]);
  });
});

// ── Bug #2: non-JSON response crash ──

describe("non-JSON response handling", () => {
  it("throws AniListError with status on HTML response (502)", async () => {
    mockFetchHtml("<html>Bad Gateway</html>", 502);
    const client = new AniListClient();

    await expect(client.getMedia(1)).rejects.toThrow(AniListError);
    await expect(client.getMedia(1)).rejects.toThrow("Non-JSON response");
  });

  it("throws AniListError with status on HTML response (503)", async () => {
    mockFetchHtml("<html>Service Unavailable</html>", 503);
    const client = new AniListClient();

    await expect(client.getMedia(1)).rejects.toThrow(AniListError);
  });

  it("includes HTTP status code in the error", async () => {
    mockFetchHtml("<html>Bad Gateway</html>", 502);
    const client = new AniListClient();

    try {
      await client.getMedia(1);
      expect.unreachable("should have thrown");
    } catch (e) {
      expect(e).toBeInstanceOf(AniListError);
      expect((e as AniListError).status).toBe(502);
    }
  });

  it("fires logger.error and onError hook on non-JSON response", async () => {
    mockFetchHtml("<html>Bad Gateway</html>", 502);
    const errorSpy = vi.fn();
    const hookSpy = vi.fn();
    const client = new AniListClient({
      logger: { debug: vi.fn(), info: vi.fn(), warn: vi.fn(), error: errorSpy },
      hooks: { onError: hookSpy },
    });

    await expect(client.getMedia(1)).rejects.toThrow(AniListError);
    expect(errorSpy).toHaveBeenCalledWith("Request failed", expect.objectContaining({ status: 502 }));
    expect(hookSpy).toHaveBeenCalledWith(expect.any(AniListError), expect.any(String), expect.anything());
  });
});

// ── Bug #3: throw undefined after retries ──

describe("rate limiter retry fallback error", () => {
  it("throws meaningful error after exhausting retries", async () => {
    const client = new AniListClient({ rateLimit: { enabled: true, maxRetries: 1 } });

    // Mock fetch to always return 429 with retry-after
    globalThis.fetch = vi.fn(() =>
      Promise.resolve(
        new Response(JSON.stringify({ errors: [{ message: "rate limited" }] }), {
          status: 429,
          headers: {
            "Content-Type": "application/json",
            "Retry-After": "0",
            "X-RateLimit-Remaining": "0",
            "X-RateLimit-Reset": String(Math.floor(Date.now() / 1000) + 1),
          },
        }),
      ),
    );

    // It should throw some error (not undefined)
    await expect(client.getMedia(1)).rejects.toThrow();
  });
});

// ── Bug #7: getUserMediaList error type ──

describe("getUserMediaList validation error type", () => {
  it("throws TypeError (not AniListError) when neither userId nor userName provided", async () => {
    mockFetchJson({});
    const client = new AniListClient();

    await expect(client.getUserMediaList({ type: MediaType.ANIME })).rejects.toThrow(TypeError);

    await expect(client.getUserMediaList({ type: MediaType.ANIME })).rejects.toThrow(
      "getUserMediaList requires either userId or userName",
    );
  });

  it("does not throw TypeError when userId is provided", async () => {
    mockFetchJson({
      Page: {
        pageInfo: { total: 0, perPage: 20, currentPage: 1, lastPage: 1, hasNextPage: false },
        mediaList: [],
      },
    });
    const client = new AniListClient();

    const result = await client.getUserMediaList({ userId: 1, type: MediaType.ANIME });
    expect(result).toBeDefined();
  });
});

// ── Redis invalidate substring semantics ──

describe("MemoryCache invalidate substring consistency", () => {
  it("invalidates by substring match with string pattern", () => {
    const cache = new MemoryCache();
    cache.set("media:1", { id: 1 });
    cache.set("media:2", { id: 2 });
    cache.set("character:1", { id: 1 });

    const removed = cache.invalidate("media");
    expect(removed).toBe(2);
  });

  it("invalidates by regex pattern", () => {
    const cache = new MemoryCache();
    cache.set("media:1", { id: 1 });
    cache.set("media:2", { id: 2 });
    cache.set("character:1", { id: 1 });

    const removed = cache.invalidate(/^media:/);
    expect(removed).toBe(2);
  });
});
