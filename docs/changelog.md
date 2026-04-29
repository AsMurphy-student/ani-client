---
title: Changelog
description: "Full release history for ani-client — new features, breaking changes, bug fixes, and documentation updates for every version."
head:
  - - meta
    - property: og:title
      content: Changelog — ani-client
  - - meta
    - property: og:description
      content: Complete release history for ani-client with detailed changelogs for every version.
---

# Changelog

## [2.1.2] — 2026-04-29

### Added

- **Apollo-Style Normalized Cache** — added an opt-in `NormalizedCache` that extracts and flattens GraphQL entities by `__typename` and `id`. This guarantees absolute data consistency across different queries (e.g., `getMedia` and `searchMedia` sharing the same entity) and reduces memory footprint for overlapping payloads.
- **Fragment updates** — all internal GraphQL fragments now request `__typename` to support type-aware normalization.

### Fixed

- **Stale-While-Revalidate (SWR) background refresh** — fixed an issue where `MemoryCache` correctly returned stale data within the SWR window, but the client failed to actually trigger the background network request to revalidate it.
- **`CacheAdapter` interface** — added optional `getWithMeta` method to support advanced cache adapters that can communicate stale status to the client.

## [2.1.1] — 2026-04-28

### Fixed

- **`MEDIA_RECOMMENDATION_FIELDS` syntax error** — fixed a malformed GraphQL fragment
  introduced in v2.1.0 that could cause recommendation queries to fail
  ([@AsMurphy-student](https://github.com/AsMurphy-student), [#86](https://github.com/gonzyui/ani-client/pull/86))
- **Integration test failure on `getReview()`** — resolved a `Not Found` error in the
  integration test suite caused by an invalid review ID in the test fixture
  ([#87](https://github.com/gonzyui/ani-client/issues/87))
- **`AniListError.captureStackTrace` type error** — replaced unsafe `Error as any` cast
  with a type-safe `'captureStackTrace' in Error` guard, eliminating the TypeScript
  compiler error under strict mode

### Chores

- Updated pnpm lockfile
- Added `SECURITY.md` with vulnerability reporting guidelines
- Updated `README.md` and `CONTRIBUTING.md`

### Docs

- Added `guide/error-handling.md` — full guide on `AniListError`, status codes,
  rate limit errors, network failures, and global error monitoring via hooks

## [2.1.0] — 2026-04-28

### Added

- **Reviews API** — Complete implementation of AniList reviews functionality:
  - `getReview(id)` — Fetch individual reviews by ID
  - `searchReviews(options)` — Search reviews with advanced filtering (media type, rating, sort, etc.)
  - Full TypeScript types and GraphQL queries for reviews
  - Comprehensive unit and integration tests

- **Cookbook documentation** — New practical guide with real-world examples:
  - Basic queries and advanced search patterns
  - Caching strategies and error handling
  - Batch operations and pagination techniques
  - Real-time data fetching and utility patterns

### Internal

- **Test coverage** — Added 5 new unit tests for review functionality
- **Integration tests** — Added review API integration tests

## [2.0.4] — 2026-04-28

### Added

- **`isNotIn` parameter** — Added `isNotIn` option to exclude specific media by ID in search and discovery methods.
- **Mean score for MediaEdge** — Added mean score field to MediaEdge type for recommendation data.
- **MEDIA_RECOMMENDATION_FIELDS fragment** — New GraphQL fragment for media recommendation fields.

### Fixed

- **Unit tests** — Fixed failing unit tests.
- **Linting** — Resolved linting issues.

### Internal

- **Documentation updates** — Updated docs with new parameter information.

## [2.0.3] — 2026-04-27

### Added

- **Paginated media relationships** — Added `getMediaCharacters()` and `getMediaStaff()` for fetching more than 25 characters or staff members on a media entry.

## [2.0.0] — 2026-04-25

### Breaking Changes
- **Positional arguments removed for media discovery** — `getTrending`, `getPopular`, and `getTopRated` now accept an options object instead of positional arguments.
  - **Old**: `client.getTrending(type, page, perPage)`
  - **New**: `client.getTrending({ type, isAdult, page, perPage })`
- **Standardized method signatures** — Several methods have been updated to use a consistent options-based pattern, improving API predictability.

### Added
- **`isAdult` filter support** — Explicit content filtering is now available across major discovery methods:
  - `getTrending()`
  - `getPopular()`
  - `getTopRated()`
  - `getMediaBySeason()`
  - `getWeeklySchedule()`
  - `getAiredEpisodes()`
  - `getRecentlyUpdatedManga()`
  - `getPlanning()`
- **`GeneralMediaQueryOptions` type** — New unified interface for shared query parameters (type, isAdult, page, perPage).
- **JSDoc Documentation** — Added comprehensive documentation comments to core types and interfaces for better IDE intellisense and developer experience.

### Fixed
- **Docs: Showcase hydration** — Resolved a hydration error where the showcase page would fail to load by rendering through a dedicated theme component.
- **TSConfig** — Fixed linting and configuration errors in `tsconfig.json`.

### Internal
- **Discord Community** — Added official Discord community link to the documentation.
- **CI/CD Cleanup** — Removed `.github/dependabot.yml` as dependency management has been moved to a different workflow.
- **Dependency Updates** — All development dependencies have been updated to their latest versions.
- **Docs Polish** — Refreshed README content and documentation footer links.

## [1.9.0] — 2026-04-21


### Added
- **Array support for `format` filter** — The `format` option in `SearchMediaOptions` now accepts an array of `MediaFormat` (`MediaFormat | MediaFormat[]`), allowing multi-format searches.
- **`countryOfOrigin` filter** — Added the `countryOfOrigin` string property to `SearchMediaOptions` to filter media by country code (e.g. "JP", "KR", "CN").

## [1.8.1] — 2026-03-05

### Fixed
- **`chunk()` infinite loop** — `chunk(arr, 0)` would hang forever. Now throws a `RangeError` when `size < 1`.
- **Non-JSON response crash** — `executeRequest` now catches `res.json()` parse failures (e.g. HTML 502/503 responses) and throws a descriptive `AniListError` with the HTTP status code instead of an unhandled `SyntaxError`.
- **`fetchWithRetry` throw undefined** — After exhausting all retries, the rate limiter could `throw undefined` if no last error was captured. Now throws a meaningful `Error` with a retry count message.
- **`RedisCache.invalidate()` string semantics** — String patterns now use **substring matching** (e.g. `"Media"` matches all keys containing `"Media"`), consistent with `MemoryCache.invalidate()`. Previously, string patterns were treated as exact Redis glob patterns.
- **`getUserMediaList` error type** — Validation error when neither `userId` nor `userName` is provided now throws `TypeError` instead of `AniListError` with status 0, matching standard JavaScript conventions for argument validation.

### Changed
- **`PageInfo` type tightened** — `perPage`, `currentPage`, `lastPage`, and `hasNextPage` are no longer nullable. Only `total` remains `number | null` as some AniList queries don't return a total count.
- **`MediaTag.isAdult` added** — New `isAdult: boolean | null` field on the `MediaTag` interface, matching the AniList API response.

### Internal
- Upgraded Biome from v1.9.4 to v2.4.5.
- Removed dead `_lastFetchCall` helper from test suite.
- Added 12 new unit tests for all bug fixes (chunk guard, non-JSON response, retry fallback, error types, cache invalidation).
- Test count: **230 unit tests** across 13 test files.

## [1.8.0] — 2026-03-04

### Added
- **`withSignal(signal)`** — Scoped per-request `AbortSignal` support. Returns a lightweight view of the client that uses the given signal for all requests while sharing cache, rate limiter, and hooks with the parent.
- **Injectable `logger`** — New `logger` option in `AniListClientOptions` accepts any object with `debug`, `info`, `warn`, `error` methods (compatible with `console`, `pino`, `winston`, etc.). Logs cache hits, API requests, completion times, and errors.
- **`getMediaByMalId(malId, type?)`** — Fetch a media entry by its MyAnimeList ID. Accepts optional `type` to disambiguate when an MAL ID maps to both ANIME and MANGA.
- **`MEDIA_FIELDS_LIGHT` fragment** — Lightweight media fields for list/search contexts. Omits tags, studios, trailer, synonyms for smaller payloads.
- **Cache statistics** — `MemoryCache.stats` returns `{ hits, misses, stales, hitRate }`. `resetStats()` resets counters without clearing data.
- **Stale-while-revalidate** — New `staleWhileRevalidateMs` option in `CacheOptions`. Expired entries are still returned within the grace window, allowing background refresh.
- **`StudioIncludeOptions`** — `getStudio(id, { media: { perPage: 50 } })` now accepts include options to customize the number of media returned.
- **`UserFavoritesOptions`** — `getUserFavorites(idOrName, { perPage: 50 })` now accepts options to customize the number of results per favorites category.
- **`buildStudioByIdQuery(perPage?)`** — Query builder function for studio-by-ID with configurable media perPage.
- **`buildUserFavoritesQuery(idOrName, perPage?)`** — Query builder function for user favorites with configurable perPage per category.
- **`test:coverage` script** — New npm script for running tests with coverage reporting.
- **Snapshot tests** — 15 snapshot tests for all query builders ensuring query stability across changes.
- **36 new unit tests** — Covering `withSignal`, `logger`, `getMediaByMalId`, cache stats, stale-while-revalidate, studio include, and user favorites options.

### Changed
- **Target upgraded to ES2022** — TypeScript compilation target and lib updated from ES2020 to ES2022, enabling `Object.hasOwn`, `Array.at()`, `Error.cause`, and top-level `await`.
- **`noUncheckedIndexedAccess` enabled** — Stricter TypeScript config catches potential `undefined` from array/object indexing at compile time.
- **GitHub Actions CI improved** — Split into parallel `lint-typecheck`, `test` (matrix Node 20/22), and `build` jobs with concurrency control and artifact upload.
- **Logger on error paths** — `logger.error` is now called on both network errors and API error responses (not just network failures).

### Internal
- Non-null assertions added for array indices guarded by length checks (`ids[0]!`) to satisfy `noUncheckedIndexedAccess`.
- `executeBatch` cast (`as T`) to maintain type safety with strict index access.
- `MemoryCache.clear()` now also resets statistics counters.

## [1.7.0] — 2026-03-04

### Breaking Changes
- **`StatusDistribution.status` type narrowed** — Changed from `MediaListStatus | string` to `MediaListStatus`. If you were relying on the `| string` escape hatch, cast explicitly.
- **`VoiceActor` refactored** — Now extends `Pick<Staff, ...>` instead of being a standalone interface. The shape is identical at runtime, but TypeScript code referencing structural differences may need adjustment.
- **`ThreadMediaCategory` refactored** — `title` is now `MediaTitle`, `type` is now `MediaType`, and `coverImage` uses `Pick<MediaCoverImage, "large" | "medium">` instead of inline types.
- **`FavoriteMediaNode` refactored** — `type` is now `MediaType | null` (was `string | null`), `format` is now `MediaFormat | null` (was `string | null`), `title` is now `MediaTitle`, `coverImage` uses `Pick<MediaCoverImage, "large" | "medium">`.

### Security
- **Markdown XSS hardening** — `parseAniListMarkdown()` now validates all URLs in `img()`, `img<width>()`, `webm()`, and `[link]()` syntax against an `https?://` allowlist. `youtube()` IDs are validated against `[\w-]+`. URLs with `javascript:`, `data:`, or other dangerous protocols are now silently stripped, preventing XSS via user-generated content.

### Added
- **`StudioSort` enum** — New enum (`ID`, `NAME`, `SEARCH_MATCH`, `FAVOURITES` + `_DESC` variants) for studio search sorting.
- **`SearchStudioOptions.sort`** — Studio search now accepts a `sort` parameter, aligning with all other entity search options.
- **`getRecentlyUpdatedManga(options?)`** — New method replacing the misleadingly-named `getAiredChapters()`. Returns currently releasing manga sorted by most recently updated.

### Changed
- **`THREAD_FIELDS` moved to fragments** — Thread GraphQL fragment moved from `queries/thread.ts` to `queries/fragments.ts` for consistency with all other fragments.
- **`getWeeklySchedule` bounded to 20 pages** — The auto-paginator now stops after 20 pages maximum, preventing runaway API calls during weeks with many airings.
- **`buildMediaByIdQuery` perPage validation** — Character, staff, and recommendation `perPage` values in the query builder are now validated via `clampPerPage()` before GraphQL string interpolation, preventing invalid queries from `NaN` or `Infinity`.
- **`getRecommendations` validates `mediaId`** — Now calls `validateId(mediaId)` before sending the request.
- **`getUserMediaList` validates `userId`** — Now calls `validateId(userId)` when `userId` is provided.
- **`searchStudios` destructuring** — Refactored to use consistent destructuring pattern matching other search methods.

### Deprecated
- **`getAiredChapters()`** — Renamed to `getRecentlyUpdatedManga()`. The old name is kept as a deprecated alias and will be removed in v2.

## [1.6.1] — 2026-03-03

### Breaking Changes
- **`cacheSize` is now a method** — `client.cacheSize` is now `client.cacheSize()`, consistently returning `Promise<number>` regardless of cache adapter. Update any direct property access to a method call.

### Security
- **Markdown XSS prevention** — `parseAniListMarkdown()` now escapes all HTML entities (`<`, `>`, `&`, `"`, `'`) before processing, preventing cross-site scripting when rendering user-generated descriptions.

### Added
- **`onError` hook** — New lifecycle hook fires on both network and API errors, providing a single observability point for all failures without wrapping every call in try/catch.
- **Markdown headings** — `parseAniListMarkdown()` now supports `#` through `######` (h1–h6) headings.
- **Markdown lists** — Unordered (`-`, `*`) and ordered (`1.`, `2.`) lists are now parsed into `<ul>`/`<ol>` elements.
- **Markdown code** — Inline `` `code` `` and fenced ` ```code``` ` blocks are now supported.
- **`User-Agent` header** — All outgoing requests now include `User-Agent: ani-client/{version}` for better API identification.
- **`typecheck` script** — New `pnpm run typecheck` script in `package.json`.

### Fixed
- **AbortSignal conflict** — User-provided `signal` and internal timeout signals are now combined via `AbortSignal.any()` instead of one overwriting the other.
- **Error wrapping** — Non-`AniListError` exceptions (network errors, JSON parse failures) in `executeRequest` are now wrapped in `AniListError` for consistent error handling.
- **Batch query relations** — `getMediaBatch()` now includes relation data, matching the behavior of `getMedia()`.
- **Timezone sensitivity** — `getWeeklySchedule()` now uses UTC-based date calculations for consistent results across timezones.
- **Rate-limiter cleanup** — `destroy()` now cancels all pending rate-limiter sleep timers via a new `dispose()` method, preventing event loop leaks.
- **Version injection** — Library version is now read from `package.json` at build time (via tsup `define`) instead of being hardcoded.

### CI/CD
- **npm provenance** — `npm publish` now includes the `--provenance` flag for supply chain attestation.
- **Vitest deprecation** — Renamed `test.workspace` to `test.projects` in vitest config.
- **CI typecheck** — Type checking step now uses `pnpm run typecheck` instead of raw `npx tsc --noEmit`.

### Docs
- **`onError` hook** — Documented in Event Hooks guide, API Reference, and Types & Enums.
- **Markdown parser** — Updated guide with headings, lists, code blocks, and security warning.
- **`cacheSize()`** — Updated all references from property to async method.
- **`destroy()`** — Updated description to include rate-limiter timer cleanup.

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
