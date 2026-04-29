---
title: Cookbook
description: "Practical examples and recipes for common use cases with ani-client — from basic queries to advanced patterns."
head:
  - - meta
    - property: og:title
      content: Cookbook — ani-client
  - - meta
    - property: og:description
      content: Practical examples and recipes for using ani-client in real applications.
---

# Cookbook

This cookbook provides practical examples and recipes for common use cases with ani-client. Each recipe includes code examples and explanations.

## Table of Contents

- [Basic Queries](#basic-queries)
- [Advanced Search](#advanced-search)
- [Caching Strategies](#caching-strategies)
- [Error Handling](#error-handling)
- [Batch Operations](#batch-operations)
- [Pagination](#pagination)
- [Real-time Updates](#real-time-updates)

## Basic Queries

### Get Anime by ID

```typescript
import { AniListClient } from "ani-client";

const client = new AniListClient();

async function getAnimeDetails() {
  try {
    const anime = await client.getMedia(1); // Cowboy Bebop
    console.log(`${anime.title.romaji} - ${anime.episodes} episodes`);
    console.log(`Genres: ${anime.genres.join(", ")}`);
  } catch (error) {
    console.error("Failed to fetch anime:", error);
  }
}
```

### Search Anime

```typescript
async function searchAnime() {
  const results = await client.searchMedia({
    query: "Attack on Titan",
    type: "ANIME",
    perPage: 5
  });

  results.results.forEach(anime => {
    console.log(`${anime.title.romaji} (${anime.seasonYear})`);
  });
}
```

### Get Character Information

```typescript
async function getCharacterWithVoiceActors() {
  const character = await client.getCharacter(1, {
    voiceActors: true
  });

  console.log(`${character.name.full}`);
  character.media?.edges.forEach(edge => {
    edge.voiceActors?.forEach(va => {
      console.log(`  ${va.name.full} (${va.language})`);
    });
  });
}
```

## Advanced Search

### Filter by Multiple Criteria

```typescript
async function findSpecificAnime() {
  const results = await client.searchMedia({
    query: "adventure",
    type: "ANIME",
    genres: ["Action", "Adventure"],
    status: "FINISHED",
    minScore: 80,
    seasonYear: 2023,
    sort: ["SCORE_DESC"],
    perPage: 10
  });

  console.log(`Found ${results.results.length} anime matching criteria`);
}
```

### Search with Adult Content Filter

```typescript
async function searchSafeContent() {
  // Only show non-adult content
  const results = await client.searchMedia({
    query: "romance",
    type: "ANIME",
    isAdult: false,
    perPage: 20
  });
}
```

### Exclude Specific Media

```typescript
async function getRecommendationsExcluding(ids: number[]) {
  const results = await client.getTrending({
    type: "ANIME",
    idNotIn: ids, // Exclude already watched anime
    perPage: 10
  });
}
```

## Caching Strategies

### Long-term Caching for Static Data

```typescript
const client = new AniListClient({
  cache: {
    ttl: 1000 * 60 * 60 * 24, // 24 hours for anime details
    maxSize: 1000,
    staleWhileRevalidateMs: 1000 * 60 * 5 // 5 minutes grace period
  }
});

async function getCachedAnime(id: number) {
  const anime = await client.getAnime(id);
  // Data stays cached for 24 hours
  return anime;
}
```

### Apollo-Style Normalized Cache

For absolute data consistency across all queries, use the `NormalizedCache`. It extracts entities by `__typename` and `id`, ensuring the same entity (e.g., a specific Media) is only stored once in memory.

```typescript
import { AniListClient, NormalizedCache } from "ani-client";

const normalizedClient = new AniListClient({
  cacheAdapter: new NormalizedCache({
    ttl: 1000 * 60 * 60, // 1 hour
    staleWhileRevalidateMs: 1000 * 60 * 5 // 5 minutes grace period
  })
});

async function testNormalizedCache() {
  const anime = await normalizedClient.getMedia(1); // Fetches Cowboy Bebop
  // searchMedia will use the EXACT same object reference in memory for Cowboy Bebop!
  const results = await normalizedClient.searchMedia({ query: "Cowboy Bebop" });
}
```

### Short-term Caching for Search Results

```typescript
const searchClient = new AniListClient({
  cache: {
    ttl: 1000 * 60 * 15, // 15 minutes for search results
    maxSize: 500
  }
});

async function searchWithCache(query: string) {
  return await searchClient.searchMedia({
    query,
    type: "ANIME",
    perPage: 20
  });
}
```

### Cache Invalidation

```typescript
async function refreshAnimeData(id: number) {
  // Clear specific cache entry
  await client.invalidateCache(`Media-${id}`);

  // Or clear all media-related cache
  await client.invalidateCache("Media");

  // Fetch fresh data
  return await client.getMedia(id);
}
```

## Error Handling

### Handle Rate Limits

```typescript
async function robustApiCall() {
  try {
    const anime = await client.getMedia(1);
    return anime;
  } catch (error) {
    if (error instanceof AniListError) {
      if (error.status === 429) {
        console.log("Rate limited, retrying...");
        // Wait and retry
        await new Promise(resolve => setTimeout(resolve, 1000));
        return client.getMedia(1);
      }
      console.error(`AniList API error: ${error.message}`);
    } else {
      console.error("Network error:", error);
    }
    throw error;
  }
}
```

### Graceful Degradation

```typescript
async function getAnimeWithFallback(id: number) {
  try {
    return await client.getMedia(id);
  } catch (error) {
    console.warn(`Failed to fetch anime ${id}, using cached data if available`);
    // Try to get from cache only
    const cached = await client.cache.get(`Media-${id}`);
    if (cached) {
      return cached;
    }
    throw error;
  }
}
```

## Batch Operations

### Fetch Multiple Anime at Once

```typescript
async function getMultipleAnime(ids: number[]) {
  const animeList = await client.getMediaBatch(ids);

  // Process results
  animeList.forEach(anime => {
    console.log(`${anime.title.romaji}: ${anime.averageScore}/100`);
  });

  return animeList;
}
```

### Batch Character Lookup

```typescript
async function getCharactersInfo(characterIds: number[]) {
  const characters = await client.getCharacterBatch(characterIds);

  return characters.map(char => ({
    id: char.id,
    name: char.name.full,
    favorites: char.favourites
  }));
}
```

## Pagination

### Auto-pagination with Async Iterator

```typescript
async function getAllTrendingAnime() {
  const allAnime = [];

  for await (const anime of client.paginate(
    (page) => client.getTrending({ page, perPage: 50 }),
    10 // Max 10 pages (500 anime)
  )) {
    allAnime.push(anime);
  }

  console.log(`Fetched ${allAnime.length} anime`);
  return allAnime;
}
```

### Manual Pagination

```typescript
async function paginateSearchResults(query: string) {
  let allResults = [];
  let page = 1;
  let hasNextPage = true;

  while (hasNextPage && page <= 5) { // Limit to 5 pages
    const result = await client.searchMedia({
      query,
      page,
      perPage: 50
    });

    allResults.push(...result.results);
    hasNextPage = result.pageInfo.hasNextPage;
    page++;
  }

  return allResults;
}
```

## Real-time Updates

### Weekly Schedule Updates

```typescript
async function getThisWeekSchedule() {
  const now = new Date();
  const schedule = await client.getWeeklySchedule(now);

  // Group by day
  Object.entries(schedule).forEach(([day, episodes]) => {
    if (episodes.length > 0) {
      console.log(`${day}: ${episodes.length} episodes`);
      episodes.slice(0, 3).forEach(ep => {
        console.log(`  ${ep.media.title.romaji} - Episode ${ep.episode}`);
      });
    }
  });
}
```

### Monitor Airing Anime

```typescript
async function getRecentlyAiredEpisodes() {
  const oneDayAgo = Math.floor(Date.now() / 1000) - (24 * 60 * 60);

  const result = await client.getAiredEpisodes({
    airingAtGreater: oneDayAgo,
    perPage: 20
  });

  result.results.forEach(episode => {
    console.log(`${episode.media.title.romaji} Episode ${episode.episode} aired`);
  });
}
```

## Advanced Patterns

### Create a Media Cache Manager

```typescript
class MediaCacheManager {
  private client: AniListClient;
  private mediaCache = new Map<number, any>();

  constructor() {
    this.client = new AniListClient({
      cache: {
        ttl: 1000 * 60 * 30, // 30 minutes
        maxSize: 1000
      }
    });
  }

  async getMedia(id: number) {
    if (this.mediaCache.has(id)) {
      return this.mediaCache.get(id);
    }

    const media = await this.client.getMedia(id);
    this.mediaCache.set(id, media);
    return media;
  }

  async preloadMedia(ids: number[]) {
    const batch = await this.client.getMediaBatch(ids);
    batch.forEach(media => {
      this.mediaCache.set(media.id, media);
    });
  }
}
```

### User List Analyzer

```typescript
async function analyzeUserList(username: string) {
  const list = await client.getUserMediaList({
    userName: username,
    type: "ANIME",
    status: "COMPLETED"
  });

  const stats = {
    totalAnime: list.results.length,
    averageScore: 0,
    genres: new Map<string, number>(),
    studios: new Map<string, number>()
  };

  let totalScore = 0;
  let scoredCount = 0;

  list.results.forEach(entry => {
    if (entry.score > 0) {
      totalScore += entry.score;
      scoredCount++;
    }

    // Count genres
    entry.media.genres?.forEach(genre => {
      stats.genres.set(genre, (stats.genres.get(genre) || 0) + 1);
    });

    // Count studios
    entry.media.studios?.nodes?.forEach(studio => {
      stats.studios.set(studio.name, (stats.studios.get(studio.name) || 0) + 1);
    });
  });

  stats.averageScore = scoredCount > 0 ? totalScore / scoredCount : 0;

  return stats;
}
```

### Review Aggregator

```typescript
async function getMediaReviews(mediaId: number) {
  const reviews = await client.searchReviews({
    mediaId,
    sort: ["SCORE_DESC"],
    perPage: 10
  });

  const summary = {
    totalReviews: reviews.results.length,
    averageScore: 0,
    topReview: null as any
  };

  if (reviews.results.length > 0) {
    const totalScore = reviews.results.reduce((sum, review) => sum + review.score, 0);
    summary.averageScore = totalScore / reviews.results.length;
    summary.topReview = reviews.results[0];
  }

  return summary;
}
```