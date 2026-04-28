# ani-client

[![CI](https://github.com/gonzyui/ani-client/actions/workflows/ci.yml/badge.svg)](https://github.com/gonzyui/ani-client/actions/workflows/ci.yml)
[![npm version](https://img.shields.io/npm/v/ani-client)](https://www.npmjs.com/package/ani-client)
[![npm downloads](https://img.shields.io/npm/dm/ani-client)](https://www.npmjs.com/package/ani-client)
[![codecov](https://codecov.io/gh/gonzyui/ani-client/graph/badge.svg)](https://codecov.io/gh/gonzyui/ani-client)
[![TypeScript](https://img.shields.io/badge/TypeScript-strict-blue)](https://www.typescriptlang.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

> A fully typed, zero-dependency client for the [AniList](https://anilist.co) GraphQL API.  
> Supports Node.js, Bun, Deno, and modern browsers.

## Features

- **Zero dependencies** — uses the native `fetch` API
- **Universal** — Node.js ≥ 20, Bun, Deno, and modern browsers
- **Dual format** — ships ESM + CJS with full `.d.ts` declarations
- **LRU cache** with TTL, stale-while-revalidate, and hit/miss stats
- **Rate-limit protection** with exponential backoff, retries, and custom strategies
- **Request deduplication** — concurrent identical queries share a single in-flight request
- **Batch queries** — fetch up to 50 media, characters, or staff in a single API call
- **Auto-pagination** — async iterator that yields items across all pages
- **AbortSignal support** — cancel globally or per-request via `withSignal()`
- **Injectable logger** — plug in `console`, pino, winston, or any compatible logger
- **Redis-ready** — swap the in-memory cache with the built-in `RedisCache` adapter

## Installation

```bash
npm install ani-client
# pnpm
pnpm add ani-client
# yarn
yarn add ani-client
```

## Quick Start

```ts
import { AniListClient, MediaType } from "ani-client";

const client = new AniListClient();

// Fetch an anime by AniList ID
const bebop = await client.getMedia(1);
console.log(bebop.title.romaji); // "Cowboy Bebop"

// Search with filters
const results = await client.searchMedia({
  query: "Naruto",
  type: MediaType.ANIME,
  genres: ["Action"],
  perPage: 10,
});

// Lookup by MyAnimeList ID
const fma = await client.getMediaByMalId(5114);
```

## Usage

### Caching

The client caches every response in memory by default. You can tune TTL, capacity, and enable stale-while-revalidate:

```ts
const client = new AniListClient({
  cache: {
    ttl: 1000 * 60 * 5,            // 5 min TTL
    maxSize: 200,                   // LRU capacity
    staleWhileRevalidateMs: 60_000, // serve stale for 1 min after expiry
  },
});

console.log(client.cacheStats);
// { hits: 42, misses: 8, stales: 2, hitRate: 0.84 }
```

For distributed setups, swap to the built-in Redis adapter:

```ts
import { AniListClient, RedisCache } from "ani-client";
import { createClient } from "redis";

const redis = createClient();
await redis.connect();

const client = new AniListClient({
  cacheAdapter: new RedisCache(redis),
});
```

### Rate Limiting

The client is pre-configured to stay within AniList's 30 req/min limit. You can override the defaults and provide a custom retry strategy:

```ts
const client = new AniListClient({
  rateLimit: {
    maxRequests: 25,
    windowMs: 60_000,
    maxRetries: 3,
    retryOnNetworkError: true,
    retryStrategy: (attempt) => (attempt + 1) * 1000, // linear backoff
  },
});

// Inspect the rate limit state after any request
console.log(client.rateLimitInfo);
// { remaining: 22, limit: 25, reset: 1741104000 }
```

### Batch Requests

Fetch multiple entries in a single API call (chunks of 50):

```ts
const anime = await client.getMediaBatch([1, 5, 6, 20]);
const characters = await client.getCharacterBatch([1, 2, 3]);
const staff = await client.getStaffBatch([95269, 95270]);
```

### Auto-Pagination

Use the built-in async iterator to walk through all pages automatically:

```ts
for await (const anime of client.paginate(
  (page) => client.searchMedia({ query: "Gundam", page, perPage: 50 }),
  5, // max 5 pages
)) {
  console.log(anime.title.romaji);
}
```

### Request Cancellation

Scope any client instance to an `AbortSignal` for per-request cancellation:

```ts
const controller = new AbortController();
const scoped = client.withSignal(controller.signal);

setTimeout(() => controller.abort(), 3_000);
const anime = await scoped.getMedia(1); // cancelled after 3s
```

### Logging

Pass any `console`-compatible logger to trace requests and cache events:

```ts
const client = new AniListClient({ logger: console });
// debug: "API request"    { variables: { id: 1 } }
// debug: "Request complete" { durationMs: 120 }
```

### Media Relationships

Paginated access to a media's characters and staff:

```ts
const characters = await client.getMediaCharacters(1, {
  page: 1,
  perPage: 25,
  voiceActors: true,
});

const staff = await client.getMediaStaff(1, { page: 1, perPage: 25 });
```

### Users, Characters, Studios & More

```ts
const user     = await client.getUser("AniList");
const favs     = await client.getUserFavorites("AniList", { perPage: 50 });
const char     = await client.getCharacter(1, { voiceActors: true });
const studio   = await client.getStudio(21, { media: { perPage: 50 } });
const schedule = await client.getWeeklySchedule();
const review   = await client.getReview(760);
```

### Error Handling

All API errors throw an `AniListError` with a `status` code and the raw GraphQL `errors` array:

```ts
import { AniListError } from "ani-client";

try {
  await client.getMedia(999999999);
} catch (e) {
  if (e instanceof AniListError) {
    console.error(e.message); // "Not Found"
    console.error(e.status);  // 404
    console.error(e.errors);  // raw GraphQL errors array
  }
}
```

### Lifecycle Hooks

Intercept requests, responses, cache events, and errors:

```ts
const client = new AniListClient({
  hooks: {
    onRequest:    (query, variables) => console.log("→", variables),
    onResponse:   (query, durationMs, fromCache) => console.log(`← ${durationMs}ms`),
    onCacheHit:   (key) => console.log("cache hit", key),
    onRateLimit:  (retryAfterMs) => console.warn(`rate limited, retrying in ${retryAfterMs}ms`),
    onError:      (error) => console.error(error.message),
  },
});
```

## Requirements

| Runtime  | Version            |
|----------|--------------------|
| Node.js  | ≥ 20               |
| Bun      | ≥ 1.0              |
| Deno     | ≥ 1.28             |
| Browsers | `fetch` + `AbortController` required |

## Documentation

Full API reference, configuration options, and guides (caching, pagination, hooks, Redis, etc.):

**[ani-client.js.org](https://ani-client.js.org)**

## Community

- 💬 [Discord server](https://discord.gg/3P7twDurUD)
- ✨ [Showcase — see who's using ani-client](https://ani-client.js.org/showcase)

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for development setup, coding standards, and PR guidelines.

## License

[MIT](LICENSE) © [gonzyui](https://github.com/gonzyui)