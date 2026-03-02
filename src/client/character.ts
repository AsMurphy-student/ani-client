import {
  QUERY_CHARACTER_BY_ID,
  QUERY_CHARACTER_BY_ID_WITH_VA,
  QUERY_CHARACTER_SEARCH,
  QUERY_CHARACTER_SEARCH_WITH_VA,
} from "../queries";

import type { Character, CharacterIncludeOptions, PagedResult, SearchCharacterOptions } from "../types";

import { clampPerPage, validateId } from "../utils";
import type { ClientBase } from "./base";

export async function getCharacter(
  client: ClientBase,
  id: number,
  include?: CharacterIncludeOptions,
): Promise<Character> {
  validateId(id, "characterId");
  const query = include?.voiceActors ? QUERY_CHARACTER_BY_ID_WITH_VA : QUERY_CHARACTER_BY_ID;
  const data = await client.request<{ Character: Character }>(query, { id });
  return data.Character;
}

export async function searchCharacters(
  client: ClientBase,
  options: SearchCharacterOptions = {},
): Promise<PagedResult<Character>> {
  const { query: search, page = 1, perPage = 20, sort, voiceActors } = options;
  const gqlQuery = voiceActors ? QUERY_CHARACTER_SEARCH_WITH_VA : QUERY_CHARACTER_SEARCH;
  return client.pagedRequest<Character>(gqlQuery, { search, sort, page, perPage: clampPerPage(perPage) }, "characters");
}
