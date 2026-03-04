---
title: Getting Started
description: "Install ani-client and make your first AniList API request in minutes. Learn how to configure caching, rate limiting, hooks, and request cancellation."
head:
  - - meta
    - property: og:title
      content: Getting Started — ani-client
  - - meta
    - property: og:description
      content: Install ani-client and make your first AniList API request in minutes with full configuration options.
---

# Getting Started

Once you've installed `ani-client`, you can start fetching data from AniList in a few lines.

## Initializing the Client

Instantiate `AniListClient` to start making requests. By default, it uses the AniList GraphQL endpoint with an LRU memory cache.

```typescript
import { AniListClient } from "ani-client";

const client = new AniListClient();
```

## First Request

All public methods return a `Promise`.

```typescript
const bebop = await client.getMedia(1);

console.log(bebop.title.romaji); // "Cowboy Bebop"
```

## Configuration

The client exposes full configuration for caching, rate limiting, hooks, logging, and authentication.

```typescript
import { AniListClient, RedisCache } from "ani-client";

const client = new AniListClient({
  // AniList OAuth Personal Access Token (optional)
  token: "your-token-here",

  cache: {
    ttl: 86_400_000, // 24 hours
    maxSize: 500,    // LRU threshold
    enabled: true,
    staleWhileRevalidateMs: 60_000, // Serve stale for 1 min after TTL
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
  },

  // Structured logger (console, pino, winston, etc.)
  logger: console,

  // Cancel all in-flight requests from this client (optional)
  signal: AbortSignal.timeout(30_000),
});
```

See the [Caching](./caching) or [Rate Limiting](./rate-limiting) docs to learn more about advanced integrations like Redis!

## Request Cancellation

You can pass an `AbortSignal` to cancel all in-flight requests when you no longer need them:

```typescript
const controller = new AbortController();

const client = new AniListClient({ signal: controller.signal });

// Cancel all requests after 5 seconds
setTimeout(() => controller.abort(), 5_000);

try {
  const anime = await client.getMedia(1);
} catch (err) {
  if (err.name === "AbortError") {
    console.log("Request was cancelled!");
  }
}
```

### Per-Request Cancellation

Use `withSignal()` to scope an `AbortSignal` to individual requests without rebuilding the client:

```typescript
const controller = new AbortController();

// All methods called via the proxy use this signal
const scoped = client.withSignal(controller.signal);

setTimeout(() => controller.abort(), 3_000);
const anime = await scoped.getMedia(1);
```

::: tip
You can also use `AbortSignal.timeout(ms)` for a built-in timeout mechanism.
:::
