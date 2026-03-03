---
title: Event Hooks
description: "Monitor every request, cache hit, rate limit, retry, and response with ani-client's lifecycle event hooks for full observability."
head:
  - - meta
    - property: og:title
      content: Event Hooks — ani-client
  - - meta
    - property: og:description
      content: Full lifecycle observability with onRequest, onResponse, onCacheHit, onRateLimit, and onRetry hooks.
---

# Event Hooks

Hooks allow your environment completely transparent visibility lifecycle tracking into operations that `ani-client` is firing quietly in the background!

Pass standard logger overrides into `hooks`.

```typescript
const client = new AniListClient({
  hooks: {
    onRequest:   (query, variables) => console.log("→", query.slice(0, 40)),
    
    onResponse:  (query, durationMs, fromCache) => console.log(`← ${durationMs}ms (cache: ${fromCache})`),
    
    onCacheHit:  (key) => console.log("Cache hit:", key.slice(0, 30)),
    
    onRateLimit: (retryAfterMs) => console.warn(`Rate limited, waiting ${retryAfterMs}ms`),
    
    onRetry:     (attempt, reason, delayMs) => console.warn(`Retry #${attempt}: ${reason}`),

    onError:     (error, query, variables) => console.error(`Request failed: ${error.message}`),
  },
});
```

::: tip onError
The `onError` hook fires on **both** network errors and API errors (4xx/5xx), giving you a single place to handle all failures without wrapping every call in try/catch.
:::

