# Relations & Includes

You can opt-in to fetch heavily nested entity layers simply by dropping in a secondary `{ include: true }` parameter on Supported queries.

## Include Options

The second parameter of `getMedia()` lets you opt-in to additional data. By default, only `relations` are included for backward compatibility.

| Option | Type | Default | Description |
| --- | --- | --- | --- |
| `characters` | `boolean \| { perPage?, sort?, voiceActors? }` | — | Characters with their roles (MAIN, SUPPORTING, BACKGROUND). Set `voiceActors: true` to include VA data. |
| `staff` | `boolean \| { perPage?, sort? }` | — | Staff members with their roles |
| `relations` | `boolean` | `true` | Sequels, prequels, adaptations, etc. Set `false` to exclude |
| `streamingEpisodes` | `boolean` | — | Streaming links (Crunchyroll, Funimation, etc.) |
| `externalLinks` | `boolean` | — | External links (MAL, official site, etc.) |
| `stats` | `boolean` | — | Score & status distribution |
| `recommendations` | `boolean \| { perPage? }` | — | User recommendations |

## Example Usage

```typescript
// Include characters sorted by role (25 per page by default)
const anime = await client.getMedia(1, { characters: true });
anime.characters?.edges.forEach((e) =>
  console.log(`${e.node.name.full} (${e.role})`)
);

// 50 characters, no sorting
const anime = await client.getMedia(1, {
  characters: { perPage: 50, sort: false },
});

// Include voice actors alongside characters
const anime = await client.getMedia(1, {
  characters: { voiceActors: true },
});
anime.characters?.edges.forEach((e) => {
  console.log(e.node.name.full);
  e.voiceActors?.forEach((va) =>
    console.log(`  VA: ${va.name.full} (${va.languageV2})`)
  );
});

// Staff members
const anime = await client.getMedia(1, { staff: true });
anime.staff?.edges.forEach((e) =>
  console.log(`${e.node.name.full} — ${e.role}`)
);

// Everything at once
const anime = await client.getMedia(1, {
  characters: { perPage: 50 },
  staff: { perPage: 25 },
  relations: true,
  streamingEpisodes: true,
  externalLinks: true,
  stats: true,
  recommendations: { perPage: 10 },
});

// Lightweight — exclude relations
const anime = await client.getMedia(1, {
  characters: true,
  relations: false,
});
```
