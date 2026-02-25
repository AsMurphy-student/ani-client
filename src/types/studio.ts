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

/**
 * @deprecated Use `Studio` instead. `StudioDetail` is an alias kept for backward compatibility.
 */
export type StudioDetail = Studio;

export interface SearchStudioOptions {
  query?: string;
  page?: number;
  perPage?: number;
}
