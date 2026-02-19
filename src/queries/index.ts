const MEDIA_FIELDS = `
  id
  idMal
  title { romaji english native userPreferred }
  type
  format
  status
  description(asHtml: false)
  startDate { year month day }
  endDate { year month day }
  season
  seasonYear
  episodes
  duration
  chapters
  volumes
  countryOfOrigin
  isLicensed
  source
  hashtag
  trailer { id site thumbnail }
  coverImage { extraLarge large medium color }
  bannerImage
  genres
  synonyms
  averageScore
  meanScore
  popularity
  favourites
  trending
  tags { id name description category rank isMediaSpoiler }
  studios { nodes { id name isAnimationStudio siteUrl } }
  isAdult
  siteUrl
`;

const CHARACTER_FIELDS = `
  id
  name { first middle last full native alternative }
  image { large medium }
  description(asHtml: false)
  gender
  dateOfBirth { year month day }
  age
  bloodType
  favourites
  siteUrl
  media(perPage: 10) {
    nodes {
      id
      title { romaji english native userPreferred }
      type
      coverImage { large medium }
      siteUrl
    }
  }
`;

const STAFF_FIELDS = `
  id
  name { first middle last full native }
  language
  image { large medium }
  description(asHtml: false)
  primaryOccupations
  gender
  dateOfBirth { year month day }
  dateOfDeath { year month day }
  age
  yearsActive
  homeTown
  bloodType
  favourites
  siteUrl
`;

const USER_FIELDS = `
  id
  name
  about(asHtml: false)
  avatar { large medium }
  bannerImage
  isFollowing
  isFollower
  donatorTier
  donatorBadge
  createdAt
  siteUrl
  statistics {
    anime { count meanScore minutesWatched episodesWatched chaptersRead volumesRead }
    manga { count meanScore minutesWatched episodesWatched chaptersRead volumesRead }
  }
`;

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
      isAdult: $isAdult,
      sort: $sort
    ) {
      ${MEDIA_FIELDS}
    }
  }
}`;

export const QUERY_TRENDING = `
query ($type: MediaType, $page: Int, $perPage: Int) {
  Page(page: $page, perPage: $perPage) {
    pageInfo { total perPage currentPage lastPage hasNextPage }
    media(type: $type, sort: TRENDING_DESC) {
      ${MEDIA_FIELDS}
    }
  }
}`;

export const QUERY_CHARACTER_BY_ID = `
query ($id: Int!) {
  Character(id: $id) {
    ${CHARACTER_FIELDS}
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

export const QUERY_STAFF_BY_ID = `
query ($id: Int!) {
  Staff(id: $id) {
    ${STAFF_FIELDS}
  }
}`;

export const QUERY_STAFF_SEARCH = `
query ($search: String, $page: Int, $perPage: Int) {
  Page(page: $page, perPage: $perPage) {
    pageInfo { total perPage currentPage lastPage hasNextPage }
    staff(search: $search) {
      ${STAFF_FIELDS}
    }
  }
}`;

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
        ${MEDIA_FIELDS}
      }
    }
  }
}`;

export const QUERY_RECENT_CHAPTERS = `
query ($page: Int, $perPage: Int) {
  Page(page: $page, perPage: $perPage) {
    pageInfo { total perPage currentPage lastPage hasNextPage }
    media(type: MANGA, status: RELEASING, sort: UPDATED_AT_DESC) {
      ${MEDIA_FIELDS}
    }
  }
}`;

export const QUERY_PLANNING = `
query ($type: MediaType, $sort: [MediaSort], $page: Int, $perPage: Int) {
  Page(page: $page, perPage: $perPage) {
    pageInfo { total perPage currentPage lastPage hasNextPage }
    media(type: $type, status: NOT_YET_RELEASED, sort: $sort) {
      ${MEDIA_FIELDS}
    }
  }
}`;
