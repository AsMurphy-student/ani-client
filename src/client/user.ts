import { QUERY_USER_BY_ID, QUERY_USER_BY_NAME, QUERY_USER_MEDIA_LIST, QUERY_USER_SEARCH } from "../queries";

import type { GetUserMediaListOptions, MediaListEntry, PagedResult, SearchUserOptions, User } from "../types";

import { AniListError } from "../errors";
import { clampPerPage } from "../utils";
import type { ClientBase } from "./base";

export async function getUser(client: ClientBase, idOrName: number | string): Promise<User> {
  if (typeof idOrName === "number") {
    const data = await client.request<{ User: User }>(QUERY_USER_BY_ID, { id: idOrName });
    return data.User;
  }
  const data = await client.request<{ User: User }>(QUERY_USER_BY_NAME, { name: idOrName });
  return data.User;
}

export async function searchUsers(client: ClientBase, options: SearchUserOptions = {}): Promise<PagedResult<User>> {
  const { query: search, page = 1, perPage = 20, sort } = options;
  return client.pagedRequest<User>(QUERY_USER_SEARCH, { search, sort, page, perPage: clampPerPage(perPage) }, "users");
}

export async function getUserMediaList(
  client: ClientBase,
  options: GetUserMediaListOptions,
): Promise<PagedResult<MediaListEntry>> {
  if (!options.userId && !options.userName) {
    throw new AniListError("getUserMediaList requires either userId or userName", 0, []);
  }
  return client.pagedRequest<MediaListEntry>(
    QUERY_USER_MEDIA_LIST,
    {
      userId: options.userId,
      userName: options.userName,
      type: options.type,
      status: options.status,
      sort: options.sort,
      page: options.page ?? 1,
      perPage: clampPerPage(options.perPage ?? 20),
    },
    "mediaList",
  );
}
