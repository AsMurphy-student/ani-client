# Types & Enums

All public types and enums exported by `ani-client`. Import them directly from the package root:

```typescript
import { MediaType, MediaFormat, type Media, type AniListClientOptions } from "ani-client";
```

## Enums

### MediaType

| Value | Description |
| --- | --- |
| `ANIME` | Japanese animation |
| `MANGA` | Japanese comics |

### MediaFormat

| Value | Description |
| --- | --- |
| `TV` | Aired on television |
| `TV_SHORT` | Short TV episodes |
| `MOVIE` | Theatrical release |
| `SPECIAL` | Special episode |
| `OVA` | Original Video Animation |
| `ONA` | Original Net Animation |
| `MUSIC` | Music video |
| `MANGA` | Manga format |
| `NOVEL` | Light novel |
| `ONE_SHOT` | Single-chapter manga |

### MediaStatus

| Value |
| --- |
| `FINISHED` |
| `RELEASING` |
| `NOT_YET_RELEASED` |
| `CANCELLED` |
| `HIATUS` |

### MediaSeason

| Value |
| --- |
| `WINTER` |
| `SPRING` |
| `SUMMER` |
| `FALL` |

### MediaSort

All values also have a `_DESC` counterpart (e.g. `POPULARITY_DESC`).

`ID`, `TITLE_ROMAJI`, `TITLE_ENGLISH`, `TITLE_NATIVE`, `TYPE`, `FORMAT`, `START_DATE`, `END_DATE`, `SCORE`, `POPULARITY`, `TRENDING`, `EPISODES`, `DURATION`, `STATUS`, `FAVOURITES`, `UPDATED_AT`, `SEARCH_MATCH`

### MediaRelationType

`ADAPTATION`, `PREQUEL`, `SEQUEL`, `PARENT`, `SIDE_STORY`, `CHARACTER`, `SUMMARY`, `ALTERNATIVE`, `SPIN_OFF`, `OTHER`, `SOURCE`, `COMPILATION`, `CONTAINS`

### CharacterSort

All values also have a `_DESC` counterpart where applicable.

`ID`, `ROLE`, `SEARCH_MATCH`, `FAVOURITES`

### CharacterRole

| Value | Description |
| --- | --- |
| `MAIN` | Main character |
| `SUPPORTING` | Supporting character |
| `BACKGROUND` | Background character |

### StaffSort

All values also have a `_DESC` counterpart where applicable.

`ID`, `ROLE`, `LANGUAGE`, `SEARCH_MATCH`, `FAVOURITES`, `RELEVANCE`

### AiringSort

All values also have a `_DESC` counterpart.

`ID`, `MEDIA_ID`, `TIME`, `EPISODE`

### RecommendationSort

`ID`, `ID_DESC`, `RATING`, `RATING_DESC`

### MediaListStatus

| Value | Description |
| --- | --- |
| `CURRENT` | Currently watching / reading |
| `PLANNING` | Planning to watch / read |
| `COMPLETED` | Completed |
| `DROPPED` | Dropped |
| `PAUSED` | On hold |
| `REPEATING` | Re-watching / re-reading |

### MediaListSort

`MEDIA_ID`, `SCORE`, `STATUS`, `PROGRESS`, `PROGRESS_VOLUMES`, `REPEAT`, `PRIORITY`, `STARTED_ON`, `FINISHED_ON`, `ADDED_TIME`, `UPDATED_TIME`, `MEDIA_TITLE_ROMAJI`, `MEDIA_TITLE_ENGLISH`, `MEDIA_TITLE_NATIVE`, `MEDIA_POPULARITY` — all with `_DESC` variants.

---

## Core Interfaces

### Media

The main anime/manga object. Key fields:

| Field | Type | Description |
| --- | --- | --- |
| `id` | `number` | AniList ID |
| `idMal` | `number \| null` | MyAnimeList ID |
| `title` | `MediaTitle` | Romaji, English, Native, UserPreferred |
| `type` | `MediaType` | ANIME or MANGA |
| `format` | `MediaFormat \| null` | TV, MOVIE, MANGA, etc. |
| `status` | `MediaStatus \| null` | RELEASING, FINISHED, etc. |
| `description` | `string \| null` | Synopsis |
| `episodes` | `number \| null` | Episode count (anime) |
| `chapters` | `number \| null` | Chapter count (manga) |
| `coverImage` | `MediaCoverImage` | Cover art URLs |
| `bannerImage` | `string \| null` | Banner URL |
| `genres` | `string[]` | Genre list |
| `averageScore` | `number \| null` | Average user score |
| `popularity` | `number \| null` | Popularity rank |
| `tags` | `MediaTag[]` | Tags with rank and spoiler info |
| `studios` | `StudioConnection` | Animation studios |
| `relations` | `MediaConnection \| null` | Related media |
| `characters` | `MediaCharacterConnection` | *(optional, via include)* |
| `staff` | `MediaStaffConnection` | *(optional, via include)* |
| `isAdult` | `boolean \| null` | NSFW flag |
| `siteUrl` | `string \| null` | AniList URL |

### Character

| Field | Type |
| --- | --- |
| `id` | `number` |
| `name` | `CharacterName` (first, middle, last, full, native, alternative) |
| `image` | `CharacterImage` (large, medium) |
| `description` | `string \| null` |
| `gender` | `string \| null` |
| `age` | `string \| null` |
| `favourites` | `number \| null` |
| `media` | `{ nodes?, edges? } \| null` |

### Staff

| Field | Type |
| --- | --- |
| `id` | `number` |
| `name` | `StaffName` (first, middle, last, full, native) |
| `image` | `StaffImage` (large, medium) |
| `language` | `string \| null` |
| `primaryOccupations` | `string[]` |
| `gender` | `string \| null` |
| `staffMedia` | `{ nodes: StaffMediaNode[] } \| null` *(via include)* |

### User

| Field | Type |
| --- | --- |
| `id` | `number` |
| `name` | `string` |
| `about` | `string \| null` |
| `avatar` | `UserAvatar` (large, medium) |
| `statistics` | `{ anime: UserStatistics, manga: UserStatistics } \| null` |

### AiringSchedule

| Field | Type |
| --- | --- |
| `id` | `number` |
| `airingAt` | `number` (UNIX timestamp) |
| `episode` | `number` |
| `mediaId` | `number` |
| `media` | `Media` |

### MediaListEntry

| Field | Type |
| --- | --- |
| `id` | `number` |
| `status` | `MediaListStatus` |
| `score` | `number \| null` |
| `progress` | `number \| null` |
| `media` | `Media` |

### Recommendation

| Field | Type |
| --- | --- |
| `id` | `number` |
| `rating` | `number \| null` |
| `mediaRecommendation` | `Media` |
| `user` | `{ id, name, avatar } \| null` |

---

## Configuration Interfaces

### AniListClientOptions

```typescript
interface AniListClientOptions {
  token?: string;           // AniList OAuth token
  apiUrl?: string;          // Custom API endpoint
  cache?: CacheOptions;     // Memory cache config
  cacheAdapter?: CacheAdapter; // Custom adapter (e.g. RedisCache)
  rateLimit?: RateLimitOptions;
  hooks?: AniListHooks;
}
```

### CacheOptions

| Option | Type | Default | Description |
| --- | --- | --- | --- |
| `ttl` | `number` | `86_400_000` (24h) | Time-to-live in ms |
| `maxSize` | `number` | `500` | Max cached entries (0 = unlimited) |
| `enabled` | `boolean` | `true` | Disable caching entirely |

### RateLimitOptions

| Option | Type | Default | Description |
| --- | --- | --- | --- |
| `maxRequests` | `number` | `85` | Max requests per window |
| `windowMs` | `number` | `60_000` | Window size in ms |
| `maxRetries` | `number` | `3` | Retries on HTTP 429 |
| `retryDelayMs` | `number` | `2_000` | Base retry delay |
| `timeoutMs` | `number` | `30_000` | Per-request timeout (0 = off) |
| `retryOnNetworkError` | `boolean` | `true` | Retry on ECONNRESET, etc. |
| `enabled` | `boolean` | `true` | Disable rate limiting |

### CacheAdapter

Interface for custom cache implementations (e.g. Redis, SQLite):

```typescript
interface CacheAdapter {
  get<T>(key: string): T | undefined | Promise<T | undefined>;
  set<T>(key: string, data: T): void | Promise<void>;
  delete(key: string): boolean | Promise<boolean>;
  clear(): void | Promise<void>;
  readonly size: number | Promise<number>;
  keys(): string[] | Promise<string[]>;
  invalidate?(pattern: string | RegExp): number | Promise<number>;
}
```

### AniListHooks

| Hook | Signature | When |
| --- | --- | --- |
| `onRequest` | `(query, variables) => void` | Before every API call |
| `onCacheHit` | `(key) => void` | Response served from cache |
| `onRateLimit` | `(retryAfterMs) => void` | HTTP 429 received |
| `onRetry` | `(attempt, reason, delayMs) => void` | Request retried |
| `onResponse` | `(query, durationMs, fromCache) => void` | Request completed |
