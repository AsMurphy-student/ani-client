# Contributing to ani-client

Thanks for your interest in contributing! This document covers everything you need to get started.

## Reporting issues

Please use the GitHub issue templates when possible. They help include the version, runtime, and reproduction details needed to investigate problems quickly.

## Pull requests

Please use the pull request template and make sure `pnpm lint`, `pnpm typecheck`, and `pnpm test` pass before requesting review.

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

## Development workflow

### Available scripts

| Command | Description |
| --- | --- |
| `pnpm build` | Build CJS + ESM + DTS via tsup |
| `pnpm dev` | Build in watch mode |
| `pnpm lint` | Check code with Biome |
| `pnpm lint:fix` | Auto-fix lint & formatting issues |
| `pnpm format` | Format code with Biome |
| `pnpm typecheck` | Type-check with `tsc --noEmit` |
| `pnpm test` | Run all tests (unit + integration) |
| `pnpm test:unit` | Run unit tests only (Vitest) |
| `pnpm test:integration` | Run integration tests (real API) |
| `pnpm test:coverage` | Run tests with coverage report |
| `pnpm docs:dev` | Start the VitePress documentation site locally |

### Typical flow

1. Create a feature branch from `dev`
2. Make your changes
3. Run `pnpm lint && pnpm typecheck` — must pass with zero errors
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

Integration tests live in `tests/integration/` and hit the real AniList API. They use Vitest (`pnpm test:integration`).

- Keep them idempotent (read-only queries only)
- Be mindful of rate limits — use small `perPage` values
- These are **not** run in CI by default (they depend on network)

## Project structure

```
src/
├── client/          # AniList client class
│   ├── index.ts     # AniListClient (constructor + core infra)
│   ├── base.ts      # ClientBase interface (shared by domain modules)
│   ├── media.ts     # Media methods (getMedia, searchMedia, getTrending, ...)
│   ├── character.ts # Character methods
│   ├── staff.ts     # Staff methods
│   ├── user.ts      # User methods (getUser, searchUsers, getUserMediaList, getUserFavorites)
│   ├── studio.ts    # Studio methods
│   └── thread.ts    # Thread methods (getThread, getRecentThreads)
├── queries/         # GraphQL queries
│   ├── index.ts     # Barrel re-export
│   ├── fragments.ts # Shared field fragments
│   ├── media.ts     # Media queries
│   ├── character.ts # Character queries
│   ├── staff.ts     # Staff queries
│   ├── user.ts      # User queries
│   ├── studio.ts    # Studio queries
│   ├── thread.ts    # Thread queries
│   ├── metadata.ts  # Genres + tags queries
│   └── builders.ts  # Dynamic query builders + batch builders
├── types/           # TypeScript interfaces & enums (one file per domain)
├── cache/           # MemoryCache + RedisCache + CacheAdapter interface
├── errors/          # AniListError class
├── rate-limiter/    # Rate limiter with exponential backoff
├── utils/           # Shared helpers (clampPerPage, normalizeQuery, chunk, validateId)
└── index.ts         # Public barrel export
```

## Adding a new API method

1. **Define the type** in the appropriate `src/types/*.ts` file (response interface + options if needed)
2. **Write the query** in the matching `src/queries/*.ts` domain file and re-export from `src/queries/index.ts`
3. **Add the implementation** as a standalone function in the matching `src/client/*.ts` domain file
4. **Add the delegation method** to `AniListClient` in `src/client/index.ts`
5. **Export** new types from `src/index.ts`
6. **Write unit tests** in `tests/unit/`
7. **Add an integration test** in `tests/integration/client.test.ts`
8. **Update the docs** in `docs/`

## Commit conventions

Use clear, descriptive commit messages. Prefer the [Conventional Commits](https://www.conventionalcommits.org/) format:

```
feat: add getReviews() method
fix: handle null trailer field in media response
docs: update README caching section
refactor: extract pagedRequest helper
test: add unit tests for batch queries
chore: update biome to 2.x
```

## Pull requests

- Keep PRs focused — one feature or fix per PR
- Include tests for new functionality
- Update documentation if the public API changes
- Make sure CI is green (lint + build + unit tests)
- Fill in the PR description with **what** and **why**

## Reporting issues

For security vulnerabilities, please read [SECURITY.md](SECURITY.md) before opening a public issue.

When opening an issue, please include:

- **ani-client version** (`pnpm list ani-client` or check `package.json`)
- **Node.js version** (`node -v`)
- **Minimal reproduction** (code snippet or repo)
- **Expected vs actual behavior**

## License

By contributing, you agree that your contributions will be licensed under the [MIT License](LICENSE).