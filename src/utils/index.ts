/**
 * Utility functions for internal use.
 */

/**
 * Normalize a GraphQL query string by collapsing all whitespace.
 * Used for cache key generation and request body minification.
 *
 * @internal
 * @param query - The raw GraphQL query string
 * @returns The whitespace-normalized query
 */
export function normalizeQuery(query: string): string {
  return query.replace(/\s+/g, " ").trim();
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
  const chunks: T[][] = [];
  for (let i = 0; i < arr.length; i += size) {
    chunks.push(arr.slice(i, i + size));
  }
  return chunks;
}

export * from "./markdown";
