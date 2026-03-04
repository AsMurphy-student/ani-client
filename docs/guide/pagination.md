---
title: Auto-Pagination
description: "Use ani-client's built-in async iterator to automatically paginate through AniList search results without manual page management."
head:
  - - meta
    - property: og:title
      content: Auto-Pagination — ani-client
  - - meta
    - property: og:description
      content: Automatically paginate through AniList results with ani-client's native async iterator.
---

# Auto-Pagination

`paginate()` returns an async iterator that automatically fetches subsequent pages on demand. No manual page tracking required.

```typescript
for await (const anime of client.paginate(
  (page) => client.searchMedia({ query: "Gundam", page, perPage: 25 }),
  3, // stop after 3 pages maximum
)) {
  console.log(anime.title.romaji);
}
```
