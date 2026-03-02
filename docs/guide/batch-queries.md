# Batch Queries

Fetch multiple IDs traversing identical endpoint entities in a single GraphQL request! Under the hood, AniList restricts nodes per fetch, so `ani-client` uses dynamic internal chunking up to 50 IDs per **parallel** call.

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

