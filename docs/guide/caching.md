---
title: Caching
description: "Configure in-memory LRU caching or plug in a Redis adapter for distributed caching. Supports pattern-based invalidation and TTL control."
head:
  - - meta
    - property: og:title
      content: Caching — ani-client
  - - meta
    - property: og:description
      content: Built-in LRU memory cache and Redis adapter for distributed caching with ani-client.
---

# Caching

`ani-client` includes a built-in cache layer to reduce network latency and avoid redundant API calls.

## Memory Cache (Default)

The default in-memory cache uses **LRU eviction**. It automatically evicts the least-recently-used entries to keep memory usage under control.

```typescript
const client = new AniListClient({
  cache: {
    ttl: 1000 * 60 * 60, // 1 hour (Default: 24h)
    maxSize: 200,        // 200 threshold capacity (Default: 500)
    enabled: true,       // set to false to bypass
  },
});
```

### Stale-While-Revalidate

Enable `staleWhileRevalidateMs` to keep serving cached data for a grace period after TTL expires while the entry is refreshed in the background. This eliminates cold-cache latency spikes for frequently accessed queries.

```typescript
const client = new AniListClient({
  cache: {
    ttl: 1000 * 60 * 5,                // 5 min TTL
    staleWhileRevalidateMs: 1000 * 60,  // serve stale for 1 extra min
  },
});
```

### Cache Statistics

The built-in memory cache tracks hit/miss/stale counters. Access them via the `cacheStats` property:

```typescript
const stats = client.cacheStats;
console.log(stats);
// { hits: 42, misses: 8, stales: 2, hitRate: 0.84 }
```

::: tip
`cacheStats` is only available with the default memory cache — it returns `undefined` when using a custom `cacheAdapter`.
:::

## Redis Cache

For distributed servers or persistent edge setups spanning several environments, inject the `RedisCache` adapter. Compatible thoroughly with [ioredis](https://github.com/redis/ioredis) or [node-redis](https://github.com/redis/node-redis).

```typescript
import Redis from "ioredis";
import { AniListClient, RedisCache } from "ani-client";

const client = new AniListClient({
  cacheAdapter: new RedisCache({
    client: new Redis(),
    prefix: "ani:",    // Keys formatted as `ani:${hash}`
    ttl: 86_400,       // Seconds caching bounds
  }),
});
```

## Invalidation

Remove specific cache entries when data needs to be refreshed.

```typescript
// Nuke the entire bucket
await client.clearCache();

// Substring match — removes all keys containing "Media"
const deletedMatches = await client.invalidateCache("Media");

// RegExp match — more precise control
const deletedRegex = await client.invalidateCache(/getMedia\|.*id.*1/);

// Poll remaining nodes
console.log(await client.cacheSize());
```

::: tip
**String patterns** use substring matching (e.g. `"Media"` matches all keys containing `"Media"`).  
**RegExp patterns** are tested against each key directly for precise control.
:::

## Cleanup

When you're done with the client, call `destroy()` to clear the cache and release in-flight request references:

```typescript
await client.destroy();
```

::: warning
If using a custom cache adapter (e.g. Redis), you must close/disconnect it separately.
:::
