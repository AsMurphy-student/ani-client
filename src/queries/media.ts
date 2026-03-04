import { MEDIA_FIELDS, MEDIA_FIELDS_BASE, MEDIA_FIELDS_LIGHT } from "./fragments";

export const QUERY_MEDIA_BY_ID = `
query ($id: Int!) {
  Media(id: $id) {
    ${MEDIA_FIELDS}
  }
}`;

export const QUERY_MEDIA_SEARCH = `
query (
  $search: String,
  $type: MediaType,
  $format: MediaFormat,
  $status: MediaStatus,
  $season: MediaSeason,
  $seasonYear: Int,
  $genre: String,
  $tag: String,
  $genre_in: [String],
  $tag_in: [String],
  $genre_not_in: [String],
  $tag_not_in: [String],
  $isAdult: Boolean,
  $sort: [MediaSort],
  $page: Int,
  $perPage: Int
) {
  Page(page: $page, perPage: $perPage) {
    pageInfo { total perPage currentPage lastPage hasNextPage }
    media(
      search: $search,
      type: $type,
      format: $format,
      status: $status,
      season: $season,
      seasonYear: $seasonYear,
      genre: $genre,
      tag: $tag,
      genre_in: $genre_in,
      tag_in: $tag_in,
      genre_not_in: $genre_not_in,
      tag_not_in: $tag_not_in,
      isAdult: $isAdult,
      sort: $sort
    ) {
      ${MEDIA_FIELDS_BASE}
    }
  }
}`;

export const QUERY_TRENDING = `
query ($type: MediaType, $page: Int, $perPage: Int) {
  Page(page: $page, perPage: $perPage) {
    pageInfo { total perPage currentPage lastPage hasNextPage }
    media(type: $type, sort: TRENDING_DESC) {
      ${MEDIA_FIELDS_BASE}
    }
  }
}`;

export const QUERY_AIRING_SCHEDULE = `
query ($airingAt_greater: Int, $airingAt_lesser: Int, $sort: [AiringSort], $page: Int, $perPage: Int) {
  Page(page: $page, perPage: $perPage) {
    pageInfo { total perPage currentPage lastPage hasNextPage }
    airingSchedules(airingAt_greater: $airingAt_greater, airingAt_lesser: $airingAt_lesser, sort: $sort) {
      id
      airingAt
      timeUntilAiring
      episode
      mediaId
      media {
        ${MEDIA_FIELDS_BASE}
      }
    }
  }
}`;

export const QUERY_RECENT_CHAPTERS = `
query ($page: Int, $perPage: Int) {
  Page(page: $page, perPage: $perPage) {
    pageInfo { total perPage currentPage lastPage hasNextPage }
    media(type: MANGA, status: RELEASING, sort: UPDATED_AT_DESC) {
      ${MEDIA_FIELDS_BASE}
    }
  }
}`;

export const QUERY_PLANNING = `
query ($type: MediaType, $sort: [MediaSort], $page: Int, $perPage: Int) {
  Page(page: $page, perPage: $perPage) {
    pageInfo { total perPage currentPage lastPage hasNextPage }
    media(type: $type, status: NOT_YET_RELEASED, sort: $sort) {
      ${MEDIA_FIELDS_BASE}
    }
  }
}`;

export const QUERY_MEDIA_BY_SEASON = `
query ($season: MediaSeason!, $seasonYear: Int!, $type: MediaType, $sort: [MediaSort], $page: Int, $perPage: Int) {
  Page(page: $page, perPage: $perPage) {
    pageInfo { total perPage currentPage lastPage hasNextPage }
    media(season: $season, seasonYear: $seasonYear, type: $type, sort: $sort) {
      ${MEDIA_FIELDS_BASE}
    }
  }
}`;

export const QUERY_MEDIA_BY_MAL_ID = `
query ($idMal: Int!, $type: MediaType) {
  Media(idMal: $idMal, type: $type) {
    ${MEDIA_FIELDS}
  }
}`;

export const QUERY_RECOMMENDATIONS = `
query ($mediaId: Int!, $page: Int, $perPage: Int, $sort: [RecommendationSort]) {
  Media(id: $mediaId) {
    recommendations(page: $page, perPage: $perPage, sort: $sort) {
      pageInfo { total perPage currentPage lastPage hasNextPage }
      nodes {
        id
        rating
        userRating
        mediaRecommendation {
          id
          idMal
          title { romaji english native userPreferred }
          type
          format
          status
          coverImage { extraLarge large medium color }
          bannerImage
          genres
          averageScore
          meanScore
          popularity
          favourites
          siteUrl
        }
        user {
          id
          name
          avatar { large medium }
        }
      }
    }
  }
}`;
