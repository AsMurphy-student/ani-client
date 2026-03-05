---
title: API Reference
description: "Complete reference for every public method on AniListClient — media, characters, staff, users, studios, threads, batch queries, cache management, and more."
head:
  - - meta
    - property: og:title
      content: API Reference — ani-client
  - - meta
    - property: og:description
      content: Full API reference for all AniListClient methods with signatures, parameters, and usage examples.
---

# API Reference

Complete reference for every public method on `AniListClient`.

## Constructor

```typescript
import { AniListClient } from "ani-client";

const client = new AniListClient(options?: AniListClientOptions);
```

See [Types & Enums → AniListClientOptions](./types#anilistclientoptions) for configuration details.

::: tip Logger
Pass a `logger` option (any object with `debug`, `info`, `warn`, `error` methods) to get structured diagnostic output for every request, cache hit, and error. Works with `console`, [pino](https://github.com/pinojs/pino), or any compatible logger.

```typescript
const client = new AniListClient({ logger: console });
```
:::

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

Search for anime or manga with filters. Supports single and multi-criteria genre/tag filtering.

| Param | Type |
| --- | --- |
| `options` | `SearchMediaOptions` |

**Key options:** `query`, `type`, `format`, `status`, `season`, `genre`, `tag`, `genres`, `tags`, `genresExclude`, `tagsExclude`, `isAdult`, `sort`, `page`, `perPage`

**Returns:** `Promise<PagedResult<Media>>`

```typescript
// Multi-criteria search
const result = await client.searchMedia({
  type: MediaType.ANIME,
  genres: ["Action", "Sci-Fi"],
  tagsExclude: ["Gore"],
  sort: [MediaSort.POPULARITY_DESC],
});
```

### `getTrending(type?, page?, perPage?)`

Get currently trending anime or manga.

**Returns:** `Promise<PagedResult<Media>>`

### `getPopular(type?, page?, perPage?)`

Get the most popular anime or manga. Convenience wrapper around `searchMedia` with `POPULARITY_DESC` sort.

**Returns:** `Promise<PagedResult<Media>>`

```typescript
const popular = await client.getPopular(MediaType.ANIME, 1, 10);
```

### `getTopRated(type?, page?, perPage?)`

Get the highest-rated anime or manga. Convenience wrapper around `searchMedia` with `SCORE_DESC` sort.

**Returns:** `Promise<PagedResult<Media>>`

```typescript
const top = await client.getTopRated(MediaType.MANGA, 1, 10);
```

### `getWeeklySchedule(date?)`

Fetches the airing schedule for the entire week of the specified date (defaults to the current week). Returns a `WeeklySchedule` object grouped by day of the week.

**Returns:** `Promise<WeeklySchedule>`

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

### `getRecentlyUpdatedManga(options?)`

Get currently releasing manga sorted by most recently updated.

**Returns:** `Promise<PagedResult<Media>>`

::: warning Deprecation
`getAiredChapters()` is deprecated. Use `getRecentlyUpdatedManga()` instead — the old name is kept as an alias and will be removed in v2.
:::

### `getMediaByMalId(malId, type?)`

Fetch a single anime or manga by its **MyAnimeList** ID.

| Param | Type | Description |
| --- | --- | --- |
| `malId` | `number` | MyAnimeList media ID |
| `type` | `MediaType` | Optional — restrict to ANIME or MANGA |

**Returns:** `Promise<Media | null>` — `null` when no match exists.

```typescript
const anime = await client.getMediaByMalId(5114); // Fullmetal Alchemist: Brotherhood
```

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

### `getUser(idOrName)`

Fetch a user by AniList ID or username.

| Param | Type | Description |
| --- | --- | --- |
| `idOrName` | `number \| string` | AniList user ID or username |

**Returns:** `Promise<User>`

```typescript
const user = await client.getUser(1);        // by ID
const user = await client.getUser("AniList"); // by username
```

### `searchUsers(options?)`

Search for AniList users by name.

| Param | Type |
| --- | --- |
| `options` | `SearchUserOptions` (query?, sort?, page?, perPage?) |

**Returns:** `Promise<PagedResult<User>>`

```typescript
const result = await client.searchUsers({ query: "AniList", perPage: 5 });
```

### `getUserMediaList(options)`

Get a user's anime or manga list. Requires `userId` or `userName` and `type`.

| Param | Type |
| --- | --- |
| `options` | `GetUserMediaListOptions` (userId?, userName?, type, status?, sort?, page?, perPage?) |

**Returns:** `Promise<PagedResult<MediaListEntry>>`

**Throws:** `TypeError` if neither `userId` nor `userName` is provided.

### `getUserFavorites(idOrName, options?)`

Fetch a user's favorite anime, manga, characters, staff, and studios.

| Param | Type | Description |
| --- | --- | --- |
| `idOrName` | `number \| string` | AniList user ID or username |
| `options` | `UserFavoritesOptions` | Optional — control `perPage` per category |

**Returns:** `Promise<UserFavorites>`

```typescript
const favs = await client.getUserFavorites("AniList");
favs.anime.forEach(a => console.log(a.title.romaji));
favs.characters.forEach(c => console.log(c.name.full));

// Fetch more favorites per category (default 25, max 50)
const allFavs = await client.getUserFavorites("AniList", { perPage: 50 });
```

---

## Studios

### `getStudio(id, include?)`

Fetch a studio by AniList ID, including its most popular productions.

| Param | Type | Description |
| --- | --- | --- |
| `id` | `number` | AniList studio ID |
| `include` | `StudioIncludeOptions` | Optional — customise the embedded media list |

**Returns:** `Promise<Studio>`

```typescript
// Default: includes media
const studio = await client.getStudio(21);

// Control page size of the embedded media list
const studio = await client.getStudio(21, { media: { perPage: 50 } });
```

### `searchStudios(options?)`

Search for studios by name.

| Param | Type |
| --- | --- |
| `options` | `SearchStudioOptions` (query?, sort?, page?, perPage?) |

**Returns:** `Promise<PagedResult<Studio>>`

```typescript
import { StudioSort } from "ani-client";

const studios = await client.searchStudios({
  query: "MAPPA",
  sort: [StudioSort.FAVOURITES_DESC],
});
```

---

## Threads

### `getThread(id)`

Fetch a forum thread by its AniList ID.

| Param | Type | Description |
| --- | --- | --- |
| `id` | `number` | AniList thread ID |

**Returns:** `Promise<Thread>`

```typescript
const thread = await client.getThread(12345);
console.log(thread.title, `— ${thread.replyCount} replies`);
```

### `getRecentThreads(options?)`

Get recent forum threads, optionally filtered by search query, media ID, or category.

| Param | Type |
| --- | --- |
| `options` | `SearchThreadOptions` (query?, mediaId?, categoryId?, sort?, page?, perPage?) |

**Returns:** `Promise<PagedResult<Thread>>`

```typescript
import { ThreadSort } from "ani-client";

const threads = await client.getRecentThreads({
  sort: [ThreadSort.REPLIED_AT_DESC],
  perPage: 10,
});

// Filter threads related to a specific anime
const mediaThreads = await client.getRecentThreads({ mediaId: 1, perPage: 5 });
```

---

## Metadata

### `getGenres()`

Get all available genres on AniList.

**Returns:** `Promise<string[]>`

### `getTags()`

Get all available media tags on AniList.

**Returns:** `Promise<MediaTag[]>`

---

## Utilities

### `parseAniListMarkdown(text)`

Parses AniList's custom markdown dialect into standard HTML. Supports spoiler tags, images, webm, youtube, headings, lists, code blocks, and standard formatting. All HTML entities are escaped to prevent XSS attacks.

| Param | Type | Description |
| --- | --- | --- |
| `text` | `string` | AniList markdown string |

**Returns:** `string` (HTML)

```typescript
import { parseAniListMarkdown } from "ani-client";

const html = parseAniListMarkdown("~!Spoiler!~");
```

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

### `cacheStats`

Read-only property with hit/miss/stale counters for the built-in memory cache. Returns `undefined` when a custom `cacheAdapter` is used.

```typescript
console.log(client.cacheStats);
// { hits: 42, misses: 8, stales: 2, hitRate: 0.84 }
```

See [Types → CacheStats](./types#cachestats) for the full shape.

### `clearCache()`

Clear the entire response cache.

**Returns:** `Promise<void>`

### `invalidateCache(pattern)`

Remove cache entries matching a pattern.

- **String**: substring match (e.g. `"Media"` removes all keys containing `"Media"`)
- **RegExp**: tested against each key directly

**Returns:** `Promise<number>` (entries removed)

### `cacheSize()`

Returns the number of entries currently cached. Always returns `Promise<number>` for consistency across sync and async cache adapters.

**Returns:** `Promise<number>`

```typescript
const size = await client.cacheSize();
console.log(`${size} entries cached`);
```

---

## Per-Request AbortSignal

### `withSignal(signal)`

Returns a **lightweight proxy** of the client that forwards every method call through the given `AbortSignal`. Useful when you need per-request cancellation without rebuilding the client.

| Param | Type | Description |
| --- | --- | --- |
| `signal` | `AbortSignal` | Signal to attach to all requests issued via the proxy |

**Returns:** `AniListClient` (proxy)

```typescript
const controller = new AbortController();
const scoped = client.withSignal(controller.signal);

setTimeout(() => controller.abort(), 3_000);

try {
  const anime = await scoped.getMedia(1);
} catch (err) {
  if (err.name === "AbortError") console.log("Cancelled!");
}
```

::: tip
The proxy shares the same cache, rate-limiter, and hooks as the parent client — only the signal differs.
:::

---

## Lifecycle

### `destroy()`

Clean up resources held by the client. Clears the in-memory cache, aborts pending in-flight requests, and cancels all rate-limiter timers to prevent event loop leaks.

```typescript
await client.destroy();
```

::: tip
If using a custom cache adapter (e.g. Redis), call its close/disconnect method separately.
:::

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

### Input Validation

All `get*` methods validate their ID parameter before making any request. Invalid IDs (negative, zero, `NaN`, `Infinity`, non-integer) throw a `RangeError` synchronously:

```typescript
await client.getMedia(-1);    // RangeError: Invalid mediaId: expected a positive integer, got -1
await client.getMedia(NaN);   // RangeError: Invalid mediaId: expected a positive integer, got NaN
await client.getMedia(1);     // OK
```

Batch methods validate all IDs before sending any requests:

```typescript
await client.getMediaBatch([1, -1]); // RangeError — fails fast before any API call
```
