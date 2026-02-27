import { CHARACTER_FIELDS, CHARACTER_FIELDS_WITH_VA } from "./fragments";

export const QUERY_CHARACTER_BY_ID = `
query ($id: Int!) {
  Character(id: $id) {
    ${CHARACTER_FIELDS}
  }
}`;

export const QUERY_CHARACTER_BY_ID_WITH_VA = `
query ($id: Int!) {
  Character(id: $id) {
    ${CHARACTER_FIELDS_WITH_VA}
  }
}`;

export const QUERY_CHARACTER_SEARCH = `
query ($search: String, $sort: [CharacterSort], $page: Int, $perPage: Int) {
  Page(page: $page, perPage: $perPage) {
    pageInfo { total perPage currentPage lastPage hasNextPage }
    characters(search: $search, sort: $sort) {
      ${CHARACTER_FIELDS}
    }
  }
}`;

export const QUERY_CHARACTER_SEARCH_WITH_VA = `
query ($search: String, $sort: [CharacterSort], $page: Int, $perPage: Int) {
  Page(page: $page, perPage: $perPage) {
    pageInfo { total perPage currentPage lastPage hasNextPage }
    characters(search: $search, sort: $sort) {
      ${CHARACTER_FIELDS_WITH_VA}
    }
  }
}`;
