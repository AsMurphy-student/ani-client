import type { PagedResult } from "../types";

/**
 * Base interface for the client context shared by all domain method modules.
 * Exposes only the internal request methods that domain functions need.
 *
 * @internal
 */
export interface ClientBase {
  request<T>(query: string, variables?: Record<string, unknown>): Promise<T>;
  pagedRequest<T>(query: string, variables: Record<string, unknown>, field: string): Promise<PagedResult<T>>;
  paginate<T>(
    fetchPage: (page: number) => Promise<PagedResult<T>>,
    maxPages?: number,
  ): AsyncGenerator<T, void, undefined>;
}
