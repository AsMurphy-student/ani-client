---
title: Fetching Data
description: "Fetch anime, manga, characters, staff, users, and forum threads from AniList using ani-client's typed helper methods."
head:
  - - meta
    - property: og:title
      content: Fetching Data — ani-client
  - - meta
    - property: og:description
      content: Complete guide to fetching anime, manga, characters, staff, users, and forum threads from AniList with ani-client.
---

# Fetching Data

`ani-client` provides typed helper methods for every major section of the AniList schema.

## Media (Anime / Manga)

The most common use-case is fetching media (anime or manga) entries.

### `getMedia(id, include?)`

Fetch a single anime or manga by its AniList ID. Optionally pass an `include` argument to hydrate relations, voice actors, streaming links, and more. See [Includes](./includes.md) for details.

```typescript
// Includes relations by default
const anime = await client.getMedia(1);

// Check next airing episode for currently airing anime
if (anime.nextAiringEpisode) {
  console.log(`Episode ${anime.nextAiringEpisode.episode} airs in ${anime.nextAiringEpisode.timeUntilAiring}s`);
}
```

### `searchMedia(options?)`

Search, sort, and filter paginated anime or manga entries. Supports single and multi-criteria genre/tag filtering.

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

Fetch currently trending entries.

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

### `getRecentlyUpdatedManga(options?)`

Get currently releasing manga sorted by most recently updated.

```typescript
const manga = await client.getRecentlyUpdatedManga({ perPage: 10 });
manga.results.forEach((m) => console.log(m.title.romaji));
```

### `getWeeklySchedule(date?)`

Fetches the airing schedule for the entire week of the specified date (defaults to the current week) and groups the episodes by day of the week (Monday to Sunday). Limited to 20 pages of results.

```typescript
const schedule = await client.getWeeklySchedule();

// Log all anime airing this Monday
schedule.Monday.forEach((episode) => {
  console.log(`${episode.media.title.romaji} - Episode ${episode.episode}`);
});
```

### `getMediaBySeason(options)`

Fetch anime for a specific season and year.

```typescript
import { MediaSeason } from "ani-client";

const winter = await client.getMediaBySeason({
  season: MediaSeason.WINTER,
  seasonYear: 2026,
  perPage: 25,
});
```

### `getMediaByMalId(malId, type?)`

Fetch a single anime or manga by its **MyAnimeList** ID. Returns `null` when no match is found.

```typescript
// Lookup by MAL ID
const fma = await client.getMediaByMalId(5114);
if (fma) console.log(fma.title.romaji); // "Hagane no Renkinjutsushi: Fullmetal Alchemist"

// Restrict to anime only
const anime = await client.getMediaByMalId(5114, MediaType.ANIME);
```

::: tip
Useful when migrating from MAL or cross-referencing between platforms.
:::

## Characters & Staff

### `getCharacter(id, include?)` & `searchCharacters(options?)`

Fetch characters by ID or search by name. Pass `{ voiceActors: true }` to include voice actor data.

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

Fetch staff members. Pass `{ media: true }` to include their credited works.

```typescript
const staffWithMedia = await client.getStaff(95001, { media: { perPage: 5 } });
```

## Users & Lists

### `getUser(idOrName)`

Fetch a user by ID or username.

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

### `getUserFavorites(idOrName, options?)`

Fetch a user's favorite anime, manga, characters, staff, and studios.

```typescript
const favs = await client.getUserFavorites("AniList");

// Anime favorites
favs.anime.forEach((a) => console.log(a.title.romaji));

// Character favorites
favs.characters.forEach((c) => console.log(c.name.full));

// Studio favorites
favs.studios.forEach((s) => console.log(s.name));

// Fetch more results per category (default 25, max 50)
const allFavs = await client.getUserFavorites("AniList", { perPage: 50 });
```

## Forum Threads

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
