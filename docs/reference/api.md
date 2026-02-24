# API Reference

A highly abstract overview of public exposed interfaces directly nested under `AniListClient`. All queries return a promise wrapper structurally yielding specific Type domains (like `<T>`).

We highly suggest enabling auto-typing extensions natively when manipulating payloads!

## Error Handling

`AniListError` exposes HTTP codes paired next to strictly structured error node collections returned directly from queries. It guarantees `instanceof` correctly!

```typescript
import { AniListError } from "ani-client";

try {
  await client.getMedia(999999999);
} catch (err) {
  if (err instanceof AniListError) {
    console.error(err.message); // Not Found
    console.error(err.status);  // 404
  }
}
```

## Raw execution 

You are completely open to manually constructing Graph schema layouts bypassing library formatting and submitting arbitrary queries mapping types genericly!

```typescript
const data = await client.raw<{ Media: { id: number; title: { romaji: string } } }>(
  "query { Media(id: 1) { id title { romaji } } }",
);
```
