# NewslettersNx

Developer landing page for the Guardian newsletter tool monorepo.

## What is in this repo?

- `apps/newsletters-ui` — the React UI for draft and launched newsletters
- `apps/newsletters-api` — the Express API and optional UI host
- `apps/newsletters-e2e` — Playwright end-to-end tests
- `libs/newsletter-workflow`, `libs/state-machine`, `libs/newsletters-data-client`, `libs/email-builder` — the launch workflow, shared state machine, schemas/storage, and notification email code

See [`docs/architecture.md`](docs/architecture.md) for the repo map and runtime boundaries.

## Running locally

Prerequisites:

- Node version from [`.nvmrc`](.nvmrc)
- `pnpm`
- Guardian frontend credentials from Janus for local sign-in

### Set up local config

```bash
./scripts/setup.sh
```

This copies `apps/newsletters-api/env.local.example.txt` to `.env.local` and offers to register the local hostname from [`nginx/nginx-mapping.yml`](nginx/nginx-mapping.yml).

### Start the app

```bash
pnpm run dev
```

- UI: <https://newsletters-tool.local.dev-gutools.co.uk/>
- API: <https://localhost:3000/>

More API-specific configuration lives in [`apps/newsletters-api/README.md`](apps/newsletters-api/README.md).

## Testing and validation

From the repo root:

```bash
pnpm run lint
pnpm run test
pnpm run build
pnpm run test:e2e
```

If you change infrastructure in `cdk/`, also run:

```bash
npm --prefix cdk run lint
npm --prefix cdk run test
npm --prefix cdk run synth
```

## Docs

- [`docs/README.md`](docs/README.md) — docs index
- [`docs/architecture.md`](docs/architecture.md) — monorepo map, runtime boundaries, and integrations
- [`docs/deployment.md`](docs/deployment.md) — CI/CD, CDK, RiffRaff, environments, and rollback pointers
- [`docs/launch-flow.md`](docs/launch-flow.md) — draft to launched newsletter lifecycle
- [`AGENTS.md`](AGENTS.md) — repo-specific working conventions and change boundaries

## Important repo-specific notes

- Changes under [`libs/newsletters-data-client`](libs/newsletters-data-client/README.md) can hide live newsletters from the API if schema validation becomes stricter than the data already stored in S3.
- Changes to the legacy API data shape should still be coordinated with Data Design, as noted in the shared schemas and transform layer under `libs/newsletters-data-client`.
