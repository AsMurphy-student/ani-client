# ani-client

> A simple, typed client to fetch anime, manga, character, staff and user data from [AniList](https://anilist.co).

Works in **Node.js ≥ 18**, **Bun**, **Deno** and modern **browsers** — anywhere the `fetch` API is available.  
Ships ESM + CJS bundles with full **TypeScript** declarations.

## Install

```bash
# npm
npm install ani-client

# pnpm
pnpm add ani-client

# yarn
yarn add ani-client
```

## Quick start

```ts
import { AniListClient, MediaType } from "ani-client";

const client = new AniListClient();

// Get an anime by ID
const cowboyBebop = await client.getMedia(1);
console.log(cowboyBebop.title.romaji); // "Cowboy Bebop"

// Search for anime
const results = await client.searchMedia({
  query: "Naruto",
  type: MediaType.ANIME,
  perPage: 5,
});
console.log(results.results.map((m) => m.title.english));

// Trending anime
const trending = await client.getTrending(MediaType.ANIME);
console.log(trending.results[0].title.romaji);
```

### CommonJS

```js
const { AniListClient } = require("ani-client");

const client = new AniListClient();
client.getMedia(1).then((anime) => console.log(anime.title.romaji));
```

## API

### `new AniListClient(options?)`

| Option      | Type     | Default                          | Description                        |
| ----------- | -------- | -------------------------------- | ---------------------------------- |
| `token`     | `string` | —                                | AniList OAuth bearer token         |
| `apiUrl`    | `string` | `https://graphql.anilist.co`     | Custom API endpoint                |
| `cache`     | `object` | `{ ttl: 86400000, maxSize: 500, enabled: true }` | Cache configuration |
| `rateLimit` | `object` | `{ maxRequests: 85, windowMs: 60000, maxRetries: 3, enabled: true }` | Rate limiter configuration |

### Media

| Method                              | Description                          |
| ----------------------------------- | ------------------------------------ |
| `getMedia(id: number)`              | Fetch a single anime / manga by ID   |
| `searchMedia(options?)`             | Search & filter anime / manga        |
| `getTrending(type?, page?, perPage?)` | Get currently trending entries      |
| `getMediaBySeason(options)`         | Get all anime/manga for a given season & year |
| `getRecommendations(mediaId, options?)` | Get user recommendations for a media |

### Characters

| Method                              | Description                          |
| ----------------------------------- | ------------------------------------ |
| `getCharacter(id: number)`          | Fetch a character by ID              |
| `searchCharacters(options?)`        | Search characters by name            |

### Staff

| Method                              | Description                          |
| ----------------------------------- | ------------------------------------ |
| `getStaff(id: number)`              | Fetch a staff member by ID           |
| `searchStaff(options?)`             | Search for staff members             |

### Users

| Method                              | Description                          |
| ----------------------------------- | ------------------------------------ |
| `getUser(id: number)`               | Fetch a user by ID                   |
| `getUserByName(name: string)`       | Fetch a user by username             |
| `getUserMediaList(options)`         | Get a user's anime or manga list     |

### Airing, Chapters & Planning

| Method                              | Description                          |
| ----------------------------------- | ------------------------------------ |
| `getAiredEpisodes(options?)`        | Recently aired anime episodes (last 24 h by default) |
| `getAiredChapters(options?)`        | Recently updated releasing manga     |
| `getPlanning(options?)`             | Upcoming not-yet-released anime / manga |

### Studios

| Method                              | Description                          |
| ----------------------------------- | ------------------------------------ |
| `getStudio(id: number)`             | Fetch a studio by ID                 |
| `searchStudios(options?)`           | Search studios by name               |

### Genres & Tags

| Method                              | Description                          |
| ----------------------------------- | ------------------------------------ |
| `getGenres()`                       | List all available genres            |
| `getTags()`                         | List all available media tags        |

### Raw queries

| Method                              | Description                          |
| ----------------------------------- | ------------------------------------ |
| `raw<T>(query, variables?)`         | Execute any GraphQL query            |

### Pagination helper

| Method                              | Description                          |
| ----------------------------------- | ------------------------------------ |
| `paginate<T>(fetchPage, maxPages?)` | Auto-paginating async iterator       |

### Cache management

| Method / Property                   | Description                          |
| ----------------------------------- | ------------------------------------ |
| `clearCache()`                      | Clear the entire response cache      |
| `cacheSize`                         | Number of entries currently cached   |

## Caching

All responses are cached in-memory by default (**24 hours TTL**, max 500 entries). Configure it per-client:

```ts
const client = new AniListClient({
  cache: {
    ttl: 1000 * 60 * 60,  // 1 hour
    maxSize: 200,          // keep at most 200 entries
    enabled: true,         // set to false to disable
  },
});

// Manual cache control
client.clearCache();
console.log(client.cacheSize); // 0
```

## Rate limiting

The client automatically respects AniList's rate limit (90 req/min) with a conservative default of **85 req/min**. If you hit a `429 Too Many Requests`, it retries automatically (up to 3 times with backoff).

```ts
const client = new AniListClient({
  rateLimit: {
    maxRequests: 60,       // be extra conservative
    windowMs: 60_000,      // 1 minute window
    maxRetries: 5,         // retry up to 5 times on 429
    retryDelayMs: 3000,    // wait 3s between retries
    enabled: true,         // set to false to disable
  },
});
```

## Airing, Chapters & Planning

Fetch recently released content or see what's coming up next.

### `getAiredEpisodes(options?)`

Returns anime episodes that recently aired (defaults to the **last 24 hours**).

| Option            | Type           | Default              | Description                                  |
| ----------------- | -------------- | -------------------- | -------------------------------------------- |
| `airingAtGreater` | `number`       | `now - 24h` (UNIX)  | Only episodes aired after this timestamp     |
| `airingAtLesser`  | `number`       | `now` (UNIX)         | Only episodes aired before this timestamp    |
| `sort`            | `AiringSort[]` | `["TIME_DESC"]`      | Sort order                                   |
| `page`            | `number`       | `1`                  | Page number                                  |
| `perPage`         | `number`       | `20`                 | Results per page (max 50)                    |

```ts
import { AniListClient } from "ani-client";

const client = new AniListClient();

// Episodes aired in the last 24 hours
const recent = await client.getAiredEpisodes();
recent.results.forEach((ep) =>
  console.log(`${ep.media.title.romaji} — Episode ${ep.episode}`)
);

// Episodes aired in the last 7 days
const week = await client.getAiredEpisodes({
  airingAtGreater: Math.floor(Date.now() / 1000) - 7 * 24 * 3600,
  perPage: 50,
});
```

### `getAiredChapters(options?)`

Returns currently releasing manga, sorted by most recently updated — the closest proxy to "recently released chapters" (AniList does not expose individual chapter schedules).

| Option    | Type     | Default | Description             |
| --------- | -------- | ------- | ----------------------- |
| `page`    | `number` | `1`     | Page number             |
| `perPage` | `number` | `20`    | Results per page (max 50) |

```ts
const chapters = await client.getAiredChapters({ perPage: 10 });
chapters.results.forEach((m) =>
  console.log(`${m.title.romaji} — ${m.chapters ?? "?"} chapters`)
);
```

### `getPlanning(options?)`

Returns anime and/or manga that are **not yet released**, sorted by popularity.

| Option    | Type          | Default              | Description                        |
| --------- | ------------- | -------------------- | ---------------------------------- |
| `type`    | `MediaType`   | —                    | Filter by ANIME or MANGA (both if omitted) |
| `sort`    | `MediaSort[]` | `["POPULARITY_DESC"]` | Sort order                        |
| `page`    | `number`      | `1`                  | Page number                        |
| `perPage` | `number`      | `20`                 | Results per page (max 50)          |

```ts
import { MediaType } from "ani-client";

// Most anticipated upcoming anime
const upcoming = await client.getPlanning({ type: MediaType.ANIME, perPage: 10 });
upcoming.results.forEach((m) => console.log(m.title.romaji));

// All upcoming media (anime + manga)
const all = await client.getPlanning();
```

## Season charts

Fetch all anime (or manga) for a specific season and year.

### `getMediaBySeason(options)`

| Option       | Type           | Default              | Description                              |
| ------------ | -------------- | -------------------- | ---------------------------------------- |
| `season`     | `MediaSeason`  | **(required)**       | WINTER, SPRING, SUMMER, or FALL          |
| `seasonYear` | `number`       | **(required)**       | The year (e.g. 2026)                     |
| `type`       | `MediaType`    | `ANIME`              | Filter by ANIME or MANGA                 |
| `sort`       | `MediaSort[]`  | `["POPULARITY_DESC"]`| Sort order                               |
| `page`       | `number`       | `1`                  | Page number                              |
| `perPage`    | `number`       | `20`                 | Results per page (max 50)                |

```ts
import { AniListClient, MediaSeason } from "ani-client";

const client = new AniListClient();

// All anime from Winter 2026
const winter2026 = await client.getMediaBySeason({
  season: MediaSeason.WINTER,
  seasonYear: 2026,
  perPage: 25,
});
winter2026.results.forEach((m) => console.log(m.title.romaji));

// Spring 2025 manga
const spring = await client.getMediaBySeason({
  season: MediaSeason.SPRING,
  seasonYear: 2025,
  type: MediaType.MANGA,
});
```

## User media lists

Fetch a user's anime or manga list, optionally filtered by status.

### `getUserMediaList(options)`

| Option     | Type              | Default              | Description                                |
| ---------- | ----------------- | -------------------- | ------------------------------------------ |
| `userId`   | `number`          | —                    | User ID (provide userId **or** userName)   |
| `userName` | `string`          | —                    | Username (provide userId **or** userName)  |
| `type`     | `MediaType`       | **(required)**       | ANIME or MANGA                             |
| `status`   | `MediaListStatus` | —                    | Filter: CURRENT, COMPLETED, PLANNING, etc. |
| `sort`     | `MediaListSort[]` | —                    | Sort order                                 |
| `page`     | `number`          | `1`                  | Page number                                |
| `perPage`  | `number`          | `20`                 | Results per page (max 50)                  |

```ts
import { AniListClient, MediaType, MediaListStatus } from "ani-client";

const client = new AniListClient();

// All anime on a user's list
const list = await client.getUserMediaList({
  userName: "AniList",
  type: MediaType.ANIME,
  perPage: 10,
});
list.results.forEach((entry) =>
  console.log(`${entry.media.title.romaji} — ${entry.score}/100`)
);

// Only completed anime
const completed = await client.getUserMediaList({
  userName: "AniList",
  type: MediaType.ANIME,
  status: MediaListStatus.COMPLETED,
});

// By user ID
const byId = await client.getUserMediaList({
  userId: 1,
  type: MediaType.MANGA,
});
```

## Recommendations

Get user-submitted recommendations for a specific anime or manga.

### `getRecommendations(mediaId, options?)`

| Option    | Type                   | Default            | Description             |
| --------- | ---------------------- | ------------------ | ----------------------- |
| `sort`    | `RecommendationSort[]` | `["RATING_DESC"]`  | Sort order              |
| `page`    | `number`               | `1`                | Page number             |
| `perPage` | `number`               | `20`               | Results per page        |

```ts
import { AniListClient } from "ani-client";

const client = new AniListClient();

// Recommendations for Cowboy Bebop
const recs = await client.getRecommendations(1);
recs.results.forEach((r) =>
  console.log(`${r.mediaRecommendation.title.romaji} (rating: ${r.rating})`)
);

// With pagination
const page2 = await client.getRecommendations(20, { page: 2, perPage: 10 });
```

## Relations

All media objects now include a `relations` field with sequels, prequels, spin-offs, etc.

```ts
const anime = await client.getMedia(1); // Cowboy Bebop
anime.relations?.edges.forEach((edge) =>
  console.log(`${edge.relationType}: ${edge.node.title.romaji}`)
);
// SIDE_STORY: Cowboy Bebop: Tengoku no Tobira
```

Available relation types: `ADAPTATION`, `PREQUEL`, `SEQUEL`, `PARENT`, `SIDE_STORY`, `CHARACTER`, `SUMMARY`, `ALTERNATIVE`, `SPIN_OFF`, `OTHER`, `SOURCE`, `COMPILATION`, `CONTAINS`.

## Studios

Fetch or search for animation studios.

### `getStudio(id)`

Returns the studio with its most popular productions.

```ts
const studio = await client.getStudio(44); // Bones
console.log(studio.name); // "Bones"
console.log(studio.isAnimationStudio); // true
studio.media?.nodes.forEach((m) => console.log(m.title.romaji));
```

### `searchStudios(options?)`

| Option    | Type     | Default | Description             |
| --------- | -------- | ------- | ----------------------- |
| `query`   | `string` | —       | Search term             |
| `page`    | `number` | `1`     | Page number             |
| `perPage` | `number` | `20`    | Results per page        |

```ts
const result = await client.searchStudios({ query: "MAPPA" });
result.results.forEach((s) => console.log(s.name));
```

## Genres & Tags

List all genres and tags available on AniList.

```ts
const genres = await client.getGenres();
console.log(genres); // ["Action", "Adventure", "Comedy", ...]

const tags = await client.getTags();
tags.forEach((t) => console.log(`${t.name} (${t.category})`));
```

## Auto-pagination

Use `paginate()` to iterate across all pages automatically with an async iterator.

```ts
// Iterate over all search results
for await (const anime of client.paginate((page) =>
  client.searchMedia({ query: "Gundam", page, perPage: 10 })
)) {
  console.log(anime.title.romaji);
}

// Limit to 3 pages max
for await (const anime of client.paginate(
  (page) => client.getTrending(MediaType.ANIME, page, 20),
  3,
)) {
  console.log(anime.title.romaji);
}
```

## Error handling

All API errors throw an `AniListError` with:

- `message` — Human-readable error message
- `status` — HTTP status code
- `errors` — Raw error array from the API

```ts
import { AniListClient, AniListError } from "ani-client";

try {
  await client.getMedia(999999999);
} catch (err) {
  if (err instanceof AniListError) {
    console.error(err.message, err.status);
  }
}
```

## Types

All types are exported and documented:

```ts
import type {
  Media,
  Character,
  Staff,
  User,
  AiringSchedule,
  MediaListEntry,
  Recommendation,
  StudioDetail,
  MediaEdge,
  MediaConnection,
  PagedResult,
  SearchMediaOptions,
  SearchStudioOptions,
  GetAiringOptions,
  GetRecentChaptersOptions,
  GetPlanningOptions,
  GetSeasonOptions,
  GetUserMediaListOptions,
  GetRecommendationsOptions,
} from "ani-client";
```

## License

[MIT](LICENSE) © gonzyui
