# Caching

`ani-client` ships with caching strategies designed to aggressively cut network latency and enforce duplicate request pooling.

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

Triggering targeted evictions directly skips memory lifecycle polling when data needs forced rehydration.

```typescript
// Nuke the entire bucket
await client.clearCache();

// Nuke matched entries by regex
const deletedMatches = await client.invalidateCache(/Media/);

// Poll remaining nodes
console.log(await client.cacheSize);
```
