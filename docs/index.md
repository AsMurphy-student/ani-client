---
layout: home
title: ani-client – Typed AniList Client for Node.js & TypeScript
titleTemplate: ":title"
description: "Fetch anime, manga, characters, staff and user data from AniList effortlessly. Zero dependencies, built-in caching, rate limiting, and full TypeScript support."
head:
  - - meta
    - property: og:title
      content: ani-client – Typed AniList Client for Node.js & TypeScript
  - - meta
    - property: og:description
      content: Fetch anime, manga, characters, staff and user data from AniList effortlessly. Zero dependencies, built-in caching, rate limiting, and full TypeScript support.
  - - meta
    - property: og:image
      content: https://ani-client.js.org/assets/image.png
  - - meta
    - property: og:url
      content: https://ani-client.js.org/
  - - meta
    - name: twitter:title
      content: ani-client – Typed AniList Client for Node.js & TypeScript
  - - meta
    - name: twitter:description
      content: Fetch anime, manga, characters, staff and user data from AniList effortlessly. Zero dependencies, built-in caching, rate limiting, and full TypeScript support.

hero:
  name: "ani-client"
  text: "Typed AniList client for Node.js"
  tagline: "Fetch anime, manga, characters, staff, and user data with zero dependencies."
  actions:
    - theme: brand
      text: Get Started
      link: /guide/introduction
    - theme: alt
      text: API Reference
      link: /reference/api
    - theme: alt
      text: View on GitHub
      link: https://github.com/gonzyui/ani-client

features:
  - title: Zero Dependencies
    details: Uses the native fetch API. Works in Node.js ≥ 20, Bun, Deno, and modern browsers.
  - title: Built-in Caching
    details: LRU memory cache with TTL, stale-while-revalidate, hit/miss stats, and an optional Redis adapter for distributed setups.
  - title: Rate Limit Aware
    details: Handles HTTP 429 transparently with exponential backoff, jitter, configurable retries, and network error resilience.
  - title: Request Deduplication
    details: Identical concurrent requests are coalesced into a single network call automatically.
  - title: Batch & Pagination
    details: Fetch up to 50 IDs in one request with automatic chunking. Auto-paginate with a built-in async iterator.
  - title: Observable & Extensible
    details: Lifecycle hooks, injectable logger, per-request AbortSignal, and full TypeScript coverage.
---
