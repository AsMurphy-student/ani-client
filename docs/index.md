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
  text: "A simple, typed client for AniList"
  tagline: "Fetch anime, manga, characters, staff and user data effortlessly with zero dependencies."
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
    details: Uses the native fetch API. Works in Node.js >= 20, Bun, Deno, and modern browsers.
  - title: Built-in Caching
    details: Ships with an in-memory LRU cache and an optional Redis adapter for distributed setups.
  - title: Rate Limit Aware
    details: Automatically handles HTTP 429 errors with configurable retries, delays, and network error robustness.
  - title: Request Deduplication
    details: Identical concurrent API requests are coalesced into a single network call automatically.
  - title: Batch Queries
    details: Fetch multiple IDs simultaneously in a single chunked GraphQL call to save network roundtrips.
  - title: Event Hooks
    details: Observe every request, cache hit, retry, and response for complete control and logging.
---
