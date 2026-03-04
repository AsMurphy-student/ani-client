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

Hooks provide lifecycle observability for every operation the client performs. Use them for logging, metrics, or debugging.

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

::: info Logger vs Hooks
For structured diagnostic output, consider the `logger` option instead — it accepts any object with `debug`, `info`, `warn`, `error` methods (e.g. `console`, pino, winston). Hooks and logger can be used together.
:::

