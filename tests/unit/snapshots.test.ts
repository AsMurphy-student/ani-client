import { describe, expect, it } from "vitest";
import {
  buildBatchCharacterQuery,
  buildBatchMediaQuery,
  buildBatchStaffQuery,
  buildMediaByIdQuery,
} from "../../src/queries/builders";
import {
  QUERY_AIRING_SCHEDULE,
  QUERY_MEDIA_BY_MAL_ID,
  QUERY_MEDIA_SEARCH,
  QUERY_TRENDING,
} from "../../src/queries/media";
import { buildStudioByIdQuery } from "../../src/queries/studio";
import { QUERY_STUDIO_SEARCH } from "../../src/queries/studio";
import { buildUserFavoritesQuery } from "../../src/queries/user";

describe("query snapshots", () => {
  // ── Media queries ──

  it("QUERY_MEDIA_SEARCH matches snapshot", () => {
    expect(QUERY_MEDIA_SEARCH).toMatchSnapshot();
  });

  it("QUERY_TRENDING matches snapshot", () => {
    expect(QUERY_TRENDING).toMatchSnapshot();
  });

  it("QUERY_AIRING_SCHEDULE matches snapshot", () => {
    expect(QUERY_AIRING_SCHEDULE).toMatchSnapshot();
  });

  it("QUERY_MEDIA_BY_MAL_ID matches snapshot", () => {
    expect(QUERY_MEDIA_BY_MAL_ID).toMatchSnapshot();
  });

  // ── buildMediaByIdQuery snapshots ──

  it("buildMediaByIdQuery() default matches snapshot", () => {
    expect(buildMediaByIdQuery()).toMatchSnapshot();
  });

  it("buildMediaByIdQuery with all includes matches snapshot", () => {
    const query = buildMediaByIdQuery({
      characters: { perPage: 25, voiceActors: true },
      staff: { perPage: 10 },
      relations: true,
      streamingEpisodes: true,
      externalLinks: true,
      stats: true,
      recommendations: { perPage: 5 },
    });
    expect(query).toMatchSnapshot();
  });

  it("buildMediaByIdQuery with relations: false matches snapshot", () => {
    expect(buildMediaByIdQuery({ relations: false })).toMatchSnapshot();
  });

  // ── Batch query snapshots ──

  it("buildBatchMediaQuery matches snapshot", () => {
    expect(buildBatchMediaQuery([1, 20, 5735])).toMatchSnapshot();
  });

  it("buildBatchCharacterQuery matches snapshot", () => {
    expect(buildBatchCharacterQuery([1, 40, 100])).toMatchSnapshot();
  });

  it("buildBatchStaffQuery matches snapshot", () => {
    expect(buildBatchStaffQuery([95001, 95002])).toMatchSnapshot();
  });

  // ── Studio query snapshots ──

  it("QUERY_STUDIO_SEARCH matches snapshot", () => {
    expect(QUERY_STUDIO_SEARCH).toMatchSnapshot();
  });

  it("buildStudioByIdQuery() default matches snapshot", () => {
    expect(buildStudioByIdQuery()).toMatchSnapshot();
  });

  it("buildStudioByIdQuery(50) matches snapshot", () => {
    expect(buildStudioByIdQuery(50)).toMatchSnapshot();
  });

  // ── User favorites query snapshots ──

  it("buildUserFavoritesQuery('id', 25) matches snapshot", () => {
    expect(buildUserFavoritesQuery("id", 25)).toMatchSnapshot();
  });

  it("buildUserFavoritesQuery('name', 50) matches snapshot", () => {
    expect(buildUserFavoritesQuery("name", 50)).toMatchSnapshot();
  });
});
