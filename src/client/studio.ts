import { buildStudioByIdQuery, QUERY_STUDIO_BY_ID, QUERY_STUDIO_SEARCH } from "../queries";

import type { PagedResult, SearchStudioOptions, Studio, StudioIncludeOptions } from "../types";

import { clampPerPage, validateId } from "../utils";
import type { ClientBase } from "./base";

export async function getStudio(client: ClientBase, id: number, include?: StudioIncludeOptions): Promise<Studio> {
  validateId(id, "studioId");
  if (include?.media) {
    const perPage = typeof include.media === "object" ? include.media.perPage : undefined;
    const query = buildStudioByIdQuery(perPage);
    const data = await client.request<{ Studio: Studio }>(query, { id });
    return data.Studio;
  }
  const data = await client.request<{ Studio: Studio }>(QUERY_STUDIO_BY_ID, { id });
  return data.Studio;
}

export async function searchStudios(
  client: ClientBase,
  options: SearchStudioOptions = {},
): Promise<PagedResult<Studio>> {
  const { query: search, page = 1, perPage = 20, sort } = options;
  return client.pagedRequest<Studio>(
    QUERY_STUDIO_SEARCH,
    {
      search,
      sort,
      page,
      perPage: clampPerPage(perPage),
    },
    "studios",
  );
}
