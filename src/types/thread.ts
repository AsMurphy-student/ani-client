import type { MediaCoverImage, MediaTitle, MediaType } from "./media";
import type { UserAvatar } from "./user";

/** Represents a forum thread on AniList. */
export interface Thread {
  id: number;
  title: string;
  body: string | null;
  userId: number;
  replyUserId: number | null;
  replyCommentId: number | null;
  replyCount: number;
  viewCount: number;
  isLocked: boolean;
  isSticky: boolean;
  isSubscribed: boolean;
  repliedAt: number | null;
  createdAt: number;
  updatedAt: number;
  siteUrl: string | null;
  user: {
    id: number;
    name: string;
    avatar: UserAvatar;
  } | null;
  replyUser: {
    id: number;
    name: string;
    avatar: UserAvatar;
  } | null;
  categories: ThreadCategory[] | null;
  mediaCategories: ThreadMediaCategory[] | null;
  likes: { id: number; name: string }[] | null;
}

export interface ThreadCategory {
  id: number;
  name: string;
}

export interface ThreadMediaCategory {
  id: number;
  title: MediaTitle;
  type: MediaType;
  coverImage: Pick<MediaCoverImage, "large" | "medium"> | null;
  siteUrl: string | null;
}

/** Sort options for thread queries. */
export enum ThreadSort {
  ID = "ID",
  ID_DESC = "ID_DESC",
  TITLE = "TITLE",
  TITLE_DESC = "TITLE_DESC",
  CREATED_AT = "CREATED_AT",
  CREATED_AT_DESC = "CREATED_AT_DESC",
  UPDATED_AT = "UPDATED_AT",
  UPDATED_AT_DESC = "UPDATED_AT_DESC",
  REPLIED_AT = "REPLIED_AT",
  REPLIED_AT_DESC = "REPLIED_AT_DESC",
  REPLY_COUNT = "REPLY_COUNT",
  REPLY_COUNT_DESC = "REPLY_COUNT_DESC",
  VIEW_COUNT = "VIEW_COUNT",
  VIEW_COUNT_DESC = "VIEW_COUNT_DESC",
  IS_STICKY = "IS_STICKY",
  SEARCH_MATCH = "SEARCH_MATCH",
}

/** Options for searching/listing threads. */
export interface SearchThreadOptions {
  /** Search query */
  query?: string;
  /** Filter by media ID */
  mediaId?: number;
  /** Filter by category ID */
  categoryId?: number;
  /** Sort order */
  sort?: ThreadSort[];
  /** Page number */
  page?: number;
  /** Results per page (max 50) */
  perPage?: number;
}
