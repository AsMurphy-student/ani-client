/**
 * Custom error class for AniList API errors.
 */
export class AniListError extends Error {
  /** HTTP status code returned by the API */
  public readonly status: number;
  /** Raw error body from the API response */
  public readonly errors: unknown[];

  constructor(message: string, status: number, errors: unknown[] = []) {
    super(message);
    this.name = "AniListError";
    this.status = status;
    this.errors = errors;
  }
}
