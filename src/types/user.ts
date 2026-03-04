import type { MediaCoverImage, MediaFormat, MediaTitle, MediaType } from "./media";

export enum UserSort {
  ID = "ID",
  ID_DESC = "ID_DESC",
  USERNAME = "USERNAME",
  USERNAME_DESC = "USERNAME_DESC",
  WATCHED_TIME = "WATCHED_TIME",
  WATCHED_TIME_DESC = "WATCHED_TIME_DESC",
  CHAPTERS_READ = "CHAPTERS_READ",
  CHAPTERS_READ_DESC = "CHAPTERS_READ_DESC",
  SEARCH_MATCH = "SEARCH_MATCH",
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

export interface SearchUserOptions {
  query?: string;
  sort?: UserSort[];
  page?: number;
  perPage?: number;
}

export interface FavoriteMediaNode {
  id: number;
  title: MediaTitle;
  coverImage: Pick<MediaCoverImage, "large" | "medium">;
  type: MediaType | null;
  format: MediaFormat | null;
  siteUrl: string | null;
}

export interface FavoriteCharacterNode {
  id: number;
  name: { full: string | null; native: string | null };
  image: { large: string | null; medium: string | null };
  siteUrl: string | null;
}

export interface FavoriteStaffNode {
  id: number;
  name: { full: string | null; native: string | null };
  image: { large: string | null; medium: string | null };
  siteUrl: string | null;
}

export interface FavoriteStudioNode {
  id: number;
  name: string;
  siteUrl: string | null;
}

export interface UserFavorites {
  anime: FavoriteMediaNode[];
  manga: FavoriteMediaNode[];
  characters: FavoriteCharacterNode[];
  staff: FavoriteStaffNode[];
  studios: FavoriteStudioNode[];
}
