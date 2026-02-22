/** Core media fields — always returned. Does NOT include relations (opt-in via include). */
const MEDIA_FIELDS_BASE = `
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

const RELATIONS_FIELDS = `
  relations {
    edges {
      relationType(version: 2)
      node {
        id
        title { romaji english native userPreferred }
        type
        format
        status
        coverImage { large medium }
        siteUrl
      }
    }
  }
`;

/** Full media fields with relations — used by existing queries for backward compat. */
const MEDIA_FIELDS = `
  ${MEDIA_FIELDS_BASE}
  ${RELATIONS_FIELDS}
`;

/** Character fields without back-reference to media (used when embedding characters inside a Media query). */
const CHARACTER_FIELDS_COMPACT = `
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
const VOICE_ACTOR_FIELDS_COMPACT = `
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

const CHARACTER_FIELDS = `
  ${CHARACTER_FIELDS_COMPACT}
  ${CHARACTER_MEDIA_NODES}
`;

const CHARACTER_FIELDS_WITH_VA = `
  ${CHARACTER_FIELDS_COMPACT}
  ${CHARACTER_MEDIA_EDGES_WITH_VA}
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

export const QUERY_STAFF_BY_ID = `
query ($id: Int!) {
  Staff(id: $id) {
    ${STAFF_FIELDS}
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

const MEDIA_LIST_FIELDS = `
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

export const QUERY_USER_MEDIA_LIST = `
query ($userId: Int, $userName: String, $type: MediaType!, $status: MediaListStatus, $sort: [MediaListSort], $page: Int, $perPage: Int) {
  Page(page: $page, perPage: $perPage) {
    pageInfo { total perPage currentPage lastPage hasNextPage }
    mediaList(userId: $userId, userName: $userName, type: $type, status: $status, sort: $sort) {
      ${MEDIA_LIST_FIELDS}
    }
  }
}`;

const STUDIO_FIELDS = `
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

export const QUERY_STUDIO_BY_ID = `
query ($id: Int!) {
  Studio(id: $id) {
    ${STUDIO_FIELDS}
  }
}`;

export const QUERY_STUDIO_SEARCH = `
query ($search: String, $page: Int, $perPage: Int) {
  Page(page: $page, perPage: $perPage) {
    pageInfo { total perPage currentPage lastPage hasNextPage }
    studios(search: $search) {
      ${STUDIO_FIELDS}
    }
  }
}`;

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

import type { MediaIncludeOptions } from "../types";

// ── Dynamic media query builder ──

/**
 * Build a `Media(id: $id)` query that optionally includes characters, staff,
 * relations, streaming episodes, external links, stats, and recommendations.
 *
 * When no include options are given, the query is identical to QUERY_MEDIA_BY_ID.
 *
 * @internal
 */
export function buildMediaByIdQuery(include?: MediaIncludeOptions): string {
  if (!include) return QUERY_MEDIA_BY_ID;

  const extra: string[] = [];

  // Relations — included by default (backward compat), opt-out with `relations: false`
  if (include.relations !== false) {
    extra.push(RELATIONS_FIELDS);
  }

  // Characters
  if (include.characters) {
    const opts = typeof include.characters === "object" ? include.characters : {};
    const perPage = opts.perPage ?? 25;
    const sortClause = opts.sort !== false ? ", sort: [ROLE, RELEVANCE, ID]" : "";
    const voiceActorBlock = opts.voiceActors
      ? `\n            voiceActors {
              ${VOICE_ACTOR_FIELDS_COMPACT}
            }`
      : "";
    extra.push(`
    characters(perPage: ${perPage}${sortClause}) {
      edges {
        role
        node {
          ${CHARACTER_FIELDS_COMPACT}
        }${voiceActorBlock}
      }
    }`);
  }

  // Staff
  if (include.staff) {
    const opts = typeof include.staff === "object" ? include.staff : {};
    const perPage = opts.perPage ?? 25;
    const sortClause = opts.sort !== false ? ", sort: [RELEVANCE, ID]" : "";
    extra.push(`
    staff(perPage: ${perPage}${sortClause}) {
      edges {
        role
        node {
          ${STAFF_FIELDS}
        }
      }
    }`);
  }

  // Recommendations
  if (include.recommendations) {
    const perPage = typeof include.recommendations === "object" ? (include.recommendations.perPage ?? 10) : 10;
    extra.push(`
    recommendations(perPage: ${perPage}, sort: [RATING_DESC]) {
      nodes {
        id
        rating
        mediaRecommendation {
          id
          title { romaji english native userPreferred }
          type
          format
          coverImage { large medium }
          averageScore
          siteUrl
        }
      }
    }`);
  }

  // Streaming episodes
  if (include.streamingEpisodes) {
    extra.push(`
    streamingEpisodes {
      title
      thumbnail
      url
      site
    }`);
  }

  // External links
  if (include.externalLinks) {
    extra.push(`
    externalLinks {
      id
      url
      site
      type
      icon
      color
    }`);
  }

  // Stats (score & status distribution)
  if (include.stats) {
    extra.push(`
    stats {
      scoreDistribution { score amount }
      statusDistribution { status amount }
    }`);
  }

  return `
query ($id: Int!) {
  Media(id: $id) {
    ${MEDIA_FIELDS_BASE}
    ${extra.join("\n")}
  }
}`;
}

// ── Batch query builders ──

/** @internal Build a batched GraphQL query using aliases. */
function buildBatchQuery(ids: number[], typeName: string, fields: string, prefix: string): string {
  const aliases = ids.map((id, i) => `${prefix}${i}: ${typeName}(id: ${id}) { ${fields} }`).join("\n  ");
  return `query {\n  ${aliases}\n}`;
}

export const buildBatchMediaQuery = (ids: number[]): string => buildBatchQuery(ids, "Media", MEDIA_FIELDS_BASE, "m");

export const buildBatchCharacterQuery = (ids: number[]): string =>
  buildBatchQuery(ids, "Character", CHARACTER_FIELDS, "c");

export const buildBatchStaffQuery = (ids: number[]): string => buildBatchQuery(ids, "Staff", STAFF_FIELDS, "s");
