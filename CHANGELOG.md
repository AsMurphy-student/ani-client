# Changelog

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
