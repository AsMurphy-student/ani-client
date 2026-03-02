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

## Custom Retry Strategy

Override the default exponential backoff with your own delay calculation:

```typescript
const client = new AniListClient({
  rateLimit: {
    // Linear backoff: 1s, 2s, 3s, ...
    retryStrategy: (attempt) => (attempt + 1) * 1000,

    // Or fixed delay
    retryStrategy: (attempt, baseDelay) => baseDelay,
  },
});
```

The function receives the attempt number (0-based) and the base delay (`retryDelayMs`), and should return the delay in milliseconds.

## Rate Limit Headers

After every non-cached request, you can check the current rate limit status from the API:

```typescript
await client.getMedia(1);

const info = client.rateLimitInfo;
if (info) {
  console.log(`${info.remaining}/${info.limit} requests remaining`);
  console.log(`Resets at ${new Date(info.reset * 1000)}`);
}
```

## Response Metadata

Track timing and cache status for every request:

```typescript
await client.getMedia(1);

const meta = client.lastRequestMeta;
console.log(`Duration: ${meta?.durationMs}ms, from cache: ${meta?.fromCache}`);
```
