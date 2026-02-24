# Rate Limiting

The client respects AniList's rate limit (**90 req/min**) with a conservative native baseline default constraint of **85 req/min**. 

When encountering HTTP 429 Too Many Requests, it pauses request loops seamlessly and retries automatically with progressive fallback delays!

## Modifying constraints

Pass a `rateLimit` options configuration boundary payload object when structuring the `AniListClient` init logic.

```typescript
const client = new AniListClient({
  rateLimit: {
    maxRequests: 60,
    windowMs: 60_000,
    maxRetries: 5,            // Retry HTTP 429 exceptions 5 times
    retryDelayMs: 3_000,      // Baseline fallback to compute 
    timeoutMs: 30_000,        // Automatic abort after 30s
    retryOnNetworkError: true, // Retry `ECONNRESET` & `ETIMEDOUT`
    enabled: true,
  },
});
```

## Internal Deduplication 

Crucially: When multiple callers request the **same data hash at the same identical time footprint**, only ONE API HTTP call is evaluated against the network rate limit pool.

Once hydrated, both callers receive the exact identical payload mapped automatically reducing wasted limits.

```typescript
// Only 1 HTTP request is sent
const [a, b] = await Promise.all([
  client.getMedia(1),
  client.getMedia(1), // -> Bound & throttled to `a` signature
]);
```
