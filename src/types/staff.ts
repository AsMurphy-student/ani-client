import type { FuzzyDate } from "./common";
import type { MediaCoverImage, MediaFormat, MediaSeason, MediaStatus, MediaTitle, MediaType } from "./media";

export enum StaffSort {
  ID = "ID",
  ID_DESC = "ID_DESC",
  ROLE = "ROLE",
  ROLE_DESC = "ROLE_DESC",
  LANGUAGE = "LANGUAGE",
  LANGUAGE_DESC = "LANGUAGE_DESC",
  SEARCH_MATCH = "SEARCH_MATCH",
  FAVOURITES = "FAVOURITES",
  FAVOURITES_DESC = "FAVOURITES_DESC",
  RELEVANCE = "RELEVANCE",
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

/** A media node returned inside `Staff.staffMedia`. */
export interface StaffMediaNode {
  id: number;
  title: MediaTitle;
  type: MediaType;
  format: MediaFormat | null;
  status: MediaStatus | null;
  coverImage: MediaCoverImage;
  bannerImage: string | null;
  genres: string[];
  averageScore: number | null;
  meanScore: number | null;
  popularity: number | null;
  favourites: number | null;
  episodes: number | null;
  trending: number | null;
  hashtag: string | null;
  season: MediaSeason | null;
  seasonYear: number | null;
  startDate: FuzzyDate | null;
  endDate: FuzzyDate | null;
  nextAiringEpisode: {
    id: number;
    airingAt: number;
    episode: number;
    mediaId: number;
    timeUntilAiring: number;
  } | null;
  studios: { edges: { node: { name: string } }[] } | null;
  siteUrl: string | null;
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
  age: string | null;
  yearsActive: number[];
  homeTown: string | null;
  bloodType: string | null;
  favourites: number | null;
  siteUrl: string | null;
  /** Media the staff member has worked on — only present when requested via include options. */
  staffMedia?: {
    nodes: StaffMediaNode[];
  } | null;
}

/** Options to include additional related data when fetching a staff member by ID. */
export interface StaffIncludeOptions {
  /** Include media the staff member has worked on.
   *  `true` = 25 results sorted by popularity. Object form to customize. */
  media?: boolean | { perPage?: number; sort?: boolean };
}

export interface SearchStaffOptions {
  query?: string;
  sort?: StaffSort[];
  page?: number;
  perPage?: number;
}

/** Compact voice actor data returned inside character edges. */
export interface VoiceActor {
  id: number;
  name: {
    first: string | null;
    middle: string | null;
    last: string | null;
    full: string | null;
    native: string | null;
    userPreferred: string | null;
  };
  languageV2: string | null;
  image: StaffImage;
  gender: string | null;
  primaryOccupations: string[];
  siteUrl: string | null;
}
