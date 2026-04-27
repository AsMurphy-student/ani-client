import {
  buildMediaByIdQuery,
  buildMediaCharactersQuery,
  buildMediaStaffQuery,
  QUERY_AIRING_SCHEDULE,
  QUERY_MEDIA_BY_MAL_ID,
  QUERY_MEDIA_BY_SEASON,
  QUERY_MEDIA_SEARCH,
  QUERY_PLANNING,
  QUERY_RECENT_CHAPTERS,
  QUERY_RECOMMENDATIONS,
  QUERY_TRENDING,
} from "../queries";
import type {
  AiringSchedule,
  DayOfWeek,
  GeneralMediaQueryOptions,
  GetAiringOptions,
  GetMediaCharactersOptions,
  GetMediaStaffOptions,
  GetPlanningOptions,
  GetRecentChaptersOptions,
  GetRecommendationsOptions,
  GetSeasonOptions,
  Media,
  MediaCharacterEdge,
  MediaIncludeOptions,
  MediaStaffEdge,
  PagedResult,
  PageInfo,
  Recommendation,
  SearchMediaOptions,
  WeeklySchedule,
} from "../types";
import { MediaSort, MediaType } from "../types";

import { clampPerPage, validateId } from "../utils";
import type { ClientBase } from "./base";

export async function getMedia(client: ClientBase, id: number, include?: MediaIncludeOptions): Promise<Media> {
  validateId(id, "mediaId");
  const query = buildMediaByIdQuery(include);
  const data = await client.request<{ Media: Media }>(query, { id });
  return data.Media;
}

export async function getMediaCharacters(
  client: ClientBase,
  mediaId: number,
  options: GetMediaCharactersOptions = {},
): Promise<PagedResult<MediaCharacterEdge>> {
  validateId(mediaId, "mediaId");
  const query = buildMediaCharactersQuery(options);
  const data = await client.request<{ Media: { characters: { pageInfo: PageInfo; edges: MediaCharacterEdge[] } } }>(
    query,
    { mediaId, page: options.page ?? 1, perPage: clampPerPage(options.perPage ?? 25) },
  );

  return { pageInfo: data.Media.characters.pageInfo, results: data.Media.characters.edges };
}

export async function getMediaStaff(
  client: ClientBase,
  mediaId: number,
  options: GetMediaStaffOptions = {},
): Promise<PagedResult<MediaStaffEdge>> {
  validateId(mediaId, "mediaId");
  const query = buildMediaStaffQuery(options);
  const data = await client.request<{ Media: { staff: { pageInfo: PageInfo; edges: MediaStaffEdge[] } } }>(query, {
    mediaId,
    page: options.page ?? 1,
    perPage: clampPerPage(options.perPage ?? 25),
  });

  return { pageInfo: data.Media.staff.pageInfo, results: data.Media.staff.edges };
}

export async function getMediaByMalId(client: ClientBase, malId: number, type?: MediaType): Promise<Media> {
  validateId(malId, "malId");
  const data = await client.request<{ Media: Media }>(QUERY_MEDIA_BY_MAL_ID, {
    idMal: malId,
    type,
  });
  return data.Media;
}

export async function searchMedia(client: ClientBase, options: SearchMediaOptions = {}): Promise<PagedResult<Media>> {
  const {
    query: search,
    page = 1,
    perPage = 20,
    genres,
    tags,
    genresExclude,
    tagsExclude,
    format,
    ...filters
  } = options;
  return client.pagedRequest<Media>(
    QUERY_MEDIA_SEARCH,
    {
      search,
      ...filters,
      format: Array.isArray(format) ? undefined : format,
      format_in: Array.isArray(format) ? format : undefined,
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

export async function getTrending(client: ClientBase, options: GeneralMediaQueryOptions): Promise<PagedResult<Media>> {
  const { type = MediaType.ANIME, isAdult = false, idNotIn = [], page = 1, perPage = 20 } = options;
  return client.pagedRequest<Media>(
    QUERY_TRENDING,
    { type, isAdult, idNotIn, page, perPage: clampPerPage(perPage) },
    "media",
  );
}

export async function getPopular(client: ClientBase, options: GeneralMediaQueryOptions): Promise<PagedResult<Media>> {
  const { type = MediaType.ANIME, isAdult = false, idNotIn = [], page = 1, perPage = 20 } = options;
  return searchMedia(client, { type, isAdult, idNotIn, sort: [MediaSort.POPULARITY_DESC], page, perPage });
}

export async function getTopRated(client: ClientBase, options: GeneralMediaQueryOptions): Promise<PagedResult<Media>> {
  const { type = MediaType.ANIME, isAdult = false, idNotIn = [], page = 1, perPage = 20 } = options;
  return searchMedia(client, { type, isAdult, idNotIn, sort: [MediaSort.SCORE_DESC], page, perPage });
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
      idNotIn: options.idNotIn ?? [],
      sort: options.sort,
      page: options.page ?? 1,
      perPage: clampPerPage(options.perPage ?? 20),
    },
    "airingSchedules",
  );
}

export async function getRecentlyUpdatedManga(
  client: ClientBase,
  options: GetRecentChaptersOptions = {},
): Promise<PagedResult<Media>> {
  return client.pagedRequest<Media>(
    QUERY_RECENT_CHAPTERS,
    {
      isAdult: options.isAdult ?? false,
      idNotIn: options.idNotIn ?? [],
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
      isAdult: options.isAdult ?? false,
      idNotIn: options.idNotIn ?? [],
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
  validateId(mediaId, "mediaId");
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
      isAdult: options.isAdult ?? false,
      idNotIn: options.idNotIn ?? [],
      sort: options.sort,
      page: options.page ?? 1,
      perPage: clampPerPage(options.perPage ?? 20),
    },
    "media",
  );
}

export async function getWeeklySchedule(
  client: ClientBase,
  date: Date = new Date(),
  idNotIn?: number[],
): Promise<WeeklySchedule> {
  const schedule: WeeklySchedule = {
    Monday: [],
    Tuesday: [],
    Wednesday: [],
    Thursday: [],
    Friday: [],
    Saturday: [],
    Sunday: [],
  };

  const utcDay = date.getUTCDay();
  const diff = utcDay === 0 ? -6 : 1 - utcDay;
  const startOfWeek = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate() + diff, 0, 0, 0));

  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setUTCDate(startOfWeek.getUTCDate() + 6);
  endOfWeek.setUTCHours(23, 59, 59, 999);

  const startTimestamp = Math.floor(startOfWeek.getTime() / 1000);
  const endTimestamp = Math.floor(endOfWeek.getTime() / 1000);

  const iterator = client.paginate(
    (page) =>
      getAiredEpisodes(client, {
        airingAtGreater: startTimestamp,
        airingAtLesser: endTimestamp,
        idNotIn,
        page,
        perPage: 50,
      }),
    20,
  );

  const names: DayOfWeek[] = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

  for await (const episode of iterator) {
    const epDate = new Date(episode.airingAt * 1000);
    const dayName = names[epDate.getUTCDay()];
    if (dayName) schedule[dayName].push(episode);
  }

  return schedule;
}
