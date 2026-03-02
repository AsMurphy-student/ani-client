# Types & Enums

All public types and enums exported by `ani-client`. Import them directly from the package root:

```typescript
import { MediaType, MediaFormat, MediaSource, type Media, type AniListClientOptions } from "ani-client";
```

## Enums

### MediaType

| Value | Description |
| --- | --- |
| `ANIME` | Japanese animation |
| `MANGA` | Japanese comics |

### MediaSource

The origin of a media's adaptation.

| Value | Description |
| --- | --- |
| `ORIGINAL` | Original work |
| `MANGA` | Adapted from manga |
| `LIGHT_NOVEL` | Adapted from a light novel |
| `VISUAL_NOVEL` | Adapted from a visual novel |
| `VIDEO_GAME` | Adapted from a video game |
| `NOVEL` | Adapted from a novel |
| `DOUJINSHI` | Adapted from doujinshi |
| `ANIME` | Adapted from anime |
| `WEB_NOVEL` | Adapted from a web novel |
| `LIVE_ACTION` | Adapted from live action |
| `GAME` | Adapted from a game |
| `COMIC` | Adapted from a comic |
| `MULTIMEDIA_PROJECT` | Part of a multimedia project |
| `PICTURE_BOOK` | Adapted from a picture book |
| `OTHER` | Other source |

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

### UserSort

All values also have a `_DESC` counterpart where applicable.

| Value | Description |
| --- | --- |
| `ID` | Sort by user ID |
| `USERNAME` | Sort by username |
| `WATCHED_TIME` | Sort by total watch time |
| `CHAPTERS_READ` | Sort by chapters read |
| `SEARCH_MATCH` | Sort by relevance to search query |

### ThreadSort

| Value | Description |
| --- | --- |
| `ID` / `ID_DESC` | Sort by thread ID |
| `TITLE` / `TITLE_DESC` | Sort by title |
| `CREATED_AT` / `CREATED_AT_DESC` | Sort by creation date |
| `UPDATED_AT` / `UPDATED_AT_DESC` | Sort by last update |
| `REPLIED_AT` / `REPLIED_AT_DESC` | Sort by last reply (default: `REPLIED_AT_DESC`) |
| `REPLY_COUNT` / `REPLY_COUNT_DESC` | Sort by number of replies |
| `VIEW_COUNT` / `VIEW_COUNT_DESC` | Sort by view count |
| `IS_STICKY` | Show sticky threads first |
| `SEARCH_MATCH` | Sort by relevance to search query |

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
| `source` | `MediaSource \| null` | Adaptation source (ORIGINAL, MANGA, etc.) |
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
| `nextAiringEpisode` | `NextAiringEpisode \| null` | Next episode airing info (anime only) |
| `characters` | `MediaCharacterConnection` | *(optional, via include)* |
| `staff` | `MediaStaffConnection` | *(optional, via include)* |
| `isAdult` | `boolean \| null` | NSFW flag |
| `siteUrl` | `string \| null` | AniList URL |

### NextAiringEpisode

| Field | Type | Description |
| --- | --- | --- |
| `id` | `number` | Airing schedule ID |
| `airingAt` | `number` | UNIX timestamp of airing |
| `episode` | `number` | Episode number |
| `mediaId` | `number` | Associated media ID |
| `timeUntilAiring` | `number` | Seconds until airing |

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

### Studio

Represents an animation studio. Fields `favourites` and `media` are populated when fetched via `getStudio()`.

| Field | Type |
| --- | --- |
| `id` | `number` |
| `name` | `string` |
| `isAnimationStudio` | `boolean` |
| `siteUrl` | `string \| null` |
| `favourites` | `number \| null` *(optional)* |
| `media` | `{ pageInfo, nodes } \| null` *(optional)* |

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

## Search Options

### SearchMediaOptions

| Option | Type | Description |
| --- | --- | --- |
| `query` | `string` | Search term |
| `type` | `MediaType` | ANIME or MANGA |
| `format` | `MediaFormat` | TV, MOVIE, etc. |
| `status` | `MediaStatus` | RELEASING, FINISHED, etc. |
| `season` | `MediaSeason` | WINTER, SPRING, etc. |
| `seasonYear` | `number` | Year of the season |
| `genre` | `string` | Single genre filter |
| `tag` | `string` | Single tag filter |
| `genres` | `string[]` | Multiple genre filter (AND) |
| `tags` | `string[]` | Multiple tag filter (AND) |
| `genresExclude` | `string[]` | Exclude genres |
| `tagsExclude` | `string[]` | Exclude tags |
| `isAdult` | `boolean` | Include/exclude adult content |
| `sort` | `MediaSort[]` | Sort order |
| `page` | `number` | Page number |
| `perPage` | `number` | Results per page (max 50) |

### SearchUserOptions

| Option | Type | Description |
| --- | --- | --- |
| `query` | `string` | Search term |
| `sort` | `UserSort[]` | Sort order |
| `page` | `number` | Page number |
| `perPage` | `number` | Results per page (max 50) |

### Thread

| Field | Type | Description |
| --- | --- | --- |
| `id` | `number` | Thread ID |
| `title` | `string` | Thread title |
| `body` | `string \| null` | Thread body (markdown) |
| `userId` | `number` | Author user ID |
| `user` | `{ id, name, avatar }` | Author user object |
| `replyCount` | `number` | Number of replies |
| `viewCount` | `number` | Number of views |
| `isLocked` | `boolean` | Whether new comments are blocked |
| `isSticky` | `boolean` | Pinned thread |
| `repliedAt` | `number \| null` | Timestamp of last reply |
| `createdAt` | `number` | Creation timestamp |
| `categories` | `ThreadCategory[] \| null` | Forum categories |
| `mediaCategories` | `ThreadMediaCategory[] \| null` | Related media |
| `siteUrl` | `string \| null` | AniList URL |

### SearchThreadOptions

| Option | Type | Description |
| --- | --- | --- |
| `query` | `string` | Search term |
| `mediaId` | `number` | Filter by media ID |
| `categoryId` | `number` | Filter by category ID |
| `sort` | `ThreadSort[]` | Sort order (default: `REPLIED_AT_DESC`) |
| `page` | `number` | Page number |
| `perPage` | `number` | Results per page (max 50) |

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
  signal?: AbortSignal;     // Cancel all requests (optional)
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
| `retryDelayMs` | `number` | `2_000` | Base retry delay (exponential backoff applied) |
| `timeoutMs` | `number` | `30_000` | Per-request timeout (0 = off) |
| `retryOnNetworkError` | `boolean` | `true` | Retry on ECONNRESET, etc. |
| `enabled` | `boolean` | `true` | Disable rate limiting |

::: tip
Retries use **exponential backoff with jitter** (capped at 30s). The `retryDelayMs` is the base delay.
:::

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
