# Getting Started

Once you've installed `ani-client`, fetching data from AniList is simpler than ever! Let's get right into it by creating an instance.

## Initializing the Client

You need to instantiate the `AniListClient`. By default, it hits the AniList GraphQL endpoint securely and caches requests using a localized LRU memory algorithm.

```typescript
import { AniListClient } from "ani-client";

// The client is ready!
const client = new AniListClient();
```

## First Request

`ani-client` is entirely asynchronous wrapper built over `fetch`, meaning every public-facing module returns a `Promise`.

```typescript
// Fetch Cowboy Bebop data (id: 1)
const bebop = await client.getMedia(1);

console.log(bebop.title.romaji); // Output: "Cowboy Bebop"
```

## Configuring Options

While defaults are configured conservatively for optimal public AniList consumption, the client exposes full configuration across its Caching, Rate-Limiting, Event hooks & Authentication capabilities.

```typescript
import { AniListClient, RedisCache } from "ani-client";

const client = new AniListClient({
  // AniList OAuth Personal Access Token (optional)
  token: "your-token-here",

  cache: {
    ttl: 86_400_000, // 24 hours
    maxSize: 500,    // LRU threshold
    enabled: true,
  },

  rateLimit: {
    maxRequests: 85,          // Per window
    windowMs: 60_000,         // 1 minute
    maxRetries: 3,            // Handles 429 transparently 
    retryOnNetworkError: true // ECONNRESET / ETIMEDOUT
  },

  hooks: {
    onRequest: (query, variables) => console.log('Firing request!'),
    onRateLimit: (retryAfterMs) => console.warn(`Hold on, wait ${retryAfterMs}ms`),
  }
});
```

See the [Caching](./caching) or [Rate Limiting](./rate-limiting) docs to learn more about advanced integrations like Redis!
