# API Reference

Complete reference for every public method on `AniListClient`.

## Constructor

```typescript
import { AniListClient } from "ani-client";

const client = new AniListClient(options?: AniListClientOptions);
```

See [Types & Enums → AniListClientOptions](./types#anilistclientoptions) for configuration details.

---

## Media

### `getMedia(id, include?)`

Fetch a single anime or manga by its AniList ID.

| Param | Type | Description |
| --- | --- | --- |
| `id` | `number` | AniList media ID |
| `include` | `MediaIncludeOptions` | Optional related data (characters, staff, etc.) |

**Returns:** `Promise<Media>`

```typescript
const anime = await client.getMedia(1);
const full = await client.getMedia(1, { characters: true, staff: true, stats: true });
```

### `searchMedia(options?)`

Search for anime or manga with filters.

| Param | Type |
| --- | --- |
| `options` | `SearchMediaOptions` (query, type, format, status, season, genre, tag, sort, page, perPage) |

**Returns:** `Promise<PagedResult<Media>>`

### `getTrending(type?, page?, perPage?)`

Get currently trending anime or manga.

**Returns:** `Promise<PagedResult<Media>>`

### `getMediaBySeason(options)`

Get anime/manga for a specific season + year.

| Param | Type |
| --- | --- |
| `options` | `GetSeasonOptions` (season, seasonYear, type?, sort?, page?, perPage?) |

**Returns:** `Promise<PagedResult<Media>>`

### `getPlanning(options?)`

Get upcoming (not yet released) media sorted by popularity.

| Param | Type |
| --- | --- |
| `options` | `GetPlanningOptions` (type?, sort?, page?, perPage?) |

**Returns:** `Promise<PagedResult<Media>>`

### `getAiredEpisodes(options?)`

Get recently aired anime episodes (default: last 24 hours).

| Param | Type |
| --- | --- |
| `options` | `GetAiringOptions` (airingAtGreater?, airingAtLesser?, sort?, page?, perPage?) |

**Returns:** `Promise<PagedResult<AiringSchedule>>`

### `getAiredChapters(options?)`

Get currently releasing manga sorted by most recently updated.

**Returns:** `Promise<PagedResult<Media>>`

### `getRecommendations(mediaId, options?)`

Get user recommendations based on a specific media.

**Returns:** `Promise<PagedResult<Recommendation>>`

---

## Characters & Staff

### `getCharacter(id, include?)`

Fetch a character by AniList ID. Pass `{ voiceActors: true }` to include voice actor data.

**Returns:** `Promise<Character>`

### `searchCharacters(options?)`

Search characters by name. Supports `voiceActors: true`.

**Returns:** `Promise<PagedResult<Character>>`

### `getStaff(id, include?)`

Fetch a staff member by ID. Pass `{ media: true }` to include their media credits.

**Returns:** `Promise<Staff>`

### `searchStaff(options?)`

Search for staff (directors, voice actors, etc.).

**Returns:** `Promise<PagedResult<Staff>>`

---

## Users & Lists

### `getUser(id)`

Fetch a user by AniList ID.

**Returns:** `Promise<User>`

### `getUserByName(name)`

Fetch a user by their username.

**Returns:** `Promise<User>`

### `getUserMediaList(options)`

Get a user's anime or manga list. Requires `userId` or `userName` and `type`.

| Param | Type |
| --- | --- |
| `options` | `GetUserMediaListOptions` (userId?, userName?, type, status?, sort?, page?, perPage?) |

**Returns:** `Promise<PagedResult<MediaListEntry>>`

---

## Studios

### `getStudio(id)`

Fetch a studio by AniList ID, including its most popular productions.

**Returns:** `Promise<StudioDetail>`

### `searchStudios(options?)`

Search for studios by name.

**Returns:** `Promise<PagedResult<StudioDetail>>`

---

## Metadata

### `getGenres()`

Get all available genres on AniList.

**Returns:** `Promise<string[]>`

### `getTags()`

Get all available media tags.

**Returns:** `Promise<MediaTag[]>`

---

## Batch Queries

Fetch multiple IDs in a single GraphQL request (automatically chunked to 50 per call).

### `getMediaBatch(ids)`

**Returns:** `Promise<Media[]>`

### `getCharacterBatch(ids)`

**Returns:** `Promise<Character[]>`

### `getStaffBatch(ids)`

**Returns:** `Promise<Staff[]>`

---

## Pagination

### `paginate(fetchPage, maxPages?)`

Auto-paginating async iterator that yields individual items across all pages.

```typescript
for await (const anime of client.paginate(
  (page) => client.searchMedia({ query: "Gundam", page, perPage: 25 }),
  3, // max 3 pages
)) {
  console.log(anime.title.romaji);
}
```

---

## Cache Management

### `clearCache()`

Clear the entire response cache.

**Returns:** `Promise<void>`

### `invalidateCache(pattern)`

Remove cache entries matching a string or RegExp pattern.

**Returns:** `Promise<number>` (entries removed)

### `cacheSize`

Number of entries currently cached. May return a `Promise<number>` for async adapters.

---

## Raw Queries

### `raw<T>(query, variables?)`

Execute an arbitrary GraphQL query against the AniList API.

```typescript
const data = await client.raw<{ Media: { id: number; title: { romaji: string } } }>(
  "query { Media(id: 1) { id title { romaji } } }",
);
```

---

## Error Handling

All API errors throw `AniListError`:

```typescript
import { AniListError } from "ani-client";

try {
  await client.getMedia(999999999);
} catch (err) {
  if (err instanceof AniListError) {
    console.error(err.message); // "Not Found"
    console.error(err.status);  // 404
    console.error(err.errors);  // Raw error array
  }
}
```
