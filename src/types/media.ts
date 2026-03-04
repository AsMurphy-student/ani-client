import type { Character, CharacterRole } from "./character";
import type { ExternalLink, FuzzyDate, PageInfo } from "./common";
import type { MediaListStatus } from "./lists";
import type { Staff, VoiceActor } from "./staff";
import type { StudioConnection } from "./studio";
import type { UserAvatar } from "./user";

export enum MediaType {
  ANIME = "ANIME",
  MANGA = "MANGA",
}

export enum MediaSource {
  ORIGINAL = "ORIGINAL",
  MANGA = "MANGA",
  LIGHT_NOVEL = "LIGHT_NOVEL",
  VISUAL_NOVEL = "VISUAL_NOVEL",
  VIDEO_GAME = "VIDEO_GAME",
  OTHER = "OTHER",
  NOVEL = "NOVEL",
  DOUJINSHI = "DOUJINSHI",
  ANIME = "ANIME",
  WEB_NOVEL = "WEB_NOVEL",
  LIVE_ACTION = "LIVE_ACTION",
  GAME = "GAME",
  COMIC = "COMIC",
  MULTIMEDIA_PROJECT = "MULTIMEDIA_PROJECT",
  PICTURE_BOOK = "PICTURE_BOOK",
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
  ID_DESC = "ID_DESC",
  TITLE_ROMAJI = "TITLE_ROMAJI",
  TITLE_ROMAJI_DESC = "TITLE_ROMAJI_DESC",
  TITLE_ENGLISH = "TITLE_ENGLISH",
  TITLE_ENGLISH_DESC = "TITLE_ENGLISH_DESC",
  TITLE_NATIVE = "TITLE_NATIVE",
  TITLE_NATIVE_DESC = "TITLE_NATIVE_DESC",
  TYPE = "TYPE",
  TYPE_DESC = "TYPE_DESC",
  FORMAT = "FORMAT",
  FORMAT_DESC = "FORMAT_DESC",
  START_DATE = "START_DATE",
  START_DATE_DESC = "START_DATE_DESC",
  END_DATE = "END_DATE",
  END_DATE_DESC = "END_DATE_DESC",
  SCORE = "SCORE",
  SCORE_DESC = "SCORE_DESC",
  POPULARITY = "POPULARITY",
  POPULARITY_DESC = "POPULARITY_DESC",
  TRENDING = "TRENDING",
  TRENDING_DESC = "TRENDING_DESC",
  EPISODES = "EPISODES",
  EPISODES_DESC = "EPISODES_DESC",
  DURATION = "DURATION",
  DURATION_DESC = "DURATION_DESC",
  STATUS = "STATUS",
  STATUS_DESC = "STATUS_DESC",
  FAVOURITES = "FAVOURITES",
  FAVOURITES_DESC = "FAVOURITES_DESC",
  UPDATED_AT = "UPDATED_AT",
  UPDATED_AT_DESC = "UPDATED_AT_DESC",
  SEARCH_MATCH = "SEARCH_MATCH",
}

export enum AiringSort {
  ID = "ID",
  ID_DESC = "ID_DESC",
  MEDIA_ID = "MEDIA_ID",
  MEDIA_ID_DESC = "MEDIA_ID_DESC",
  TIME = "TIME",
  TIME_DESC = "TIME_DESC",
  EPISODE = "EPISODE",
  EPISODE_DESC = "EPISODE_DESC",
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

export enum MediaRelationType {
  ADAPTATION = "ADAPTATION",
  PREQUEL = "PREQUEL",
  SEQUEL = "SEQUEL",
  PARENT = "PARENT",
  SIDE_STORY = "SIDE_STORY",
  CHARACTER = "CHARACTER",
  SUMMARY = "SUMMARY",
  ALTERNATIVE = "ALTERNATIVE",
  SPIN_OFF = "SPIN_OFF",
  OTHER = "OTHER",
  SOURCE = "SOURCE",
  COMPILATION = "COMPILATION",
  CONTAINS = "CONTAINS",
}

export interface MediaEdge {
  relationType: MediaRelationType;
  node: Pick<Media, "id" | "title" | "type" | "format" | "status" | "coverImage" | "siteUrl">;
}

export interface MediaConnection {
  edges: MediaEdge[];
}

export interface MediaCharacterEdge {
  role: CharacterRole;
  node: Omit<Character, "media">;
  voiceActors?: VoiceActor[];
}

export interface MediaCharacterConnection {
  edges: MediaCharacterEdge[];
}

export interface MediaStaffEdge {
  role: string;
  node: Staff;
}

export interface MediaStaffConnection {
  edges: MediaStaffEdge[];
}

export interface StreamingEpisode {
  title: string | null;
  thumbnail: string | null;
  url: string | null;
  site: string | null;
}

export interface ScoreDistribution {
  score: number;
  amount: number;
}

export interface StatusDistribution {
  status: MediaListStatus;
  amount: number;
}

export interface MediaStats {
  scoreDistribution: ScoreDistribution[];
  statusDistribution: StatusDistribution[];
}

export interface MediaRecommendationNode {
  id: number;
  rating: number | null;
  mediaRecommendation: Pick<Media, "id" | "title" | "type" | "format" | "coverImage" | "averageScore" | "siteUrl">;
}

export interface NextAiringEpisode {
  id: number;
  airingAt: number;
  episode: number;
  mediaId: number;
  timeUntilAiring: number;
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
  source: MediaSource | null;
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
  relations: MediaConnection | null;
  characters?: MediaCharacterConnection;
  staff?: MediaStaffConnection;
  streamingEpisodes?: StreamingEpisode[];
  externalLinks?: ExternalLink[];
  stats?: MediaStats;
  recommendations?: { nodes: MediaRecommendationNode[] };
  nextAiringEpisode: NextAiringEpisode | null;
  isAdult: boolean | null;
  siteUrl: string | null;
}

export interface SearchMediaOptions {
  query?: string;
  type?: MediaType;
  format?: MediaFormat;
  status?: MediaStatus;
  season?: MediaSeason;
  seasonYear?: number;
  /** Single genre filter (kept for backward compat) */
  genre?: string;
  /** Single tag filter (kept for backward compat) */
  tag?: string;
  /** Filter by multiple genres (media must match ALL) */
  genres?: string[];
  /** Filter by multiple tags (media must match ALL) */
  tags?: string[];
  /** Exclude media with any of these genres */
  genresExclude?: string[];
  /** Exclude media with any of these tags */
  tagsExclude?: string[];
  isAdult?: boolean;
  sort?: MediaSort[];
  page?: number;
  perPage?: number;
}

export interface GetAiringOptions {
  /** Only show episodes that aired after this UNIX timestamp */
  airingAtGreater?: number;
  /** Only show episodes that aired before this UNIX timestamp */
  airingAtLesser?: number;
  /** Sort order (default: TIME_DESC) */
  sort?: AiringSort[];
  page?: number;
  perPage?: number;
}

export interface GetRecentChaptersOptions {
  /** Page number (default: 1) */
  page?: number;
  /** Results per page (default: 20, max 50) */
  perPage?: number;
}

export interface GetPlanningOptions {
  /** Filter by ANIME or MANGA (returns both if omitted) */
  type?: MediaType;
  /** Sort order (default: POPULARITY_DESC) */
  sort?: MediaSort[];
  page?: number;
  perPage?: number;
}

export enum RecommendationSort {
  ID = "ID",
  ID_DESC = "ID_DESC",
  RATING = "RATING",
  RATING_DESC = "RATING_DESC",
}

export interface Recommendation {
  id: number;
  rating: number | null;
  userRating: string | null;
  mediaRecommendation: Media;
  user: {
    id: number;
    name: string;
    avatar: UserAvatar;
  } | null;
}

export interface GetRecommendationsOptions {
  /** The AniList media ID to get recommendations for */
  mediaId: number;
  /** Sort order (default: RATING_DESC) */
  sort?: RecommendationSort[];
  page?: number;
  perPage?: number;
}

export interface GetSeasonOptions {
  /** The season (WINTER, SPRING, SUMMER, FALL) */
  season: MediaSeason;
  /** The year */
  seasonYear: number;
  /** Filter by ANIME or MANGA (defaults to ANIME) */
  type?: MediaType;
  /** Sort order (default: POPULARITY_DESC) */
  sort?: MediaSort[];
  page?: number;
  perPage?: number;
}

/**
 * Options to include additional related data when fetching a media entry.
 * Pass `true` to include with defaults, or an object to customize.
 */
export interface MediaIncludeOptions {
  /** Include characters with their roles (MAIN, SUPPORTING, BACKGROUND).
   *  `true` = 25 results sorted by role. Object form to customize. */
  characters?: boolean | { perPage?: number; sort?: boolean; voiceActors?: boolean };
  /** Include staff members with their roles.
   *  `true` = 25 results sorted by relevance. Object form to customize. */
  staff?: boolean | { perPage?: number; sort?: boolean };
  /** Include relations (default: `true` for backward compat). Set to `false` to exclude. */
  relations?: boolean;
  /** Include streaming episode links (Crunchyroll, Funimation, etc.) */
  streamingEpisodes?: boolean;
  /** Include external links (MAL, official site, etc.) */
  externalLinks?: boolean;
  /** Include score & status distribution stats */
  stats?: boolean;
  /** Include user recommendations. `true` = 10 results, or customize with `{ perPage }`. */
  recommendations?: boolean | { perPage?: number };
}

export interface AiringSchedule {
  id: number;
  airingAt: number;
  timeUntilAiring: number;
  episode: number;
  mediaId: number;
  media: Media;
}

export type DayOfWeek = "Monday" | "Tuesday" | "Wednesday" | "Thursday" | "Friday" | "Saturday" | "Sunday";

export type WeeklySchedule = Record<DayOfWeek, AiringSchedule[]>;
