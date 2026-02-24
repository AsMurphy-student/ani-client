# Fetching Data

`ani-client` provides fully typed module helpers for every dominant facet of the AniList schema. 

## Media (Anime / Manga)

The most common use-case for AniList involves fetching explicit Media nodes.

### `getMedia(id, include?)`

Fetch a single anime or manga by its ID. It optionally takes an `include` argument to hydrate relations, actors, links, and streaming data dynamically! Check [Includes](./includes.md) for a deeper look.

```typescript
// Includes relations by default
const anime = await client.getMedia(1);
```

### `searchMedia(options?)`

Utilized for searching, sorting, and filtering paginated anime or manga entries locally.

```typescript
import { MediaType, MediaFormat } from "ani-client";

const results = await client.searchMedia({
  query: "Naruto",
  type: MediaType.ANIME,
  format: MediaFormat.TV,
  genre: "Action",
  perPage: 10,
});

results.results.forEach((m) => console.log(m.title.english));
```

### `getTrending(type?, page?, perPage?)`

Fetches trending entries algorithmically.

```typescript
const trending = await client.getTrending(MediaType.ANIME);
```

### `getMediaBySeason(options)`

Fetches Anime mapping to an explicit season chart.

```typescript
import { MediaSeason } from "ani-client";

const winter = await client.getMediaBySeason({
  season: MediaSeason.WINTER,
  seasonYear: 2026,
  perPage: 25,
});
```

## Characters & Staff

Fetch Characters, voice actors, and directors!

### `getCharacter(id, include?)` & `searchCharacters(options?)`

Fetch characters! Supplying `{ voiceActors: true }` instructs `ani-client` to expand the edge nodes to acquire the VAs and language.

```typescript
const spike = await client.getCharacter(1, { voiceActors: true });
spike.media?.edges?.forEach((e) => {
  console.log(e.node.title.romaji);
  e.voiceActors?.forEach((va) =>
    console.log(`  VA: ${va.name.full} (${va.languageV2})`)
  );
});
```

### `getStaff(id, include?)` & `searchStaff(options?)`

Staff includes the `{ media: true }` include flag to retrieve a paginated node list of the shows/manga a staff member partook in!

```typescript
const staffWithMedia = await client.getStaff(95001, { media: { perPage: 5 } });
```

## Users & Lists

Fetch raw User profile structures or explicitly pull authenticated user list data over API queries.

### `getUserMediaList(options)`

```typescript
import { MediaType, MediaListStatus } from "ani-client";

const list = await client.getUserMediaList({
  userName: "AniList",
  type: MediaType.ANIME,
  status: MediaListStatus.COMPLETED,
});

list.results.forEach((entry) => console.log(`${entry.media.title.romaji} — ${entry.score}/100`));
```
