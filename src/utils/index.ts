/**
 * Utility functions for internal use.
 */

const WHITESPACE_RE = /\s+/g;

/**
 * Normalize a GraphQL query string by collapsing all whitespace.
 * Used for cache key generation and request body minification.
 *
 * @internal
 * @param query - The raw GraphQL query string
 * @returns The whitespace-normalized query
 */
export function normalizeQuery(query: string): string {
  return query.replace(WHITESPACE_RE, " ").trim();
}

/**
 * Clamp a number to a maximum and minimum value.
 * Used internally to ensure perPage does not exceed AniList's limit of 50.
 *
 * @internal
 * @param value - The number to clamp
 * @returns The clamped number between 1 and 50
 */
export function clampPerPage(value: number): number {
  return Math.min(Math.max(value, 1), 50);
}

/**
 * Split an array into smaller chunks of a specific size.
 * Used internally for batching GraphQL queries.
 *
 * @internal
 * @param arr - The array to chunk
 * @param size - The maximum size of each chunk
 * @returns An array of chunks
 */
export function chunk<T>(arr: T[], size: number): T[][] {
  if (size < 1) throw new RangeError("chunk size must be >= 1");
  const chunks: T[][] = [];
  for (let i = 0; i < arr.length; i += size) {
    chunks.push(arr.slice(i, i + size));
  }
  return chunks;
}

/**
 * Validate that a value is a finite positive integer (valid AniList ID).
 *
 * @internal
 * @param id - The ID to validate
 * @param label - Label for the error message (e.g. "mediaId")
 * @throws {RangeError} If the ID is not a finite positive integer
 */
export function validateId(id: number, label = "id"): void {
  if (!Number.isFinite(id) || !Number.isInteger(id) || id < 1) {
    throw new RangeError(`Invalid ${label}: expected a positive integer, got ${id}`);
  }
}

/**
 * Validate an array of IDs.
 *
 * @internal
 * @param ids - The IDs to validate
 * @param label - Label for the error message
 * @throws {RangeError} If any ID is not a finite positive integer
 */
export function validateIds(ids: number[], label = "id"): void {
  for (const id of ids) {
    validateId(id, label);
  }
}

/**
 * Deep-sort an object's keys recursively for deterministic JSON serialization.
 *
 * @internal
 */
export function sortObjectKeys(obj: unknown): unknown {
  if (obj === null || typeof obj !== "object") return obj;
  if (Array.isArray(obj)) return obj.map(sortObjectKeys);
  const sorted: Record<string, unknown> = {};
  for (const key of Object.keys(obj as Record<string, unknown>).sort()) {
    sorted[key] = sortObjectKeys((obj as Record<string, unknown>)[key]);
  }
  return sorted;
}

export * from "./markdown";
