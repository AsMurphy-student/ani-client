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
