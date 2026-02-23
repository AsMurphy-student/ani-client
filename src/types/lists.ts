import type { FuzzyDate } from "./common";
import type { Media, MediaType } from "./media";

export enum MediaListStatus {
  CURRENT = "CURRENT",
  PLANNING = "PLANNING",
  COMPLETED = "COMPLETED",
  DROPPED = "DROPPED",
  PAUSED = "PAUSED",
  REPEATING = "REPEATING",
}

export enum MediaListSort {
  MEDIA_ID = "MEDIA_ID",
  MEDIA_ID_DESC = "MEDIA_ID_DESC",
  SCORE = "SCORE",
  SCORE_DESC = "SCORE_DESC",
  STATUS = "STATUS",
  STATUS_DESC = "STATUS_DESC",
  PROGRESS = "PROGRESS",
  PROGRESS_DESC = "PROGRESS_DESC",
  PROGRESS_VOLUMES = "PROGRESS_VOLUMES",
  PROGRESS_VOLUMES_DESC = "PROGRESS_VOLUMES_DESC",
  REPEAT = "REPEAT",
  REPEAT_DESC = "REPEAT_DESC",
  PRIORITY = "PRIORITY",
  PRIORITY_DESC = "PRIORITY_DESC",
  STARTED_ON = "STARTED_ON",
  STARTED_ON_DESC = "STARTED_ON_DESC",
  FINISHED_ON = "FINISHED_ON",
  FINISHED_ON_DESC = "FINISHED_ON_DESC",
  ADDED_TIME = "ADDED_TIME",
  ADDED_TIME_DESC = "ADDED_TIME_DESC",
  UPDATED_TIME = "UPDATED_TIME",
  UPDATED_TIME_DESC = "UPDATED_TIME_DESC",
  MEDIA_TITLE_ROMAJI = "MEDIA_TITLE_ROMAJI",
  MEDIA_TITLE_ROMAJI_DESC = "MEDIA_TITLE_ROMAJI_DESC",
  MEDIA_TITLE_ENGLISH = "MEDIA_TITLE_ENGLISH",
  MEDIA_TITLE_ENGLISH_DESC = "MEDIA_TITLE_ENGLISH_DESC",
  MEDIA_TITLE_NATIVE = "MEDIA_TITLE_NATIVE",
  MEDIA_TITLE_NATIVE_DESC = "MEDIA_TITLE_NATIVE_DESC",
  MEDIA_POPULARITY = "MEDIA_POPULARITY",
  MEDIA_POPULARITY_DESC = "MEDIA_POPULARITY_DESC",
}

export interface MediaListEntry {
  id: number;
  mediaId: number;
  status: MediaListStatus;
  score: number | null;
  progress: number | null;
  progressVolumes: number | null;
  repeat: number | null;
  priority: number | null;
  private: boolean | null;
  notes: string | null;
  startedAt: FuzzyDate | null;
  completedAt: FuzzyDate | null;
  updatedAt: number | null;
  createdAt: number | null;
  media: Media;
}

export interface GetUserMediaListOptions {
  /** User ID (provide either userId or userName) */
  userId?: number;
  /** Username (provide either userId or userName) */
  userName?: string;
  /** ANIME or MANGA */
  type: MediaType;
  /** Filter by list status (CURRENT, COMPLETED, etc.) */
  status?: MediaListStatus;
  /** Sort order */
  sort?: MediaListSort[];
  page?: number;
  perPage?: number;
}
