# Fetching Data

`ani-client` provides fully typed module helpers for every dominant facet of the AniList schema. 

## Media (Anime / Manga)

The most common use-case for AniList involves fetching explicit Media nodes.

### `getMedia(id, include?)`

Fetch a single anime or manga by its ID. It optionally takes an `include` argument to hydrate relations, actors, links, and streaming data dynamically! Check [Includes](./includes.md) for a deeper look.

```typescript
// Includes relations by default
const anime = await client.getMedia(1);

// Check next airing episode for currently airing anime
if (anime.nextAiringEpisode) {
  console.log(`Episode ${anime.nextAiringEpisode.episode} airs in ${anime.nextAiringEpisode.timeUntilAiring}s`);
}
```

### `searchMedia(options?)`

Utilized for searching, sorting, and filtering paginated anime or manga entries. Supports single and multi-criteria genre/tag filtering.

```typescript
import { MediaType, MediaFormat } from "ani-client";

// Simple search
const results = await client.searchMedia({
  query: "Naruto",
  type: MediaType.ANIME,
  format: MediaFormat.TV,
  genre: "Action",
  perPage: 10,
});

// Multi-criteria filtering
const filtered = await client.searchMedia({
  type: MediaType.ANIME,
  genres: ["Action", "Sci-Fi"],       // Must match ALL genres
  tagsExclude: ["Gore", "Nudity"],    // Exclude these tags
  sort: [MediaSort.POPULARITY_DESC],
  perPage: 20,
});

results.results.forEach((m) => console.log(m.title.english));
```

### `getTrending(type?, page?, perPage?)`

Fetches trending entries algorithmically.

```typescript
const trending = await client.getTrending(MediaType.ANIME);
```

### `getPopular(type?, page?, perPage?)`

Get the most popular anime or manga — convenience wrapper around `searchMedia` with `POPULARITY_DESC` sort.

```typescript
const popular = await client.getPopular(MediaType.ANIME, 1, 10);
popular.results.forEach((m) => console.log(`${m.title.romaji} — ${m.popularity}`));
```

### `getTopRated(type?, page?, perPage?)`

Get the highest-rated anime or manga — convenience wrapper around `searchMedia` with `SCORE_DESC` sort.

```typescript
const top = await client.getTopRated(MediaType.MANGA, 1, 10);
top.results.forEach((m) => console.log(`${m.title.romaji} — ${m.averageScore}/100`));
```

### `getWeeklySchedule(date?)`

Fetches the airing schedule for the entire week of the specified date (defaults to the current week) and groups the episodes by day of the week (Monday to Sunday).

```typescript
const schedule = await client.getWeeklySchedule();

// Log all anime airing this Monday
schedule.Monday.forEach((episode) => {
  console.log(`${episode.media.title.romaji} - Episode ${episode.episode}`);
});
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

### `getUser(idOrName)`

Fetch a user by ID or username — accepts both `number` and `string`.

```typescript
const user = await client.getUser(1);          // by ID
const user = await client.getUser("AniList");  // by username
```

### `searchUsers(options?)`

Search for AniList users by name.

```typescript
import { UserSort } from "ani-client";

const result = await client.searchUsers({
  query: "AniList",
  sort: [UserSort.SEARCH_MATCH],
  perPage: 10,
});

result.results.forEach((u) => console.log(u.name));
```

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

## Forum Threads

Access AniList forum threads — fetch individual threads or browse recent activity.

### `getThread(id)`

Fetch a single forum thread by its ID.

```typescript
const thread = await client.getThread(12345);
console.log(thread.title);
console.log(`${thread.replyCount} replies · ${thread.viewCount} views`);
```

### `getRecentThreads(options?)`

Get recent forum threads, sorted by latest reply by default.

```typescript
import { ThreadSort } from "ani-client";

// Most recent threads
const recent = await client.getRecentThreads({ perPage: 10 });

// Threads related to a specific anime
const mediaThreads = await client.getRecentThreads({ mediaId: 1, perPage: 5 });

// Search threads
const search = await client.getRecentThreads({ query: "best anime 2026" });
```
