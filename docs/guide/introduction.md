---
title: What is ani-client?
description: "Learn what ani-client is: a simple, typed, zero-dependency client for the AniList GraphQL API with built-in caching, rate limiting, and request deduplication."
head:
  - - meta
    - property: og:title
      content: What is ani-client? — Introduction
  - - meta
    - property: og:description
      content: Learn what ani-client is and why you should use it for fetching anime, manga, characters, staff and user data from AniList.
---

# What is ani-client?

`ani-client` is a fully typed, zero-dependency client for the [AniList GraphQL API](https://anilist.co). It provides a clean, high-level interface for fetching anime, manga, characters, staff, and user data.

## Why use ani-client?

Writing raw GraphQL queries works, but `ani-client` removes the boilerplate while providing production-grade features out of the box:

- **Zero runtime dependencies** — relies entirely on the native `fetch` API.
- **Universal** — Node.js ≥ 20, Bun, Deno, and modern browsers.
- **Strictly typed** — comprehensive TypeScript definitions for every response and configuration option.
- **Built-in caching** — LRU memory cache with TTL, stale-while-revalidate, and hit/miss stats. Optional `RedisCache` adapter for distributed setups.
- **Rate-limit handling** — transparent HTTP 429 retry with exponential backoff, jitter, and configurable strategies.
- **Request deduplication** — concurrent identical calls share a single in-flight HTTP request.
- **Batch queries** — fetch up to 50 IDs per parallel GraphQL request with automatic chunking.
- **Observable** — lifecycle hooks and an injectable logger for full request visibility.

## Installation

Pick your favorite package manager:

::: code-group
```bash [npm]
npm install ani-client
```
```bash [pnpm]
pnpm add ani-client
```
```bash [yarn]
yarn add ani-client
```
```bash [bun]
bun add ani-client
```
:::
