import { afterEach, describe, expect, it, vi } from "vitest";
import { AniListClient, AniListError } from "../../src";

describe("AniListClient error handling", () => {
  const originalFetch = globalThis.fetch;

  afterEach(() => {
    globalThis.fetch = originalFetch;
  });

  it("throws AniListError when API returns errors array", async () => {
    globalThis.fetch = vi.fn(() =>
      Promise.resolve(
        new Response(
          JSON.stringify({
            data: null,
            errors: [{ message: "Not Found.", status: 404 }],
          }),
          { status: 404, headers: { "Content-Type": "application/json" } },
        ),
      ),
    );

    const client = new AniListClient({ cache: { enabled: false }, rateLimit: { enabled: false } });

    await expect(client.getMedia(1)).rejects.toThrow(AniListError);
    await expect(client.getMedia(2)).rejects.toThrow("Not Found.");
  });

  it("throws AniListError with status code and errors", async () => {
    globalThis.fetch = vi.fn(() =>
      Promise.resolve(
        new Response(
          JSON.stringify({
            errors: [{ message: "Validation error", status: 400 }],
          }),
          { status: 400, headers: { "Content-Type": "application/json" } },
        ),
      ),
    );

    const client = new AniListClient({ cache: { enabled: false }, rateLimit: { enabled: false } });

    try {
      await client.getMedia(1);
      expect.unreachable("Should have thrown");
    } catch (err) {
      expect(err).toBeInstanceOf(AniListError);
      const error = err as AniListError;
      expect(error.status).toBe(400);
      expect(error.errors).toHaveLength(1);
      expect(error.message).toBe("Validation error");
    }
  });

  it("throws AniListError with fallback message when errors have no message", async () => {
    globalThis.fetch = vi.fn(() =>
      Promise.resolve(
        new Response(JSON.stringify({ errors: [{}] }), {
          status: 500,
          headers: { "Content-Type": "application/json" },
        }),
      ),
    );

    const client = new AniListClient({ cache: { enabled: false }, rateLimit: { enabled: false } });

    try {
      await client.getMedia(1);
      expect.unreachable("Should have thrown");
    } catch (err) {
      expect(err).toBeInstanceOf(AniListError);
      const error = err as AniListError;
      expect(error.message).toContain("HTTP 500");
    }
  });

  it("throws AniListError when response is not ok and has no errors", async () => {
    globalThis.fetch = vi.fn(() =>
      Promise.resolve(
        new Response(JSON.stringify({ data: null }), {
          status: 500,
          headers: { "Content-Type": "application/json" },
        }),
      ),
    );

    const client = new AniListClient({ cache: { enabled: false }, rateLimit: { enabled: false } });

    try {
      await client.getMedia(1);
      expect.unreachable("Should have thrown");
    } catch (err) {
      expect(err).toBeInstanceOf(AniListError);
      const error = err as AniListError;
      expect(error.status).toBe(500);
    }
  });

  it("throws AniListError for unexpected paged response structure", async () => {
    globalThis.fetch = vi.fn(() =>
      Promise.resolve(
        new Response(
          JSON.stringify({
            data: { Page: { pageInfo: { hasNextPage: false }, wrongField: [] } },
          }),
          { status: 200, headers: { "Content-Type": "application/json" } },
        ),
      ),
    );

    const client = new AniListClient({ cache: { enabled: false }, rateLimit: { enabled: false } });

    await expect(client.searchMedia()).rejects.toThrow(/Unexpected response/);
  });

  // ── Input validation ──

  it("throws RangeError for invalid media ID", async () => {
    const client = new AniListClient();
    await expect(client.getMedia(-1)).rejects.toThrow(RangeError);
    await expect(client.getMedia(0)).rejects.toThrow(RangeError);
    await expect(client.getMedia(Number.NaN)).rejects.toThrow(RangeError);
    await expect(client.getMedia(1.5)).rejects.toThrow(RangeError);
    await expect(client.getMedia(Number.POSITIVE_INFINITY)).rejects.toThrow(RangeError);
  });

  it("throws RangeError for invalid character ID", async () => {
    const client = new AniListClient();
    await expect(client.getCharacter(-1)).rejects.toThrow(RangeError);
  });

  it("throws RangeError for invalid staff ID", async () => {
    const client = new AniListClient();
    await expect(client.getStaff(-1)).rejects.toThrow(RangeError);
  });

  it("throws RangeError for invalid studio ID", async () => {
    const client = new AniListClient();
    await expect(client.getStudio(-1)).rejects.toThrow(RangeError);
  });

  it("throws RangeError for invalid thread ID", async () => {
    const client = new AniListClient();
    await expect(client.getThread(-1)).rejects.toThrow(RangeError);
  });

  it("throws RangeError for invalid user ID", async () => {
    const client = new AniListClient();
    await expect(client.getUser(-1)).rejects.toThrow(RangeError);
  });

  it("throws RangeError for invalid batch IDs", async () => {
    const client = new AniListClient();
    await expect(client.getMediaBatch([1, -1])).rejects.toThrow(RangeError);
    await expect(client.getCharacterBatch([0])).rejects.toThrow(RangeError);
    await expect(client.getStaffBatch([Number.NaN])).rejects.toThrow(RangeError);
  });
});
