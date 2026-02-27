import { QUERY_STUDIO_BY_ID, QUERY_STUDIO_SEARCH } from "../queries";

import type { PagedResult, SearchStudioOptions, Studio } from "../types";

import { clampPerPage } from "../utils";
import type { ClientBase } from "./base";

export async function getStudio(client: ClientBase, id: number): Promise<Studio> {
  const data = await client.request<{ Studio: Studio }>(QUERY_STUDIO_BY_ID, { id });
  return data.Studio;
}

export async function searchStudios(
  client: ClientBase,
  options: SearchStudioOptions = {},
): Promise<PagedResult<Studio>> {
  return client.pagedRequest<Studio>(
    QUERY_STUDIO_SEARCH,
    {
      search: options.query,
      page: options.page ?? 1,
      perPage: clampPerPage(options.perPage ?? 20),
    },
    "studios",
  );
}
