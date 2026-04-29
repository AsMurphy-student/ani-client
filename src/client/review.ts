import { QUERY_REVIEW_BY_ID, QUERY_REVIEWS } from "../queries";

import type { PagedResult, Review, SearchReviewOptions } from "../types";

import { clampPerPage, validateId } from "../utils";
import type { ClientBase } from "./base";

/** @internal Fetch a review by AniList ID. */
export async function getReview(client: ClientBase, id: number): Promise<Review> {
  validateId(id, "reviewId");
  const data = await client.request<{ Review: Review }>(QUERY_REVIEW_BY_ID, { id });
  return data.Review;
}

/** @internal Search for reviews with optional media, user, and sort filters. */
export async function searchReviews(
  client: ClientBase,
  options: SearchReviewOptions = {},
): Promise<PagedResult<Review>> {
  const { mediaId, userId, sort, page = 1, perPage = 20 } = options;
  return client.pagedRequest<Review>(
    QUERY_REVIEWS,
    { mediaId, userId, sort, page, perPage: clampPerPage(perPage) },
    "reviews",
  );
}
