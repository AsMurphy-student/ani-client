# ani-client

[![CI](https://github.com/gonzyui/ani-client/actions/workflows/ci.yml/badge.svg)](https://github.com/gonzyui/ani-client/actions/workflows/ci.yml)
[![npm](https://img.shields.io/npm/v/ani-client)](https://www.npmjs.com/package/ani-client)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

> A simple, typed client to fetch anime, manga, character, staff and user data from [AniList](https://anilist.co).

- **Zero dependencies** — uses the native `fetch` API
- **Universal** — Node.js ≥ 20, Bun, Deno and modern browsers
- **Dual format** — ships ESM + CJS with full TypeScript declarations
- **Built-in caching** — in-memory LRU with optional Redis adapter
- **Rate-limit aware** — auto-retry on 429, configurable timeout & network error retry
- **Request deduplication** — identical in-flight requests are coalesced
- **Event hooks** — observe every request, cache hit, retry and response
- **Batch queries** — fetch multiple IDs in a single GraphQL call

## Table of contents

- [Install](#install)
- [Quick start](#quick-start)
- [Client options](#client-options)
- [API reference](#api-reference)
  - [Media](#media)
  - [Include options](#include-options)
  - [Characters](#characters)
  - [Staff](#staff)
  - [Users](#users)
  - [Airing, Chapters & Planning](#airing-chapters--planning)
  - [Season charts](#season-charts)
  - [User media lists](#user-media-lists)
  - [Recommendations](#recommendations)
  - [Relations](#relations)
  - [Studios](#studios)
  - [Genres & Tags](#genres--tags)
  - [Batch queries](#batch-queries)
  - [Raw queries](#raw-queries)
  - [Auto-pagination](#auto-pagination)
- [Caching](#caching)
  - [Memory cache](#memory-cache)
  - [Redis cache](#redis-cache)
  - [Custom adapter](#custom-adapter)
  - [Cache invalidation](#cache-invalidation)
- [Rate limiting](#rate-limiting)
- [Request deduplication](#request-deduplication)
- [Event hooks](#event-hooks)
- [Error handling](#error-handling)
- [Types](#types)
- [Contributing](#contributing)
- [License](#license)

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

<details>
<summary>CommonJS</summary>

```js
const { AniListClient } = require("ani-client");

const client = new AniListClient();
client.getMedia(1).then((anime) => console.log(anime.title.romaji));
```

</details>

## Client options

```ts
const client = new AniListClient({
  // AniList OAuth bearer token (optional)
  token: "your-token",

  // Custom API endpoint
  apiUrl: "https://graphql.anilist.co",

  // In-memory cache settings
  cache: {
    ttl: 86_400_000,   // 24 hours (ms)
    maxSize: 500,       // max entries (LRU eviction)
    enabled: true,
  },

  // Or bring your own adapter (takes precedence over `cache`)
  cacheAdapter: new RedisCache({ client: redisClient }),

  // Rate limiter
  rateLimit: {
    maxRequests: 85,          // per window (AniList allows 90)
    windowMs: 60_000,         // 1 minute
    maxRetries: 3,            // retries on 429
    retryDelayMs: 2_000,      // delay between retries
    timeoutMs: 30_000,        // per-request timeout (0 = none)
    retryOnNetworkError: true, // retry ECONNRESET, ETIMEDOUT, etc.
    enabled: true,
  },

  // Event hooks
  hooks: {
    onRequest:   (query, variables) => {},
    onResponse:  (query, durationMs, fromCache) => {},
    onCacheHit:  (key) => {},
    onRateLimit: (retryAfterMs) => {},
    onRetry:     (attempt, reason, delayMs) => {},
  },
});
```

## API reference

### Media

| Method | Description |
| --- | --- |
| `getMedia(id, include?)` | Fetch a single anime / manga by ID with optional extra data |
| `searchMedia(options?)` | Search & filter anime / manga |
| `getTrending(type?, page?, perPage?)` | Currently trending entries |
| `getMediaBySeason(options)` | Anime/manga for a given season & year |
| `getRecommendations(mediaId, options?)` | User recommendations for a media |

```ts
// Simple — same as before
const anime = await client.getMedia(1);

// With extra data
const anime = await client.getMedia(1, {
  characters: { perPage: 25, sort: true },
  staff: true,
  relations: true,
  streamingEpisodes: true,
  externalLinks: true,
  stats: true,
  recommendations: { perPage: 5 },
});

const results = await client.searchMedia({
  query: "Naruto",
  type: MediaType.ANIME,
  format: MediaFormat.TV,
  genre: "Action",
  perPage: 10,
});
```

### Include options

The second parameter of `getMedia()` lets you opt-in to additional data. By default, only `relations` are included for backward compatibility.

| Option | Type | Default | Description |
| --- | --- | --- | --- |
| `characters` | `boolean \| { perPage?, sort? }` | — | Characters with their roles (MAIN, SUPPORTING, BACKGROUND) |
| `staff` | `boolean \| { perPage?, sort? }` | — | Staff members with their roles |
| `relations` | `boolean` | `true` | Sequels, prequels, adaptations, etc. Set `false` to exclude |
| `streamingEpisodes` | `boolean` | — | Streaming links (Crunchyroll, Funimation, etc.) |
| `externalLinks` | `boolean` | — | External links (MAL, official site, etc.) |
| `stats` | `boolean` | — | Score & status distribution |
| `recommendations` | `boolean \| { perPage? }` | — | User recommendations |

```ts
// Include characters sorted by role (25 per page by default)
const anime = await client.getMedia(1, { characters: true });
anime.characters?.edges.forEach((e) =>
  console.log(`${e.node.name.full} (${e.role})`)
);

// 50 characters, no sorting
const anime = await client.getMedia(1, {
  characters: { perPage: 50, sort: false },
});

// Staff members
const anime = await client.getMedia(1, { staff: true });
anime.staff?.edges.forEach((e) =>
  console.log(`${e.node.name.full} — ${e.role}`)
);

// Everything at once
const anime = await client.getMedia(1, {
  characters: { perPage: 50 },
  staff: { perPage: 25 },
  relations: true,
  streamingEpisodes: true,
  externalLinks: true,
  stats: true,
  recommendations: { perPage: 10 },
});

// Lightweight — exclude relations
const anime = await client.getMedia(1, {
  characters: true,
  relations: false,
});
```

### Characters

| Method | Description |
| --- | --- |
| `getCharacter(id)` | Fetch a character by ID |
| `searchCharacters(options?)` | Search characters by name |

```ts
const spike = await client.getCharacter(1);
const results = await client.searchCharacters({ query: "Luffy", perPage: 5 });
```

### Staff

| Method | Description |
| --- | --- |
| `getStaff(id)` | Fetch a staff member by ID |
| `searchStaff(options?)` | Search for staff members |

```ts
const staff = await client.getStaff(95001);
const results = await client.searchStaff({ query: "Miyazaki" });
```

### Users

| Method | Description |
| --- | --- |
| `getUser(id)` | Fetch a user by ID |
| `getUserByName(name)` | Fetch a user by username |
| `getUserMediaList(options)` | Get a user's anime or manga list |

### Airing, Chapters & Planning

| Method | Description |
| --- | --- |
| `getAiredEpisodes(options?)` | Recently aired anime episodes (last 24 h by default) |
| `getAiredChapters(options?)` | Recently updated releasing manga |
| `getPlanning(options?)` | Upcoming not-yet-released anime / manga |

```ts
// Episodes aired in the last 7 days
const week = await client.getAiredEpisodes({
  airingAtGreater: Math.floor(Date.now() / 1000) - 7 * 24 * 3600,
  perPage: 50,
});

// Most anticipated upcoming anime
const upcoming = await client.getPlanning({
  type: MediaType.ANIME,
  perPage: 10,
});
```

### Season charts

```ts
import { MediaSeason } from "ani-client";

const winter2026 = await client.getMediaBySeason({
  season: MediaSeason.WINTER,
  seasonYear: 2026,
  perPage: 25,
});
```

| Option | Type | Default | Description |
| --- | --- | --- | --- |
| `season` | `MediaSeason` | **(required)** | WINTER, SPRING, SUMMER, or FALL |
| `seasonYear` | `number` | **(required)** | The year |
| `type` | `MediaType` | `ANIME` | Filter by ANIME or MANGA |
| `sort` | `MediaSort[]` | `["POPULARITY_DESC"]` | Sort order |
| `page` | `number` | `1` | Page number |
| `perPage` | `number` | `20` | Results per page (max 50) |

### User media lists

```ts
import { MediaType, MediaListStatus } from "ani-client";

const list = await client.getUserMediaList({
  userName: "AniList",
  type: MediaType.ANIME,
  status: MediaListStatus.COMPLETED,
});
list.results.forEach((entry) =>
  console.log(`${entry.media.title.romaji} — ${entry.score}/100`)
);
```

Provide either `userId` or `userName`. The `type` field is required.

### Recommendations

```ts
const recs = await client.getRecommendations(1); // Cowboy Bebop
recs.results.forEach((r) =>
  console.log(`${r.mediaRecommendation.title.romaji} (rating: ${r.rating})`)
);
```

### Relations

Relations (sequels, prequels, spin-offs, etc.) are included by default when using `getMedia()`. You can also explicitly request them via the `include` parameter, or exclude them with `relations: false`.

```ts
const anime = await client.getMedia(1);
anime.relations?.edges.forEach((edge) =>
  console.log(`${edge.relationType}: ${edge.node.title.romaji}`)
);

// Exclude relations for a lighter response
const anime = await client.getMedia(1, { relations: false });
```

Available types: `ADAPTATION`, `PREQUEL`, `SEQUEL`, `PARENT`, `SIDE_STORY`, `CHARACTER`, `SUMMARY`, `ALTERNATIVE`, `SPIN_OFF`, `OTHER`, `SOURCE`, `COMPILATION`, `CONTAINS`.

### Studios

| Method | Description |
| --- | --- |
| `getStudio(id)` | Fetch a studio with its productions |
| `searchStudios(options?)` | Search studios by name |

```ts
const studio = await client.getStudio(44); // Bones
const results = await client.searchStudios({ query: "MAPPA" });
```

### Genres & Tags

```ts
const genres = await client.getGenres();
// ["Action", "Adventure", "Comedy", ...]

const tags = await client.getTags();
// [{ id, name, description, category, isAdult }, ...]
```

### Batch queries

Fetch multiple IDs in a single GraphQL request (up to 50 per call, auto-chunked).

| Method | Description |
| --- | --- |
| `getMediaBatch(ids)` | Fetch multiple anime / manga |
| `getCharacterBatch(ids)` | Fetch multiple characters |
| `getStaffBatch(ids)` | Fetch multiple staff members |

```ts
const [bebop, naruto, aot] = await client.getMediaBatch([1, 20, 16498]);
```

### Raw queries

Execute any GraphQL query against the AniList API.

```ts
const data = await client.raw<{ Media: { id: number; title: { romaji: string } } }>(
  "query { Media(id: 1) { id title { romaji } } }",
);
```

### Auto-pagination

`paginate()` returns an async iterator that fetches pages on demand.

```ts
for await (const anime of client.paginate(
  (page) => client.searchMedia({ query: "Gundam", page, perPage: 10 }),
  3, // max 3 pages
)) {
  console.log(anime.title.romaji);
}
```

## Caching

### Memory cache

The default in-memory cache uses **LRU eviction** (24 h TTL, 500 entries max).

```ts
const client = new AniListClient({
  cache: {
    ttl: 1000 * 60 * 60, // 1 hour
    maxSize: 200,
    enabled: true,        // false to disable
  },
});
```

### Redis cache

For distributed or persistent caching, use the built-in Redis adapter. Compatible with [ioredis](https://github.com/redis/ioredis) and [node-redis](https://github.com/redis/node-redis) v4+.

```ts
import Redis from "ioredis";
import { AniListClient, RedisCache } from "ani-client";

const client = new AniListClient({
  cacheAdapter: new RedisCache({
    client: new Redis(),
    prefix: "ani:",    // key prefix (default)
    ttl: 86_400,       // seconds (default: 24 h)
  }),
});
```

### Custom adapter

Implement the `CacheAdapter` interface to bring your own storage:

```ts
import type { CacheAdapter } from "ani-client";

class MyCache implements CacheAdapter {
  get<T>(key: string): T | undefined | Promise<T | undefined> { /* ... */ }
  set<T>(key: string, data: T): void | Promise<void> { /* ... */ }
  delete(key: string): boolean | Promise<boolean> { /* ... */ }
  clear(): void | Promise<void> { /* ... */ }
  get size(): number { return -1; } // return -1 if unknown
  keys(): string[] | Promise<string[]> { /* ... */ }
  // Optional — the client provides a fallback if omitted
  invalidate?(pattern: string | RegExp): number | Promise<number> { /* ... */ }
}
```

### Cache invalidation

```ts
// Clear everything
await client.clearCache();

// Remove entries matching a pattern
const removed = await client.invalidateCache(/Media/);
console.log(`Removed ${removed} entries`);

// Current cache size
console.log(client.cacheSize);
```

## Rate limiting

The client respects AniList's rate limit (90 req/min) with a conservative default of **85 req/min**. On HTTP 429, it retries automatically with progressive backoff.

```ts
const client = new AniListClient({
  rateLimit: {
    maxRequests: 60,
    windowMs: 60_000,
    maxRetries: 5,
    retryDelayMs: 3_000,
    timeoutMs: 30_000,        // abort after 30 s
    retryOnNetworkError: true, // retry ECONNRESET, ETIMEDOUT, etc.
    enabled: true,
  },
});
```

## Request deduplication

When multiple callers request the same data at the same time, only one API call is made. All callers receive the same response.

```ts
// Only 1 HTTP request is sent
const [a, b] = await Promise.all([
  client.getMedia(1),
  client.getMedia(1),
]);
```

## Event hooks

Monitor every request lifecycle event for logging, metrics, or debugging.

```ts
const client = new AniListClient({
  hooks: {
    onRequest:   (query, variables) => console.log("→", query.slice(0, 40)),
    onResponse:  (query, durationMs, fromCache) => console.log(`← ${durationMs}ms (cache: ${fromCache})`),
    onCacheHit:  (key) => console.log("Cache hit:", key.slice(0, 30)),
    onRateLimit: (retryAfterMs) => console.warn(`Rate limited, waiting ${retryAfterMs}ms`),
    onRetry:     (attempt, reason, delayMs) => console.warn(`Retry #${attempt}: ${reason}`),
  },
});
```

## Error handling

All API errors throw an `AniListError` with `message`, `status` and `errors`:

```ts
import { AniListError } from "ani-client";

try {
  await client.getMedia(999999999);
} catch (err) {
  if (err instanceof AniListError) {
    console.error(err.message); // "Not Found."
    console.error(err.status);  // 404
    console.error(err.errors);  // raw API error array
  }
}
```

## Types

All types and enums are exported:

```ts
import type {
  Media, Character, Staff, User,
  AiringSchedule, MediaListEntry, Recommendation, StudioDetail,
  MediaEdge, MediaConnection, MediaCharacterEdge, MediaCharacterConnection,
  MediaStaffEdge, MediaStaffConnection, MediaIncludeOptions,
  StreamingEpisode, ExternalLink, MediaStats, MediaRecommendationNode,
  PageInfo, PagedResult,
  CacheAdapter, AniListHooks, AniListClientOptions,
  SearchMediaOptions, SearchCharacterOptions, SearchStaffOptions,
  SearchStudioOptions, GetAiringOptions, GetRecentChaptersOptions,
  GetPlanningOptions, GetSeasonOptions, GetUserMediaListOptions,
  GetRecommendationsOptions,
} from "ani-client";

import {
  MediaType, MediaFormat, MediaStatus, MediaSeason, MediaSort,
  CharacterSort, CharacterRole, AiringSort, RecommendationSort,
  MediaRelationType, MediaListStatus, MediaListSort,
} from "ani-client";
```

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for development setup, coding standards, and how to submit changes.

## License

[MIT](LICENSE) © gonzyui
