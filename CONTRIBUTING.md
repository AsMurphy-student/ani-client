# Contributing to ani-client

Thanks for your interest in contributing! This document covers everything you need to get started.

## Prerequisites

- **Node.js** ≥ 20
- **pnpm** ≥ 10 (`corepack enable` to activate)
- **Git**

## Getting started

```bash
# Clone the repo
git clone https://github.com/gonzyui/ani-client.git
cd ani-client

# Install dependencies
pnpm install

# Build the project
pnpm build
```

## Project structure

```
src/
├── index.ts              # Barrel exports
├── client/index.ts       # AniListClient class (main entry point)
├── cache/
│   ├── index.ts          # MemoryCache (LRU, in-memory)
│   └── redis.ts          # RedisCache adapter
├── errors/index.ts       # AniListError class
├── queries/index.ts      # GraphQL query strings & batch builders
├── rate-limiter/index.ts # Rate limiter with timeout & retry
└── types/index.ts        # All TypeScript types, enums & interfaces

tests/
├── unit/                 # Vitest unit tests (mocked, no network)
│   ├── cache.test.ts
│   ├── client.test.ts
│   └── rate-limiter.test.ts
└── client.test.ts        # Integration tests (hits real AniList API)
```

## Development workflow

### Available scripts

| Command | Description |
| --- | --- |
| `pnpm build` | Build CJS + ESM + DTS via tsup |
| `pnpm dev` | Build in watch mode |
| `pnpm lint` | Check code with Biome |
| `pnpm lint:fix` | Auto-fix lint & formatting issues |
| `pnpm format` | Format code with Biome |
| `pnpm test` | Run all tests (unit + integration) |
| `pnpm test:unit` | Run unit tests only (Vitest) |
| `pnpm test:integration` | Run integration tests (real API) |

### Typical flow

1. Create a feature branch from `main`
2. Make your changes
3. Run `pnpm lint` — must pass with zero errors
4. Run `pnpm test:unit` — all unit tests must pass
5. Run `pnpm build` — must compile cleanly
6. Commit and open a PR

## Code style

This project uses [Biome](https://biomejs.dev/) for linting and formatting. The configuration is in `biome.json`.

Key rules:

- **2-space indentation**, double quotes, trailing commas, semicolons
- **Line width**: 120 characters
- **Imports**: auto-organized, `type` imports enforced
- **No `any`**: use `unknown` and narrow with type guards. If truly unavoidable, use `// biome-ignore lint/suspicious/noExplicitAny: <reason>`

Run `pnpm lint:fix` to auto-fix most issues before committing.

## Writing tests

### Unit tests

Unit tests live in `tests/unit/` and run with [Vitest](https://vitest.dev/). They mock `globalThis.fetch` — no network calls.

```ts
import { describe, expect, it, vi } from "vitest";

describe("MyFeature", () => {
  it("does the thing", () => {
    // ...
  });
});
```

Guidelines:

- Mock `fetch` using `vi.fn()` and restore it in `afterEach`
- Test one behavior per `it()` block
- Prefer assertion messages: `expect(x).toBe(y)` over manual `if/throw`

### Integration tests

Integration tests live in `tests/client.test.ts` and hit the real AniList API. They run with `tsx`.

- Keep them idempotent (read-only queries only)
- Be mindful of rate limits — use small `perPage` values
- These are **not** run in CI by default (they depend on network)

## Adding a new API method

1. **Define the type** in `src/types/index.ts` (response interface + options interface if needed)
2. **Write the query** in `src/queries/index.ts`
3. **Add the method** in `src/client/index.ts` — use `pagedRequest()` for paginated endpoints
4. **Export** new types from `src/index.ts`
5. **Write unit tests** in `tests/unit/client.test.ts`
6. **Add an integration test** in `tests/client.test.ts`
7. **Update the README** API reference table

## Commit conventions

Use clear, descriptive commit messages. Prefer the [Conventional Commits](https://www.conventionalcommits.org/) format:

```
feat: add getReviews() method
fix: handle null trailer field in media response
docs: update README caching section
refactor: extract pagedRequest helper
test: add unit tests for batch queries
chore: update biome to 1.9.4
```

## Pull requests

- Keep PRs focused — one feature or fix per PR
- Include tests for new functionality
- Update documentation if the public API changes
- Make sure CI is green (lint + build + unit tests)
- Fill in the PR description with **what** and **why**

## Reporting issues

When opening an issue, please include:

- **ani-client version** (`pnpm list ani-client` or check `package.json`)
- **Node.js version** (`node -v`)
- **Minimal reproduction** (code snippet or repo)
- **Expected vs actual behavior**

## License

By contributing, you agree that your contributions will be licensed under the [MIT License](LICENSE).
