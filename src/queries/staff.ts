import { STAFF_FIELDS, STAFF_MEDIA_FIELDS } from "./fragments";

export const QUERY_STAFF_BY_ID = `
query ($id: Int!) {
  Staff(id: $id) {
    ${STAFF_FIELDS}
  }
}`;

export const QUERY_STAFF_BY_ID_WITH_MEDIA = `
query ($id: Int!, $perPage: Int) {
  Staff(id: $id) {
    ${STAFF_FIELDS}
    ${STAFF_MEDIA_FIELDS}
  }
}`;

export const QUERY_STAFF_SEARCH = `
query ($search: String, $sort: [StaffSort], $page: Int, $perPage: Int) {
  Page(page: $page, perPage: $perPage) {
    pageInfo { total perPage currentPage lastPage hasNextPage }
    staff(search: $search, sort: $sort) {
      ${STAFF_FIELDS}
    }
  }
}`;
