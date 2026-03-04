import { clampPerPage } from "../utils";
import { MEDIA_LIST_FIELDS, USER_FAVORITES_FIELDS, USER_FIELDS } from "./fragments";

export const QUERY_USER_BY_ID = `
query ($id: Int!) {
  User(id: $id) {
    ${USER_FIELDS}
  }
}`;

export const QUERY_USER_BY_NAME = `
query ($name: String!) {
  User(name: $name) {
    ${USER_FIELDS}
  }
}`;

export const QUERY_USER_SEARCH = `
query ($search: String, $sort: [UserSort], $page: Int, $perPage: Int) {
  Page(page: $page, perPage: $perPage) {
    pageInfo { total perPage currentPage lastPage hasNextPage }
    users(search: $search, sort: $sort) {
      ${USER_FIELDS}
    }
  }
}`;

export const QUERY_USER_MEDIA_LIST = `
query ($userId: Int, $userName: String, $type: MediaType!, $status: MediaListStatus, $sort: [MediaListSort], $page: Int, $perPage: Int) {
  Page(page: $page, perPage: $perPage) {
    pageInfo { total perPage currentPage lastPage hasNextPage }
    mediaList(userId: $userId, userName: $userName, type: $type, status: $status, sort: $sort) {
      ${MEDIA_LIST_FIELDS}
    }
  }
}`;

export const QUERY_USER_FAVORITES_BY_ID = `
query ($id: Int!) {
  User(id: $id) {
    id
    name
    ${USER_FAVORITES_FIELDS}
  }
}`;

export const QUERY_USER_FAVORITES_BY_NAME = `
query ($name: String!) {
  User(name: $name) {
    id
    name
    ${USER_FAVORITES_FIELDS}
  }
}`;

/**
 * Build a User Favorites query with customisable perPage per category.
 * @internal
 */
export function buildUserFavoritesQuery(idOrName: "id" | "name", perPage = 25): string {
  const pp = clampPerPage(perPage);
  const varDecl = idOrName === "id" ? "$id: Int!" : "$name: String!";
  const selector = idOrName === "id" ? "id: $id" : "name: $name";
  return `
query (${varDecl}) {
  User(${selector}) {
    id
    name
    favourites {
      anime(perPage: ${pp}) {
        nodes {
          id
          title { romaji english native userPreferred }
          coverImage { large medium }
          type
          format
          siteUrl
        }
      }
      manga(perPage: ${pp}) {
        nodes {
          id
          title { romaji english native userPreferred }
          coverImage { large medium }
          type
          format
          siteUrl
        }
      }
      characters(perPage: ${pp}) {
        nodes {
          id
          name { full native }
          image { large medium }
          siteUrl
        }
      }
      staff(perPage: ${pp}) {
        nodes {
          id
          name { full native }
          image { large medium }
          siteUrl
        }
      }
      studios(perPage: ${pp}) {
        nodes {
          id
          name
          siteUrl
        }
      }
    }
  }
}`;
}
