export const QUERY_GENRES = `
query {
  GenreCollection
}`;

export const QUERY_TAGS = `
query {
  MediaTagCollection {
    id
    name
    description
    category
    isAdult
  }
}`;
