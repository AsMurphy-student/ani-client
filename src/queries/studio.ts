import { STUDIO_FIELDS } from "./fragments";

export const QUERY_STUDIO_BY_ID = `
query ($id: Int!) {
  Studio(id: $id) {
    ${STUDIO_FIELDS}
  }
}`;

export const QUERY_STUDIO_SEARCH = `
query ($search: String, $sort: [StudioSort], $page: Int, $perPage: Int) {
  Page(page: $page, perPage: $perPage) {
    pageInfo { total perPage currentPage lastPage hasNextPage }
    studios(search: $search, sort: $sort) {
      ${STUDIO_FIELDS}
    }
  }
}`;
