# Changelog

## [1.6.0] — 2026-03-02

### Added
- **`AbortSignal` support** — New `signal` option in `AniListClientOptions` allows cancelling all in-flight requests via `AbortController` or `AbortSignal.timeout()`.
- **Input validation** — All `get*` methods now validate IDs before sending requests. Invalid values (negative, zero, `NaN`, `Infinity`, non-integer) throw a `RangeError` immediately.
- **`getUserFavorites(idOrName)`** — New method to fetch a user's favorite anime, manga, characters, staff, and studios. Supports both user ID and username.
- **Custom retry strategy** — New `retryStrategy` option in `RateLimitOptions` allows overriding the default exponential backoff with a custom delay function.
- **Rate limit headers tracking** — New `client.rateLimitInfo` getter exposes `X-RateLimit-Limit`, `X-RateLimit-Remaining`, and `X-RateLimit-Reset` parsed from API responses.
- **Response metadata** — New `client.lastRequestMeta` getter providing `durationMs`, `fromCache`, and `rateLimitInfo` for the last request. The `onResponse` hook now receives `rateLimitInfo` as a 4th argument.
- **`validateId()` / `validateIds()`** — New utility functions for ID validation, exported internally.
- **`sortObjectKeys()`** — New utility for deep-sorting object keys recursively, used internally for deterministic cache keys.
- **New types** — `UserFavorites`, `FavoriteMediaNode`, `FavoriteCharacterNode`, `FavoriteStaffNode`, `FavoriteStudioNode`, `RateLimitInfo`, `ResponseMeta`.
- **77 new unit tests** — `utils.test.ts` (26), `builders.test.ts` (16), `errors.test.ts` (12), `redis-cache.test.ts` (13), `features.test.ts` (10). Total: **129 unit tests**.

### Changed
- **Parallel batch execution** — `executeBatch` (used by `getMediaBatch`, `getCharacterBatch`, `getStaffBatch`) now processes chunks with `Promise.all` instead of sequentially, significantly reducing latency for large batches.
- **Deterministic cache keys** — `MemoryCache.key()` now uses recursive deep-sorting via `sortObjectKeys()` instead of shallow `JSON.stringify` replacer, fixing cache misses when nested variable objects had different key ordering.
- **Pre-compiled regex** — `normalizeQuery()` regex extracted to module-level `WHITESPACE_RE` constant for marginal performance gains.
- **`getWeeklySchedule` optimization** — Day-of-week names array moved outside the `for await` loop to avoid unnecessary re-allocation.

### Fixed
- **Broken README links** — Removed trailing escaped quotes (`\"`) from two markdown URLs.
- **`pnpm-workspace.yaml` now tracked** — Removed from `.gitignore` so contributors get consistent installs.
- **`CONTRIBUTING.md`** — Added missing `thread.ts` to the project structure section, updated `cache/` and `utils/` descriptions.

### CI/CD
- **`dev` branch triggers** — CI now runs on `push`/`pull_request` to both `main` and `dev` branches.
- **`tsc --noEmit` type check** — Added to CI pipeline between lint and build steps.
- **Pinned `pnpm/action-setup@v4.1.0`** — In both `ci.yml` and `publish.yml` for reproducible builds.

### Docs
- **Request Cancellation guide** — New section in Getting Started documenting `AbortSignal` usage with examples.
- **Input Validation docs** — New section in API Reference with error examples.
- **Batch queries** — Updated wording from "sequential" to "parallel" to reflect the new behavior, added validation tip.
- **`getTags()` section** — Fixed missing method header in API Reference (was merged with `getGenres()`).
- **`AniListClientOptions.signal`** — Documented in both API Reference and Types & Enums.

## [1.5.1] — 2026-02-26

### Added
- **`parseAniListMarkdown(text)`** — New utility function to parse AniList's custom markdown syntax into standard HTML (handles spoilers, images, youtube embeds, centered text, etc.).
- **`getWeeklySchedule(date?)`** — New method to easily retrieve the airing schedule for the current week, grouped by day of the week (Monday to Sunday).
- **Forum Threads API** — New methods `getThread(id)` and `getRecentThreads(options)` to fetch and search AniList forum threads.
- **Thread Types** — New exported types: `Thread`, `ThreadCategory`, `ThreadMediaCategory`, `SearchThreadOptions`.
- **`ThreadSort` enum** — Added to control thread sorting.

### Changed
- **Internal Architecture Rewrite** — The monolithic API class has been completely split into standalone domain-specific modules (`media`, `user`, `character`, etc.). This greatly improves tree-shaking and maintainability.
- **Bundle Size Reduced** — The package bundle is now **~12% smaller** (from 52KB down to 46KB CJS, and from 43KB down to 34KB DTS).
- **Documentation Overhaul** — Major cleanup across API and type references. The "Fetching Data" guide now covers threads.

### Removed
- **`getUserByName()`** — Removed in favor of overloaded `getUser(idOrName)`.
- **`StudioDetail`** — Removed this deprecated type alias completely. Use the unified `Studio` interface instead.

## [1.5.0] — 2026-02-26

### Added
- **`nextAiringEpisode`** — Now included in all media responses by default. Returns `airingAt`, `episode`, `timeUntilAiring`, and `mediaId` for currently airing anime.
- **`MediaSource` enum** — New enum (`ORIGINAL`, `MANGA`, `LIGHT_NOVEL`, `VISUAL_NOVEL`, `VIDEO_GAME`, `OTHER`, etc.). `Media.source` is now typed as `MediaSource | null` instead of `string | null`.
- **`UserSort` enum** — New enum (`ID`, `USERNAME`, `WATCHED_TIME`, `CHAPTERS_READ`, `SEARCH_MATCH` + `_DESC` variants).
- **`NextAiringEpisode` interface** — New type for the `nextAiringEpisode` field on `Media`.
- **`searchUsers(options?)`** — Search for AniList users by name with pagination and sort support.
- **`getPopular(type?, page?, perPage?)`** — Convenience method for most popular media (wraps `searchMedia` with `POPULARITY_DESC` sort).
- **`getTopRated(type?, page?, perPage?)`** — Convenience method for highest-rated media (wraps `searchMedia` with `SCORE_DESC` sort).
- **`destroy()`** — Cleanup method that clears the cache and in-flight request map.
- **Multi-criteria search** — `searchMedia` now supports `genres?: string[]`, `tags?: string[]`, `genresExclude?: string[]`, and `tagsExclude?: string[]` for powerful filtering.
- **`SearchUserOptions`** — New options type for `searchUsers()`.

### Changed
- **`getUser(idOrName)`** — Now accepts `number | string`. Pass an ID (number) or a username (string). `getUserByName()` is kept as a deprecated alias.
- **`Studio` / `StudioDetail` merged** — `StudioDetail` is now a deprecated type alias for `Studio`. The `Studio` interface includes optional `favourites` and `media` fields.
- **`invalidate()` alignment** — `MemoryCache.invalidate(string)` now uses **substring matching** (e.g. `"Media"` matches all keys containing `"Media"`) instead of escaping the string into a RegExp. `RegExp` patterns are used as-is. This aligns the mental model with Redis glob patterns.
- **Exponential backoff** — Rate limiter retries now use exponential backoff with jitter (capped at 30s) instead of linear delays.
- **Circular buffer** — Rate limiter timestamps use a fixed-size circular buffer instead of a dynamically growing and filtered array.
- **Centralized `normalizeQuery()`** — Query normalization is now done via a shared utility, removing duplicate regex in cache and client.
- **Integration tests migrated to Vitest** — Tests now use `describe`/`it`/`expect` instead of a custom `test()`/`assert()` runner. Organized into `tests/unit/` and `tests/integration/` with separate Vitest workspace projects.

### Removed
- **`vue` devDependency** — VitePress installs it as a transitive dependency.

## [1.4.4] — 2026-02-24

### Added
- **`StaffSort` enum** — New enum matching AniList's `StaffSort` type (`ID`, `ROLE`, `LANGUAGE`, `SEARCH_MATCH`, `FAVOURITES`, `RELEVANCE` + `_DESC` variants). Exported from the package root.
- **Types & Enums docs page** — New `reference/types.md` documenting all exported enums, core interfaces, and configuration interfaces.
- **Expanded API Reference** — `reference/api.md` rewritten with all 26 public client methods, signatures, and examples.

### Fixed
- **`SearchStaffOptions.sort`** — Was incorrectly typed as `CharacterSort[]` instead of `StaffSort[]`, causing the AniList API to reject requests with a sort parameter.
- **`StatusDistribution.status`** — Now correctly typed as `MediaListStatus | string` (was `string`).
- **Unused import** — Removed dead `FuzzyDate` import in `user.ts`.
- **`getRecommendations` missing perPage clamp** — Now uses `clampPerPage()` like all other paginated methods.
- **Import placement** — `MediaIncludeOptions` import moved to top of `queries/index.ts`.
- **Docs typo** — Fixed "lease-frequently-used" → "least-recently-used" in caching guide.

### Changed
- **`package.json` `homepage`** — Now points to the documentation site (`https://docs-aniclient.gonzyuidev.xyz/`) instead of the GitHub README.
- **`sideEffects: false`** — Added to `package.json` for better bundler tree-shaking.

## [1.4.3] — 2026-02-24

### Added
- **Query minification** — GraphQL queries are now minified (whitespace and newlines removed) before being sent, saving bandwidth.

### Changed
- **Sequential batch chunks** — `executeBatch` (`getMediaBatch`, `getCharacterBatch`, `getStaffBatch`) now executes API chunks of 50 IDs sequentially instead of entirely concurrently to prevent rate limit spikes and memory bloat on huge batches.
- **Cache adapter \`size\` signature** — `CacheAdapter.size` now returns `number | Promise<number>` instead of purely `number`, better accommodating asynchronous adapters like Redis.
- **Split Type Declarations** — Core typing in `src/types/index.ts` has been refactored and split into multiple logical domain files (`media.ts`, `staff.ts`, `character.ts`, etc.) to improve project maintainability.
- **Extracted internal helpers** — `chunk` and `clampPerPage` functions have been extracted from `AniListClient` out into a new `src/utils/index.ts` file.

### Fixed
- **Redis Cache `getSize` leak** — Fixed an issue in `RedisCache` where `getSize` used `KEYS *` instead of `SCAN`, potentially blocking the Redis server. It now correctly uses `collectKeys()`.
- **`AniListError` instanceof check** — Added `Object.setPrototypeOf(this, AniListError.prototype);` in the `AniListError` constructor to ensure that `err instanceof AniListError` works correctly across more Node/TypeScript compilation targets.

## [1.4.2] — 2026-02-23

### Added

- **Staff media entries** — `getStaff(id, { media: true })` now returns the media (anime/manga) a staff member has worked on via `staffMedia.nodes`. Supports `{ media: { perPage } }` to control the number of results (default: 25, sorted by popularity).
- **New types** — `StaffMediaNode`, `StaffIncludeOptions`.
- **Unit tests** — Tests for `getStaff` with and without media include option.
- **Integration test** — Smoke test for `getStaff` with `{ media: true }`.

## [1.4.1] — 2026-02-22

### Added

- **Voice actors on media character edges** — `getMedia(id, { characters: { voiceActors: true } })` now returns voice actor data (id, name, language, image, gender, primary occupations, site URL) alongside each character.
- **Voice actors on `getCharacter` / `searchCharacters`** — `getCharacter(id, { voiceActors: true })` and `searchCharacters({ query, voiceActors: true })` return voice actors for each media the character appears in.
- **New types** — `VoiceActor`, `CharacterMediaEdge`, `CharacterIncludeOptions`.
- **Integration tests** — Smoke tests for voice actors on media, characters, and character search.

### Fixed

- **`searchStaff` query used wrong sort type** — The GraphQL variable was declared as `[CharacterSort]` instead of `[StaffSort]`, causing the API to reject requests with a sort parameter.

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
