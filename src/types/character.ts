import type { FuzzyDate } from "./common";
import type { Media } from "./media";
import type { VoiceActor } from "./staff";

export enum CharacterSort {
  ID = "ID",
  ID_DESC = "ID_DESC",
  ROLE = "ROLE",
  ROLE_DESC = "ROLE_DESC",
  SEARCH_MATCH = "SEARCH_MATCH",
  FAVOURITES = "FAVOURITES",
  FAVOURITES_DESC = "FAVOURITES_DESC",
}

export enum CharacterRole {
  MAIN = "MAIN",
  SUPPORTING = "SUPPORTING",
  BACKGROUND = "BACKGROUND",
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

export type CharacterMediaNode = Pick<Media, "id" | "title" | "type" | "coverImage" | "siteUrl">;

export interface CharacterMediaEdge {
  node: CharacterMediaNode;
  voiceActors?: VoiceActor[];
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
    nodes?: CharacterMediaNode[];
    edges?: CharacterMediaEdge[];
  } | null;
}

/** Options for including extra data when fetching a character. */
export interface CharacterIncludeOptions {
  /** Include voice actors for each media the character appears in. */
  voiceActors?: boolean;
}

export interface SearchCharacterOptions {
  query?: string;
  sort?: CharacterSort[];
  page?: number;
  perPage?: number;
  /** Include voice actors for each media the character appears in. */
  voiceActors?: boolean;
}
