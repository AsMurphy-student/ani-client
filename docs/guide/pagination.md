# Auto-Pagination

Manually maintaining `page: 2, perPage: 10` is incredibly redundant! `ani-client` bundles a native Javascript structural generator out of the box.

`paginate()` returns an _async iterator_ that evaluates and triggers network cascades across underlying pages directly on demand.

```typescript
// Loops seamlessly until out of results!
for await (const anime of client.paginate(
  (page) => client.searchMedia({ query: "Gundam", page, perPage: 25 }),
  3, // Yield and loop across a hard limit of max 3 pages
)) {
  console.log(anime.title.romaji);
}
```
