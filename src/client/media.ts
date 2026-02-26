import {
  QUERY_AIRING_SCHEDULE,
  QUERY_MEDIA_BY_ID,
  QUERY_MEDIA_BY_SEASON,
  QUERY_MEDIA_SEARCH,
  QUERY_PLANNING,
  QUERY_RECENT_CHAPTERS,
  QUERY_RECOMMENDATIONS,
  QUERY_TRENDING,
  buildMediaByIdQuery,
} from "../queries";

import { MediaSort, MediaType } from "../types";
import type {
  AiringSchedule,
  GetAiringOptions,
  GetPlanningOptions,
  GetRecentChaptersOptions,
  GetRecommendationsOptions,
  GetSeasonOptions,
  Media,
  MediaIncludeOptions,
  PagedResult,
  Recommendation,
  SearchMediaOptions,
} from "../types";

import { clampPerPage } from "../utils";
import type { ClientBase } from "./base";

// ── Media methods ──

export async function getMedia(client: ClientBase, id: number, include?: MediaIncludeOptions): Promise<Media> {
  const query = buildMediaByIdQuery(include);
  const data = await client.request<{ Media: Media }>(query, { id });
  return data.Media;
}

export async function searchMedia(client: ClientBase, options: SearchMediaOptions = {}): Promise<PagedResult<Media>> {
  const { query: search, page = 1, perPage = 20, genres, tags, genresExclude, tagsExclude, ...filters } = options;
  return client.pagedRequest<Media>(
    QUERY_MEDIA_SEARCH,
    {
      search,
      ...filters,
      genre_in: genres,
      tag_in: tags,
      genre_not_in: genresExclude,
      tag_not_in: tagsExclude,
      page,
      perPage: clampPerPage(perPage),
    },
    "media",
  );
}

export async function getTrending(
  client: ClientBase,
  type: MediaType = MediaType.ANIME,
  page = 1,
  perPage = 20,
): Promise<PagedResult<Media>> {
  return client.pagedRequest<Media>(QUERY_TRENDING, { type, page, perPage: clampPerPage(perPage) }, "media");
}

export async function getPopular(
  client: ClientBase,
  type: MediaType = MediaType.ANIME,
  page = 1,
  perPage = 20,
): Promise<PagedResult<Media>> {
  return searchMedia(client, { type, sort: [MediaSort.POPULARITY_DESC], page, perPage });
}

export async function getTopRated(
  client: ClientBase,
  type: MediaType = MediaType.ANIME,
  page = 1,
  perPage = 20,
): Promise<PagedResult<Media>> {
  return searchMedia(client, { type, sort: [MediaSort.SCORE_DESC], page, perPage });
}

export async function getAiredEpisodes(
  client: ClientBase,
  options: GetAiringOptions = {},
): Promise<PagedResult<AiringSchedule>> {
  const now = Math.floor(Date.now() / 1000);
  return client.pagedRequest<AiringSchedule>(
    QUERY_AIRING_SCHEDULE,
    {
      airingAt_greater: options.airingAtGreater ?? now - 24 * 3600,
      airingAt_lesser: options.airingAtLesser ?? now,
      sort: options.sort,
      page: options.page ?? 1,
      perPage: clampPerPage(options.perPage ?? 20),
    },
    "airingSchedules",
  );
}

export async function getAiredChapters(
  client: ClientBase,
  options: GetRecentChaptersOptions = {},
): Promise<PagedResult<Media>> {
  return client.pagedRequest<Media>(
    QUERY_RECENT_CHAPTERS,
    {
      page: options.page ?? 1,
      perPage: clampPerPage(options.perPage ?? 20),
    },
    "media",
  );
}

export async function getPlanning(client: ClientBase, options: GetPlanningOptions = {}): Promise<PagedResult<Media>> {
  return client.pagedRequest<Media>(
    QUERY_PLANNING,
    {
      type: options.type,
      sort: options.sort ?? [MediaSort.POPULARITY_DESC],
      page: options.page ?? 1,
      perPage: clampPerPage(options.perPage ?? 20),
    },
    "media",
  );
}

export async function getRecommendations(
  client: ClientBase,
  mediaId: number,
  options: Omit<GetRecommendationsOptions, "mediaId"> = {},
): Promise<PagedResult<Recommendation>> {
  const data = await client.request<{
    Media: {
      recommendations: {
        pageInfo: { total: number; perPage: number; currentPage: number; lastPage: number; hasNextPage: boolean };
        nodes: Recommendation[];
      };
    };
  }>(QUERY_RECOMMENDATIONS, {
    mediaId,
    page: options.page ?? 1,
    perPage: clampPerPage(options.perPage ?? 20),
    sort: options.sort,
  });

  return {
    pageInfo: data.Media.recommendations.pageInfo,
    results: data.Media.recommendations.nodes,
  };
}

export async function getMediaBySeason(client: ClientBase, options: GetSeasonOptions): Promise<PagedResult<Media>> {
  return client.pagedRequest<Media>(
    QUERY_MEDIA_BY_SEASON,
    {
      season: options.season,
      seasonYear: options.seasonYear,
      type: options.type,
      sort: options.sort,
      page: options.page ?? 1,
      perPage: clampPerPage(options.perPage ?? 20),
    },
    "media",
  );
}
