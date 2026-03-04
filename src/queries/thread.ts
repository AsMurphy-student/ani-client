import { THREAD_FIELDS } from "./fragments";

export const QUERY_THREAD_BY_ID = `
query ($id: Int!) {
  Thread(id: $id) {
    ${THREAD_FIELDS}
  }
}`;

export const QUERY_THREAD_SEARCH = `
query ($search: String, $mediaCategoryId: Int, $categoryId: Int, $sort: [ThreadSort], $page: Int, $perPage: Int) {
  Page(page: $page, perPage: $perPage) {
    pageInfo { total perPage currentPage lastPage hasNextPage }
    threads(search: $search, mediaCategoryId: $mediaCategoryId, categoryId: $categoryId, sort: $sort) {
      ${THREAD_FIELDS}
    }
  }
}`;
