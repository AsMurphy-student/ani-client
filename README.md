# ani-client

[![CI](https://github.com/gonzyui/ani-client/actions/workflows/ci.yml/badge.svg)](https://github.com/gonzyui/ani-client/actions/workflows/ci.yml)
[![npm version](https://img.shields.io/npm/v/ani-client)](https://www.npmjs.com/package/ani-client)
[![npm downloads](https://img.shields.io/npm/dm/ani-client)](https://www.npmjs.com/package/ani-client)
[![codecov](https://codecov.io/gh/gonzyui/ani-client/graph/badge.svg)](https://codecov.io/gh/gonzyui/ani-client)
[![TypeScript](https://img.shields.io/badge/TypeScript-strict-blue)](https://www.typescriptlang.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

> A fully typed, zero-dependency client for the [AniList](https://anilist.co) GraphQL API.

✨ **Showcase**: [See who's using ani-client](https://ani-client.js.org/showcase)

**Support server** [Discord server](https://discord.gg/3P7twDurUD)

## Highlights

- **Zero dependencies** — uses the native `fetch` API
- **Universal** — Node.js ≥ 20, Bun, Deno, and modern browsers
- **Dual format** — ships ESM + CJS with full `.d.ts` declarations
- **LRU cache** with TTL, stale-while-revalidate, and hit/miss stats
- **Rate-limit protection** with exponential backoff, retries, and custom strategies
- **Request deduplication** — concurrent identical queries share a single in-flight request
- **Batch queries** — fetch up to 50 media/characters/staff in one API call
- **Paginated media relationships** — `getMediaCharacters()` and `getMediaStaff()` support paged results for large casts and staff listings
- **Auto-pagination** — async iterator that yields items across pages
- **AbortSignal support** — cancel globally or per-request with `withSignal()`
- **Injectable logger** — plug in `console`, pino, winston, or any compatible logger
- **Redis-ready** — swap the cache adapter with the built-in `RedisCache` for distributed setups

## Install

```bash
npm install ani-client
# or
pnpm add ani-client
# or
yarn add ani-client
```

## Quick start

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

// Cross-platform lookup by MyAnimeList ID
const fma = await client.getMediaByMalId(5114);

// Paginated media relationships
const characters = await client.getMediaCharacters(1, { page: 1, perPage: 25, voiceActors: true });
const staff = await client.getMediaStaff(1, { page: 1, perPage: 25 });
```

## Features at a glance

### Caching & stale-while-revalidate

```ts
const client = new AniListClient({
  cache: {
    ttl: 1000 * 60 * 5,               // 5 min TTL
    maxSize: 200,                      // LRU capacity
    staleWhileRevalidateMs: 60_000,    // serve stale for 1 min after expiry
  },
});

// Check cache performance
console.log(client.cacheStats);
// { hits: 42, misses: 8, stales: 2, hitRate: 0.84 }
```

### Per-request cancellation

```ts
const controller = new AbortController();
const scoped = client.withSignal(controller.signal);

setTimeout(() => controller.abort(), 3_000);
const anime = await scoped.getMedia(1);
```

### Structured logging

```ts
const client = new AniListClient({ logger: console });
// debug: "API request"  { query: "query { Media(id: 1) { ... } }" }
// debug: "Request complete" { durationMs: 120, status: 200 }
```

### Rate limiting & retries

```ts
const client = new AniListClient({
  rateLimit: {
    maxRequests: 85,
    windowMs: 60_000,
    maxRetries: 3,
    retryOnNetworkError: true,
    retryStrategy: (attempt) => (attempt + 1) * 1000, // linear backoff
  },
});

console.log(client.rateLimitInfo);
// { remaining: 82, limit: 85, reset: 1741104000 }
```

### Batch & pagination

```ts
// Fetch 100 anime in 2 API calls (50 per batch)
const batch = await client.getMediaBatch([1, 2, 3, /* ...up to 100 IDs */]);

// Auto-paginate through all results
for await (const anime of client.paginate(
  (page) => client.searchMedia({ query: "Gundam", page, perPage: 50 }),
  5, // max 5 pages
)) {
  console.log(anime.title.romaji);
}
```

### Users, characters, studios & more

```ts
const user = await client.getUser("AniList");
const favs = await client.getUserFavorites("AniList", { perPage: 50 });
const char = await client.getCharacter(1, { voiceActors: true });
const characters = await client.getMediaCharacters(1, { page: 1, perPage: 25, voiceActors: true });
const staff = await client.getMediaStaff(1, { page: 1, perPage: 25 });
const studio = await client.getStudio(21, { media: { perPage: 50 } });
const schedule = await client.getWeeklySchedule();
```

## Documentation

Full API reference, guides (caching, pagination, includes, hooks, etc.) and configuration examples:

**[ani-client.js.org](https://ani-client.js.org)**

## Requirements

| Runtime | Version |
| --- | --- |
| Node.js | ≥ 20 |
| Bun | ≥ 1.0 |
| Deno | ≥ 1.28 |
| Browsers | Any with `fetch` + `AbortController` |

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for development setup, coding standards, and PR guidelines.

## License

[MIT](LICENSE) © gonzyui
