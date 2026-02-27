import { QUERY_THREAD_BY_ID, QUERY_THREAD_SEARCH } from "../queries";
import type { PagedResult, SearchThreadOptions, Thread } from "../types";
import { ThreadSort } from "../types";
import { clampPerPage } from "../utils";
import type { ClientBase } from "./base";

export async function getThread(client: ClientBase, id: number): Promise<Thread> {
  const data = await client.request<{ Thread: Thread }>(QUERY_THREAD_BY_ID, { id });
  return data.Thread;
}

export async function getRecentThreads(
  client: ClientBase,
  options: SearchThreadOptions = {},
): Promise<PagedResult<Thread>> {
  const { query: search, page = 1, perPage = 20, sort, mediaId, categoryId } = options;
  return client.pagedRequest<Thread>(
    QUERY_THREAD_SEARCH,
    {
      search,
      mediaCategoryId: mediaId,
      categoryId,
      sort: sort ?? [ThreadSort.REPLIED_AT_DESC],
      page,
      perPage: clampPerPage(perPage),
    },
    "threads",
  );
}
