import { MEDIA_FIELDS_BASE, MEDIA_FIELDS_LIGHT } from "./fragments";

export const QUERY_REVIEWS = `
  query ($page: Int, $perPage: Int, $sort: [ReviewSort], $mediaId: Int, $userId: Int) {
    Page(page: $page, perPage: $perPage) {
      pageInfo {
        total
        currentPage
        lastPage
        hasNextPage
        perPage
      }
      reviews(sort: $sort, mediaId: $mediaId, userId: $userId) {
        id
        userId
        mediaId
        mediaType
        summary
        body
        rating
        ratingAmount
        userRating
        score
        private
        siteUrl
        createdAt
        updatedAt
        user {
          id
          name
          avatar { large medium }
          siteUrl
        }
        media {
          ${MEDIA_FIELDS_LIGHT}
        }
      }
    }
  }
`;

export const QUERY_REVIEW_BY_ID = `
  query ($id: Int) {
    Review(id: $id) {
      id
      userId
      mediaId
      mediaType
      summary
      body
      rating
      ratingAmount
      userRating
      score
      private
      siteUrl
      createdAt
      updatedAt
      user {
        id
        name
        avatar { large medium }
        siteUrl
      }
      media {
        ${MEDIA_FIELDS_BASE}
      }
    }
  }
`;
