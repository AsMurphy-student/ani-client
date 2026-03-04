import { clampPerPage } from "../utils";
import { MEDIA_FIELDS_LIGHT, STUDIO_FIELDS } from "./fragments";

export const QUERY_STUDIO_BY_ID = `
query ($id: Int!) {
  Studio(id: $id) {
    ${STUDIO_FIELDS}
  }
}`;

/**
 * Build a Studio-by-ID query with customisable media perPage.
 * @internal
 */
export function buildStudioByIdQuery(mediaPerPage?: number): string {
  if (mediaPerPage === undefined) return QUERY_STUDIO_BY_ID;
  const pp = clampPerPage(mediaPerPage);
  return `
query ($id: Int!) {
  Studio(id: $id) {
    id
    name
    isAnimationStudio
    siteUrl
    favourites
    media(page: 1, perPage: ${pp}, sort: POPULARITY_DESC) {
      pageInfo { total perPage currentPage lastPage hasNextPage }
      nodes {
        ${MEDIA_FIELDS_LIGHT}
      }
    }
  }
}`;
}

export const QUERY_STUDIO_SEARCH = `
query ($search: String, $sort: [StudioSort], $page: Int, $perPage: Int) {
  Page(page: $page, perPage: $perPage) {
    pageInfo { total perPage currentPage lastPage hasNextPage }
    studios(search: $search, sort: $sort) {
      ${STUDIO_FIELDS}
    }
  }
}`;
