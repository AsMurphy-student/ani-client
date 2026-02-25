# Rate Limiting

The client respects AniList's rate limit (**90 req/min**) with a conservative native baseline default constraint of **85 req/min**. 

When encountering HTTP 429 Too Many Requests, it pauses request loops seamlessly and retries automatically using **exponential backoff with jitter**!

## Modifying constraints

Pass a `rateLimit` options configuration boundary payload object when structuring the `AniListClient` init logic.

```typescript
const client = new AniListClient({
  rateLimit: {
    maxRequests: 60,
    windowMs: 60_000,
    maxRetries: 5,            // Retry HTTP 429 exceptions 5 times
    retryDelayMs: 3_000,      // Base delay (exponential backoff applied)
    timeoutMs: 30_000,        // Automatic abort after 30s
    retryOnNetworkError: true, // Retry `ECONNRESET` & `ETIMEDOUT`
    enabled: true,
  },
});
```

::: tip Exponential Backoff
Retries use exponential backoff with jitter, capped at 30 seconds. The formula is:
```
delay = min(retryDelayMs × 2^attempt + random(0–1000), 30000)
```
This prevents thundering herd issues when the API is under load.
:::

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
