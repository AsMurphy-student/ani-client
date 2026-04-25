---
title: Rate Limiting & Retries
description: "Handle AniList rate limits transparently with exponential backoff, jitter, request deduplication, custom retry strategies, and response metadata."
head:
  - - meta
    - property: og:title
      content: Rate Limiting & Retries — ani-client
  - - meta
    - property: og:description
      content: Transparent rate limit handling with exponential backoff, deduplication, and custom retry strategies.
---

# Rate Limiting

The client respects AniList's rate limit (30 req/min) with a conservative default of **25 req/min**.

When an HTTP 429 response is received, the client pauses and retries automatically using **exponential backoff with jitter**.

## Configuration

```typescript
const client = new AniListClient({
  rateLimit: {
    maxRequests: 60,
    windowMs: 60_000,
    maxRetries: 5,             // Retry HTTP 429 up to 5 times
    retryDelayMs: 3_000,       // Base delay (exponential backoff applied)
    timeoutMs: 30_000,         // Abort after 30s
    retryOnNetworkError: true, // Retry on ECONNRESET, ETIMEDOUT
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

## Request Deduplication

When multiple callers request the same data concurrently, only **one** HTTP request is sent. All callers receive the same response.

```typescript
// Only 1 HTTP request is sent
const [a, b] = await Promise.all([
  client.getMedia(1),
  client.getMedia(1), // shares the in-flight request from above
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
