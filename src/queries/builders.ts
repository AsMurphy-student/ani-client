import type { MediaIncludeOptions } from "../types";
import {
  CHARACTER_FIELDS,
  CHARACTER_FIELDS_COMPACT,
  MEDIA_FIELDS,
  MEDIA_FIELDS_BASE,
  RELATIONS_FIELDS,
  STAFF_FIELDS,
  VOICE_ACTOR_FIELDS_COMPACT,
} from "./fragments";
import { QUERY_MEDIA_BY_ID } from "./media";

/**
 * Build a `Media(id: $id)` query that optionally includes characters, staff,
 * relations, streaming episodes, external links, stats, and recommendations.
 *
 * When no include options are given, the query is identical to QUERY_MEDIA_BY_ID.
 *
 * @internal
 */
export function buildMediaByIdQuery(include?: MediaIncludeOptions): string {
  if (!include) return QUERY_MEDIA_BY_ID;

  const extra: string[] = [];

  if (include.relations !== false) {
    extra.push(RELATIONS_FIELDS);
  }

  if (include.characters) {
    const opts = typeof include.characters === "object" ? include.characters : {};
    const perPage = opts.perPage ?? 25;
    const sortClause = opts.sort !== false ? ", sort: [ROLE, RELEVANCE, ID]" : "";
    const voiceActorBlock = opts.voiceActors
      ? `\n            voiceActors {
              ${VOICE_ACTOR_FIELDS_COMPACT}
            }`
      : "";
    extra.push(`
    characters(perPage: ${perPage}${sortClause}) {
      edges {
        role
        node {
          ${CHARACTER_FIELDS_COMPACT}
        }${voiceActorBlock}
      }
    }`);
  }

  if (include.staff) {
    const opts = typeof include.staff === "object" ? include.staff : {};
    const perPage = opts.perPage ?? 25;
    const sortClause = opts.sort !== false ? ", sort: [RELEVANCE, ID]" : "";
    extra.push(`
    staff(perPage: ${perPage}${sortClause}) {
      edges {
        role
        node {
          ${STAFF_FIELDS}
        }
      }
    }`);
  }

  if (include.recommendations) {
    const perPage = typeof include.recommendations === "object" ? (include.recommendations.perPage ?? 10) : 10;
    extra.push(`
    recommendations(perPage: ${perPage}, sort: [RATING_DESC]) {
      nodes {
        id
        rating
        mediaRecommendation {
          id
          title { romaji english native userPreferred }
          type
          format
          coverImage { large medium }
          averageScore
          siteUrl
        }
      }
    }`);
  }

  if (include.streamingEpisodes) {
    extra.push(`
    streamingEpisodes {
      title
      thumbnail
      url
      site
    }`);
  }

  if (include.externalLinks) {
    extra.push(`
    externalLinks {
      id
      url
      site
      type
      icon
      color
    }`);
  }

  if (include.stats) {
    extra.push(`
    stats {
      scoreDistribution { score amount }
      statusDistribution { status amount }
    }`);
  }

  return `
query ($id: Int!) {
  Media(id: $id) {
    ${MEDIA_FIELDS_BASE}
    ${extra.join("\n")}
  }
}`;
}

/** @internal Build a batched GraphQL query using aliases. */
function buildBatchQuery(ids: number[], typeName: string, fields: string, prefix: string): string {
  const aliases = ids.map((id, i) => `${prefix}${i}: ${typeName}(id: ${id}) { ${fields} }`).join("\n  ");
  return `query {\n  ${aliases}\n}`;
}

export const buildBatchMediaQuery = (ids: number[]): string => buildBatchQuery(ids, "Media", MEDIA_FIELDS, "m");

export const buildBatchCharacterQuery = (ids: number[]): string =>
  buildBatchQuery(ids, "Character", CHARACTER_FIELDS, "c");

export const buildBatchStaffQuery = (ids: number[]): string => buildBatchQuery(ids, "Staff", STAFF_FIELDS, "s");
