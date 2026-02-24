# What is ani-client?

`ani-client` is a simple, highly optimized, and fully typed client designed to fetch anime, manga, characters, staff, and user data from the [AniList GraphQL API](https://anilist.co).

It aims to provide a frictionless developer experience without sacrificing performance or bloat.

## Why use ani-client?

While writing raw GraphQL queries is an option, `ani-client` abstracts away the boilerplate while providing several enterprise-grade features out of the box:

- **Zero runtime dependencies** — relies entirely on the native modern Web `fetch` API.
- **Universal compatibility** — works perfectly in Node.js (v20+), Bun, Deno, and the Browser.
- **Strictly typed** — comprehensive TypeScript definitions for every return shape and configuration.
- **Built-in caching** — ships with a localized LRU memory cache, and an official `RedisCache` adapter.
- **Rate-limit aware** — transparently catches HTTP 429 Too Many Requests, implements progressive backoffs, and retries automatically.
- **Request deduplication** — guarantees that multiple identical calls launched concurrently only use a single HTTP request natively yielding across all callers.
- **Request chunking** — limits massive batch API requests seamlessly into sequential limits.

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
