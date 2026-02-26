const THREAD_FIELDS = `
  id
  title
  body(asHtml: false)
  userId
  replyUserId
  replyCommentId
  replyCount
  viewCount
  isLocked
  isSticky
  isSubscribed
  repliedAt
  createdAt
  updatedAt
  siteUrl
  user {
    id
    name
    avatar { large medium }
  }
  replyUser {
    id
    name
    avatar { large medium }
  }
  categories {
    id
    name
  }
  mediaCategories {
    id
    title { romaji english native userPreferred }
    type
    coverImage { large medium }
    siteUrl
  }
  likes {
    id
    name
  }
`;

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
