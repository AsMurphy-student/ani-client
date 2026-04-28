---
title: Error Handling
description: "Learn how to handle AniList API errors with ani-client: status codes, GraphQL error payloads, rate limit errors, and network failures."
head:
  - - meta
    - property: og:title
      content: Error Handling — ani-client
  - - meta
    - property: og:description
      content: Handle AniList API errors with typed AniListError, status codes, GraphQL payloads, and network failures.
---

# Error Handling

All errors thrown by `ani-client` are instances of `AniListError`, a typed subclass of the native `Error`. This makes it easy to distinguish API errors from unexpected runtime exceptions.

## AniListError

```ts
import { AniListError } from "ani-client";

try {
  await client.getMedia(999999999);
} catch (e) {
  if (e instanceof AniListError) {
    console.error(e.message); // human-readable message, e.g. "Not Found"
    console.error(e.status);  // HTTP status code, e.g. 404
    console.error(e.errors);  // raw GraphQL errors array from the API response
  }
}
```

### Properties

| Property | Type | Description |
| --- | --- | --- |
| `message` | `string` | Human-readable error message from the API |
| `status` | `number` | HTTP status code returned by the AniList API |
| `errors` | `unknown[]` | Raw GraphQL errors array from the response body |
| `name` | `string` | Always `"AniListError"` |

## Common Status Codes

| Status | Meaning | Typical Cause |
| --- | --- | --- |
| `400` | Bad Request | Invalid query variables or malformed input |
| `401` | Unauthorized | Missing or invalid OAuth token |
| `404` | Not Found | The requested resource does not exist |
| `429` | Too Many Requests | Rate limit exceeded (handled automatically with retries) |
| `500` | Internal Server Error | AniList-side issue |

## Handling Specific Errors

You can branch on the `status` code to handle different cases:

```ts
import { AniListError } from "ani-client";

try {
  const media = await client.getMedia(id);
} catch (e) {
  if (e instanceof AniListError) {
    switch (e.status) {
      case 404:
        console.warn("Media not found — it may have been removed from AniList.");
        break;
      case 401:
        console.error("Invalid or expired OAuth token.");
        break;
      case 429:
        // ani-client retries 429s automatically.
        // If this is thrown, all retries have been exhausted.
        console.error("Rate limit exceeded after all retries.");
        break;
      default:
        console.error(`Unexpected API error ${e.status}: ${e.message}`);
    }
  } else {
    // Not an AniListError — network failure, timeout, AbortError, etc.
    throw e;
  }
}
```

## Rate Limit Errors

`ani-client` handles HTTP `429` transparently: it waits for the `Retry-After` header and retries the request automatically using exponential backoff. An `AniListError` with `status: 429` is only thrown when **all retries have been exhausted**.

You can monitor rate limit activity via the `onRateLimit` hook without catching errors:

```ts
const client = new AniListClient({
  rateLimit: {
    maxRetries: 3,
  },
  hooks: {
    onRateLimit: (retryAfterMs) => {
      console.warn(`Rate limited — retrying in ${retryAfterMs}ms`);
    },
  },
});
```

See [Rate Limiting](./rate-limiting) for full configuration options.

## Network & Abort Errors

Errors that occur before the API responds (DNS failure, connection reset, request cancellation) are **not** wrapped in `AniListError`. They surface as native browser/Node.js errors:

```ts
import { AniListError } from "ani-client";

const controller = new AbortController();
const scoped = client.withSignal(controller.signal);

setTimeout(() => controller.abort(), 2_000);

try {
  await scoped.getMedia(1);
} catch (e) {
  if (e instanceof AniListError) {
    // API-level error
  } else if (e instanceof DOMException && e.name === "AbortError") {
    console.warn("Request was cancelled.");
  } else {
    // Unexpected network failure
    console.error(e);
  }
}
```

Network errors such as `ECONNRESET` and `ETIMEDOUT` are retried automatically when `retryOnNetworkError: true` is set in the rate limiter config.

## Global Error Monitoring

Use the `onError` lifecycle hook to log or report all errors centrally without wrapping every call in a `try/catch`:

```ts
const client = new AniListClient({
  hooks: {
    onError: (error) => {
      // Send to your error tracking service (Sentry, Datadog, etc.)
      reportError(error);
    },
  },
});
```

::: tip
`onError` receives all `AniListError` instances. Network-level errors that are retried internally do not trigger `onError` on each attempt — only the final thrown error does.
:::