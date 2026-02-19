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

### Raw queries

| Method                              | Description                          |
| ----------------------------------- | ------------------------------------ |
| `raw<T>(query, variables?)`         | Execute any GraphQL query            |

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
  PagedResult,
  SearchMediaOptions,
} from "ani-client";
```

## License

[MIT](LICENSE) © gonzyui
