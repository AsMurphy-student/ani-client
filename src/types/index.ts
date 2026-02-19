export enum MediaType {
  ANIME = "ANIME",
  MANGA = "MANGA",
}

export enum MediaFormat {
  TV = "TV",
  TV_SHORT = "TV_SHORT",
  MOVIE = "MOVIE",
  SPECIAL = "SPECIAL",
  OVA = "OVA",
  ONA = "ONA",
  MUSIC = "MUSIC",
  MANGA = "MANGA",
  NOVEL = "NOVEL",
  ONE_SHOT = "ONE_SHOT",
}

export enum MediaStatus {
  FINISHED = "FINISHED",
  RELEASING = "RELEASING",
  NOT_YET_RELEASED = "NOT_YET_RELEASED",
  CANCELLED = "CANCELLED",
  HIATUS = "HIATUS",
}

export enum MediaSeason {
  WINTER = "WINTER",
  SPRING = "SPRING",
  SUMMER = "SUMMER",
  FALL = "FALL",
}

export enum MediaSort {
  ID = "ID",
  TITLE_ROMAJI = "TITLE_ROMAJI",
  TITLE_ENGLISH = "TITLE_ENGLISH",
  TITLE_NATIVE = "TITLE_NATIVE",
  TYPE = "TYPE",
  FORMAT = "FORMAT",
  START_DATE = "START_DATE",
  END_DATE = "END_DATE",
  SCORE = "SCORE",
  POPULARITY = "POPULARITY",
  TRENDING = "TRENDING",
  EPISODES = "EPISODES",
  DURATION = "DURATION",
  STATUS = "STATUS",
  FAVOURITES = "FAVOURITES",
  UPDATED_AT = "UPDATED_AT",
  SEARCH_MATCH = "SEARCH_MATCH",
}

export enum CharacterSort {
  ID = "ID",
  ROLE = "ROLE",
  SEARCH_MATCH = "SEARCH_MATCH",
  FAVOURITES = "FAVOURITES",
}

export interface MediaTitle {
  romaji: string | null;
  english: string | null;
  native: string | null;
  userPreferred: string | null;
}

export interface MediaCoverImage {
  extraLarge: string | null;
  large: string | null;
  medium: string | null;
  color: string | null;
}

export interface FuzzyDate {
  year: number | null;
  month: number | null;
  day: number | null;
}

export interface MediaTrailer {
  id: string | null;
  site: string | null;
  thumbnail: string | null;
}

export interface MediaTag {
  id: number;
  name: string;
  description: string | null;
  category: string | null;
  rank: number | null;
  isMediaSpoiler: boolean | null;
}

export interface Studio {
  id: number;
  name: string;
  isAnimationStudio: boolean;
  siteUrl: string | null;
}

export interface StudioConnection {
  nodes: Studio[];
}

export interface CharacterName {
  first: string | null;
  middle: string | null;
  last: string | null;
  full: string | null;
  native: string | null;
  alternative: string[];
}

export interface CharacterImage {
  large: string | null;
  medium: string | null;
}

export interface Media {
  id: number;
  idMal: number | null;
  title: MediaTitle;
  type: MediaType;
  format: MediaFormat | null;
  status: MediaStatus | null;
  description: string | null;
  startDate: FuzzyDate | null;
  endDate: FuzzyDate | null;
  season: MediaSeason | null;
  seasonYear: number | null;
  episodes: number | null;
  duration: number | null;
  chapters: number | null;
  volumes: number | null;
  countryOfOrigin: string | null;
  isLicensed: boolean | null;
  source: string | null;
  hashtag: string | null;
  trailer: MediaTrailer | null;
  coverImage: MediaCoverImage;
  bannerImage: string | null;
  genres: string[];
  synonyms: string[];
  averageScore: number | null;
  meanScore: number | null;
  popularity: number | null;
  favourites: number | null;
  trending: number | null;
  tags: MediaTag[];
  studios: StudioConnection;
  isAdult: boolean | null;
  siteUrl: string | null;
}

export interface Character {
  id: number;
  name: CharacterName;
  image: CharacterImage;
  description: string | null;
  gender: string | null;
  dateOfBirth: FuzzyDate | null;
  age: string | null;
  bloodType: string | null;
  favourites: number | null;
  siteUrl: string | null;
  media: {
    nodes: Pick<Media, "id" | "title" | "type" | "coverImage" | "siteUrl">[];
  } | null;
}

export interface StaffName {
  first: string | null;
  middle: string | null;
  last: string | null;
  full: string | null;
  native: string | null;
}

export interface StaffImage {
  large: string | null;
  medium: string | null;
}

export interface Staff {
  id: number;
  name: StaffName;
  language: string | null;
  image: StaffImage;
  description: string | null;
  primaryOccupations: string[];
  gender: string | null;
  dateOfBirth: FuzzyDate | null;
  dateOfDeath: FuzzyDate | null;
  age: number | null;
  yearsActive: number[];
  homeTown: string | null;
  bloodType: string | null;
  favourites: number | null;
  siteUrl: string | null;
}

export interface UserAvatar {
  large: string | null;
  medium: string | null;
}

export interface UserStatistics {
  count: number;
  meanScore: number;
  minutesWatched: number;
  episodesWatched: number;
  chaptersRead: number;
  volumesRead: number;
}

export interface User {
  id: number;
  name: string;
  about: string | null;
  avatar: UserAvatar;
  bannerImage: string | null;
  isFollowing: boolean | null;
  isFollower: boolean | null;
  donatorTier: number | null;
  donatorBadge: string | null;
  createdAt: number | null;
  siteUrl: string | null;
  statistics: {
    anime: UserStatistics;
    manga: UserStatistics;
  } | null;
}

export interface PageInfo {
  total: number | null;
  perPage: number | null;
  currentPage: number | null;
  lastPage: number | null;
  hasNextPage: boolean | null;
}

export interface SearchMediaOptions {
  query?: string;
  type?: MediaType;
  format?: MediaFormat;
  status?: MediaStatus;
  season?: MediaSeason;
  seasonYear?: number;
  genre?: string;
  tag?: string;
  isAdult?: boolean;
  sort?: MediaSort[];
  page?: number;
  perPage?: number;
}

export interface SearchCharacterOptions {
  query?: string;
  sort?: CharacterSort[];
  page?: number;
  perPage?: number;
}

export interface SearchStaffOptions {
  query?: string;
  page?: number;
  perPage?: number;
}

export interface PagedResult<T> {
  pageInfo: PageInfo;
  results: T[];
}

export interface AniListClientOptions {
  /** Optional AniList OAuth token for authenticated requests */
  token?: string;
  /** Custom API endpoint (defaults to https://graphql.anilist.co) */
  apiUrl?: string;
  /** Cache configuration (enabled by default, 24h TTL) */
  cache?: {
    /** Time-to-live in milliseconds (default: 86 400 000 = 24h) */
    ttl?: number;
    /** Maximum number of cached entries (default: 500, 0 = unlimited) */
    maxSize?: number;
    /** Set to false to disable caching entirely */
    enabled?: boolean;
  };
  /** Rate limiter configuration (enabled by default, 85 req/min) */
  rateLimit?: {
    /** Max requests per window (default: 85) */
    maxRequests?: number;
    /** Window size in ms (default: 60 000) */
    windowMs?: number;
    /** Max retries on 429 (default: 3) */
    maxRetries?: number;
    /** Retry delay in ms when Retry-After header is absent (default: 2000) */
    retryDelayMs?: number;
    /** Set to false to disable rate limiting entirely */
    enabled?: boolean;
  };
}
