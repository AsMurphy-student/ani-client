import type { PageInfo } from "./common";
import type { Media } from "./media";

export interface Studio {
  id: number;
  name: string;
  isAnimationStudio: boolean;
  siteUrl: string | null;
  favourites?: number | null;
  media?: {
    pageInfo: PageInfo;
    nodes: Pick<Media, "id" | "title" | "type" | "format" | "coverImage" | "siteUrl">[];
  } | null;
}

export interface StudioConnection {
  nodes: Studio[];
}

export enum StudioSort {
  ID = "ID",
  ID_DESC = "ID_DESC",
  NAME = "NAME",
  NAME_DESC = "NAME_DESC",
  SEARCH_MATCH = "SEARCH_MATCH",
  FAVOURITES = "FAVOURITES",
  FAVOURITES_DESC = "FAVOURITES_DESC",
}

export interface SearchStudioOptions {
  query?: string;
  sort?: StudioSort[];
  page?: number;
  perPage?: number;
}
