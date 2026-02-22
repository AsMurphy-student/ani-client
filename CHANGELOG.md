# Changelog

## [1.4.0] — 2026-02-22

### Added

- **`getMedia()` include options** — Optionally include characters, staff, relations, streaming episodes, external links, stats, and recommendations via a second `include` parameter.
- **New types** — `CharacterRole`, `MediaCharacterEdge`, `MediaCharacterConnection`, `MediaStaffEdge`, `MediaStaffConnection`, `StreamingEpisode`, `ExternalLink`, `ScoreDistribution`, `StatusDistribution`, `MediaStats`, `MediaRecommendationNode`, `MediaIncludeOptions`.
- **`MediaSort` / `CharacterSort` `_DESC` variants** — All sort enums now include descending counterparts (e.g. `POPULARITY_DESC`, `SCORE_DESC`).
- **`SearchStaffOptions.sort`** — Staff search now accepts a `sort` parameter.
- **`CacheOptions` & `RateLimitOptions` exported from types** — Single source of truth, no more inline duplication.
- **Coverage thresholds** — Vitest config now enforces 80% statements / functions / lines, 70% branches.

### Changed

- **Lighter paginated responses** — List queries (`searchMedia`, `getTrending`, `getPlanning`, `getAiredChapters`, `getMediaBySeason`, `getUserMediaList`, batch queries) no longer embed relations by default, reducing payload size.
- **`executeBatch` runs chunks in parallel** — `getMediaBatch()`, `getCharacterBatch()`, `getStaffBatch()` now use `Promise.all` instead of sequential iteration.
- **`perPage` clamped to 1–50** — All paginated methods now clamp the `perPage` value to AniList's allowed range.
- **`AniListClientOptions`** — `cache` and `rateLimit` fields now reference shared `CacheOptions` / `RateLimitOptions` interfaces instead of inline shapes.
- **`CacheAdapter.keys()`** — Return type simplified from `IterableIterator<string> | string[] | Promise<string[]>` to `string[] | Promise<string[]>`.
- **`StatusDistribution.status`** — Type narrowed from `string` to `MediaListStatus | string`.
- **`Staff.age`** — Type corrected from `number | null` to `string | null` (matches AniList API).

### Fixed

- **Cache key collision** — `MemoryCache.key()` now normalises whitespace (`/\s+/g → " "`) before hashing.
- **`MemoryCache.invalidate()` regex injection** — String patterns are now escaped before conversion to RegExp.
- **`RedisCache.invalidate()`** — Now accepts `string | RegExp` (was string-only).
- **`RedisCache` uses SCAN** — `collectKeys()` uses `scanIterator` when available, avoiding blocking `KEYS` in production.
- **`AniListError` stack trace** — `Error.captureStackTrace` is now called in the constructor.
- **`pagedRequest` runtime guard** — Throws a descriptive `AniListError` if the expected field is missing from the response.
- **`getTrending` default type** — Uses `MediaType.ANIME` enum value instead of a type assertion.
- **CI `publish.yml`** — Test step now runs `pnpm test:unit` instead of the non-existent `pnpm test`.
- **Integration tests** — `clearCache()` calls are now properly `await`ed.

### Removed

- **`pnpm-workspace.yaml`** — Removed (not a monorepo).

## [1.3.0] — 2026-02-21

### Added

- **LRU cache eviction** — Cache now uses Least Recently Used strategy instead of FIFO.
- **Pattern-based cache invalidation** — `invalidateCache(pattern)` removes matching entries.
- **Redis cache support** — New `RedisCache` adapter for distributed / persistent caching.
- **`CacheAdapter` interface** — Bring your own cache implementation.
- **Request deduplication** — Identical in-flight requests are coalesced into a single API call.
- **Request timeout** — Configurable per-request timeout via AbortController (default: 30 s).
- **Network error retry** — Automatic retry on `ECONNRESET`, `ETIMEDOUT`, etc.
- **Event hooks** — `onRequest`, `onCacheHit`, `onRateLimit`, `onRetry`, `onResponse` callbacks.
- **Batch queries** — `getMediaBatch()`, `getCharacterBatch()`, `getStaffBatch()` for multi-ID fetches in a single request.
- **Biome** — Linting and formatting configuration.
- **GitHub Actions CI** — Automated build, lint, and test on push / PR.
- **Vitest** — Unit tests with mocks (alongside existing integration tests).

### Changed

- Cache eviction strategy from FIFO to LRU.
- `clearCache()` now returns `Promise<void>` (backward-compatible when not awaited).

## [1.2.0]

Initial public release.
