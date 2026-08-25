# Testing

The testing layers in this repo, the commands to run them, and what CI enforces.

## Layers

| Layer                   | Runner                                | Where the tests live                     |
| ----------------------- | ------------------------------------- | ---------------------------------------- |
| Unit (API, libs)        | [Jest](https://jestjs.io/)            | `apps/newsletters-api/src`, `libs/*/src` |
| Unit/component (UI)     | [Vitest](https://vitest.dev/)         | `apps/newsletters-ui/src`                |
| Infrastructure snapshot | Jest                                  | `cdk/lib`                                |
| End-to-end              | [Playwright](https://playwright.dev/) | `apps/newsletters-e2e/src`               |

The CDK snapshot test means any infrastructure change needs the snapshot
regenerating — see [Deploying](./deployment.md#change-infrastructure).

## Commands

Run these from the **workspace root** unless stated otherwise.

| Command                                        | What it runs                                |
| ---------------------------------------------- | ------------------------------------------- |
| `pnpm test`                                    | Every package's unit tests, in parallel     |
| `pnpm lint`                                    | ESLint across every package                 |
| `pnpm --filter=@newsletters-nx/<package> test` | One package's unit tests                    |
| `pnpm test:e2e`                                | All Playwright tests, headless              |
| `pnpm test:e2e:ui`                             | All Playwright tests with a visible browser |
| `pnpm test:e2e:debug`                          | Playwright in step-through debug mode       |
| `pnpm test:e2e:api`                            | API Playwright specs only                   |
| `pnpm test:e2e:ui-only`                        | UI Playwright specs only                    |

CDK has its own commands, run from `cdk/` — see
[Deploying](./deployment.md#change-infrastructure).

The e2e suite expects the API to be reachable on `http://localhost:3000`. See
[`apps/newsletters-e2e/README.md`](../apps/newsletters-e2e/README.md) for
Playwright specifics, reports and troubleshooting.

## What CI runs

Tests run on pushes to `main` and on every pull request, in two jobs — one for
E2E, one for build/lint/unit tests. Deployment is blocked until both pass. See
[Deploying](./deployment.md#what-ci-does) for the full pipeline.

The E2E job runs with `USE_IN_MEMORY_STORAGE=true`, `USE_DEVELOPER_PROFILE=true`
and `USE_LOCAL_USER_PERMISSIONS=true`, so it never touches AWS. Reproduce it
locally by running `pnpm run dev` (same storage mode) in one terminal and
`pnpm test:e2e` in another.
