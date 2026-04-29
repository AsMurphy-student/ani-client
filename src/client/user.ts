import {
  buildUserFavoritesQuery,
  QUERY_USER_BY_ID,
  QUERY_USER_BY_NAME,
  QUERY_USER_FAVORITES_BY_ID,
  QUERY_USER_FAVORITES_BY_NAME,
  QUERY_USER_MEDIA_LIST,
  QUERY_USER_SEARCH,
} from "../queries";
import type {
  GetUserMediaListOptions,
  MediaListEntry,
  PagedResult,
  SearchUserOptions,
  User,
  UserFavorites,
  UserFavoritesOptions,
} from "../types";
import { clampPerPage, validateId } from "../utils";
import type { ClientBase } from "./base";

/** @internal Fetch a user by AniList ID or username. */
export async function getUser(client: ClientBase, idOrName: number | string): Promise<User> {
  if (typeof idOrName === "number") {
    validateId(idOrName, "userId");
    const data = await client.request<{ User: User }>(QUERY_USER_BY_ID, { id: idOrName });
    return data.User;
  }
  const data = await client.request<{ User: User }>(QUERY_USER_BY_NAME, { name: idOrName });
  return data.User;
}

/** @internal Search for AniList users by name. */
export async function searchUsers(client: ClientBase, options: SearchUserOptions = {}): Promise<PagedResult<User>> {
  const { query: search, page = 1, perPage = 20, sort } = options;
  return client.pagedRequest<User>(QUERY_USER_SEARCH, { search, sort, page, perPage: clampPerPage(perPage) }, "users");
}

/** @internal Get a user's anime or manga list with optional filters. */
export async function getUserMediaList(
  client: ClientBase,
  options: GetUserMediaListOptions,
): Promise<PagedResult<MediaListEntry>> {
  if (!options.userId && !options.userName) {
    throw new TypeError("getUserMediaList requires either userId or userName");
  }
  if (options.userId) {
    validateId(options.userId, "userId");
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

interface RawFavourites {
  anime?: { nodes: UserFavorites["anime"] };
  manga?: { nodes: UserFavorites["manga"] };
  characters?: { nodes: UserFavorites["characters"] };
  staff?: { nodes: UserFavorites["staff"] };
  studios?: { nodes: UserFavorites["studios"] };
}

/** @internal Fetch a user's favorite anime, manga, characters, staff, and studios. */
export async function getUserFavorites(
  client: ClientBase,
  idOrName: number | string,
  options?: UserFavoritesOptions,
): Promise<UserFavorites> {
  const useBuilder = options?.perPage !== undefined;
  if (typeof idOrName === "number") {
    validateId(idOrName, "userId");
    const query = useBuilder ? buildUserFavoritesQuery("id", options.perPage) : QUERY_USER_FAVORITES_BY_ID;
    const data = await client.request<{ User: { favourites: RawFavourites } }>(query, {
      id: idOrName,
    });
    return mapFavorites(data.User.favourites);
  }
  const query = useBuilder ? buildUserFavoritesQuery("name", options.perPage) : QUERY_USER_FAVORITES_BY_NAME;
  const data = await client.request<{ User: { favourites: RawFavourites } }>(query, {
    name: idOrName,
  });
  return mapFavorites(data.User.favourites);
}

function mapFavorites(fav: RawFavourites): UserFavorites {
  return {
    anime: fav.anime?.nodes ?? [],
    manga: fav.manga?.nodes ?? [],
    characters: fav.characters?.nodes ?? [],
    staff: fav.staff?.nodes ?? [],
    studios: fav.studios?.nodes ?? [],
  };
}
