/**
 * Lightweight media fields — minimal payload for list/search contexts.
 * Does NOT include tags, studios, trailer, synonyms, or nextAiringEpisode.
 */
export const MEDIA_FIELDS_LIGHT = `
  id
  idMal
  title { romaji english native userPreferred }
  type
  format
  status
  coverImage { large medium color }
  bannerImage
  genres
  averageScore
  popularity
  favourites
  isAdult
  siteUrl
  season
  seasonYear
  episodes
  chapters
  nextAiringEpisode {
    id
    airingAt
    episode
    timeUntilAiring
  }
`;

/** Core media fields — always returned. Does NOT include relations (opt-in via include). */
export const MEDIA_FIELDS_BASE = `
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
  nextAiringEpisode {
    id
    airingAt
    episode
    mediaId
    timeUntilAiring
  }
`;

export const RELATIONS_FIELDS = `
  relations {
    edges {
      relationType(version: 2)
      node {
        id
        title { romaji english native userPreferred }
        type
        format
        status
        startDate { year month day }
        endDate { year month day }
        season
        seasonYear
        episodes
        chapters
        volumes
        coverImage { extraLarge large medium color }
        genres
        averageScore
        studios { nodes { id name isAnimationStudio siteUrl } }
        siteUrl
      }
    }
  }
`;

/** Full media fields with relations — used by existing queries for backward compat. */
export const MEDIA_FIELDS = `
  ${MEDIA_FIELDS_BASE}
  ${RELATIONS_FIELDS}
`;

/** Character fields without back-reference to media (used when embedding characters inside a Media query). */
export const CHARACTER_FIELDS_COMPACT = `
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
`;

const CHARACTER_MEDIA_NODES = `
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

/** Compact voice actor fields — lightweight subset for embedding inside character edges. */
export const VOICE_ACTOR_FIELDS_COMPACT = `
  id
  name { first middle last full native userPreferred }
  languageV2
  image { large medium }
  gender
  primaryOccupations
  siteUrl
`;

const CHARACTER_MEDIA_EDGES_WITH_VA = `
  media(perPage: 10) {
    edges {
      voiceActors {
        ${VOICE_ACTOR_FIELDS_COMPACT}
      }
      node {
        id
        title { romaji english native userPreferred }
        type
        coverImage { large medium }
        siteUrl
      }
    }
  }
`;

export const CHARACTER_FIELDS = `
  ${CHARACTER_FIELDS_COMPACT}
  ${CHARACTER_MEDIA_NODES}
`;

export const CHARACTER_FIELDS_WITH_VA = `
  ${CHARACTER_FIELDS_COMPACT}
  ${CHARACTER_MEDIA_EDGES_WITH_VA}
`;

export const STAFF_FIELDS = `
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

export const STAFF_MEDIA_FIELDS = `
  staffMedia(perPage: $perPage, sort: [POPULARITY_DESC]) {
    nodes {
      id
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
      episodes
      trending
      hashtag
      season
      seasonYear
      startDate { year month day }
      endDate { year month day }
      nextAiringEpisode {
        id
        airingAt
        episode
        mediaId
        timeUntilAiring
      }
      studios {
        edges {
          node {
            name
          }
        }
      }
      siteUrl
    }
  }
`;

export const USER_FIELDS = `
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

/** Favorites fragment — lightweight fields for each favorite category. */
export const USER_FAVORITES_FIELDS = `
  favourites {
    anime(perPage: 25) {
      nodes {
        id
        title { romaji english native userPreferred }
        coverImage { large medium }
        type
        format
        siteUrl
      }
    }
    manga(perPage: 25) {
      nodes {
        id
        title { romaji english native userPreferred }
        coverImage { large medium }
        type
        format
        siteUrl
      }
    }
    characters(perPage: 25) {
      nodes {
        id
        name { full native }
        image { large medium }
        siteUrl
      }
    }
    staff(perPage: 25) {
      nodes {
        id
        name { full native }
        image { large medium }
        siteUrl
      }
    }
    studios(perPage: 25) {
      nodes {
        id
        name
        siteUrl
      }
    }
  }
`;

export const MEDIA_LIST_FIELDS = `
  id
  mediaId
  status
  score(format: POINT_100)
  progress
  progressVolumes
  repeat
  priority
  private
  notes
  startedAt { year month day }
  completedAt { year month day }
  updatedAt
  createdAt
  media {
    ${MEDIA_FIELDS_BASE}
  }
`;

export const STUDIO_FIELDS = `
  id
  name
  isAnimationStudio
  siteUrl
  favourites
  media(page: 1, perPage: 25, sort: POPULARITY_DESC) {
    pageInfo { total perPage currentPage lastPage hasNextPage }
    nodes {
      id
      title { romaji english native userPreferred }
      type
      format
      coverImage { large medium }
      siteUrl
    }
  }
`;

export const THREAD_FIELDS = `
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
