---
title: Batch Queries
description: "Fetch multiple anime, manga, characters, or staff in a single GraphQL request with automatic chunking and input validation."
head:
  - - meta
    - property: og:title
      content: Batch Queries — ani-client
  - - meta
    - property: og:description
      content: Fetch multiple AniList entities in a single request with automatic chunking up to 50 IDs per call.
---

# Batch Queries

Fetch multiple IDs in a single GraphQL request. `ani-client` automatically chunks large batches into parallel calls of up to 50 IDs each.

| Method | Description |
| --- | --- |
| `getMediaBatch(ids)` | Fetch multiple anime / manga |
| `getCharacterBatch(ids)` | Fetch multiple characters |
| `getStaffBatch(ids)` | Fetch multiple staff members |

## Example

```typescript
// Automatically mapped across a single request chunk
const [bebop, naruto, aot] = await client.getMediaBatch([1, 20, 16498]);

console.log(bebop.title.romaji); // Cowboy Bebop
console.log(naruto.title.romaji); // Naruto
```

::: tip Input Validation
All IDs are validated before the request is sent. Passing invalid values (negative, `NaN`, `Infinity`, non-integer) will throw a `RangeError` immediately.
:::

