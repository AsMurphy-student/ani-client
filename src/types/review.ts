import type { Media } from "./media";
import type { User } from "./user";

export enum ReviewSort {
  ID = "ID",
  ID_DESC = "ID_DESC",
  SCORE = "SCORE",
  SCORE_DESC = "SCORE_DESC",
  RATING = "RATING",
  RATING_DESC = "RATING_DESC",
  CREATED_AT = "CREATED_AT",
  CREATED_AT_DESC = "CREATED_AT_DESC",
  UPDATED_AT = "UPDATED_AT",
  UPDATED_AT_DESC = "UPDATED_AT_DESC",
}

export interface Review {
  id: number;
  userId: number;
  mediaId: number;
  mediaType: "ANIME" | "MANGA";
  summary: string;
  body: string;
  rating: number;
  ratingAmount: number;
  userRating: "UP_VOTE" | "DOWN_VOTE" | "NO_VOTE";
  score: number;
  private: boolean;
  siteUrl: string;
  createdAt: number;
  updatedAt: number;
  user: User;
  media: Media;
}

export interface SearchReviewOptions {
  mediaId?: number;
  userId?: number;
  sort?: ReviewSort[];
  page?: number;
  perPage?: number;
}
