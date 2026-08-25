# NewslettersNx

The tooling behind Guardian editorial newsletters: a React management UI, an
Express API, and the shared libraries that define, validate and store newsletter
data.

It's a [pnpm workspace](https://pnpm.io/workspaces) monorepo.

## Quick start

You need Node, pnpm and [dev-nginx](https://github.com/guardian/dev-nginx). You
do **not** need AWS credentials — the default setup uses in-memory storage and a
fake user profile.

From the repo root:

```bash
pnpm install
./scripts/setup.sh
pnpm run dev
```

- UI: https://newsletters-tool.local.dev-gutools.co.uk/
- API: http://localhost:3000/

If that didn't work, or you need to change configuration or permission levels,
see [Local development](docs/local-development.md).

## Where to go next

**[📖 Documentation index](docs/README.md)** — the map of everything.

The usual first stops:

- [Architecture](docs/architecture.md) — what this repo is and isn't responsible for
- [Local development](docs/local-development.md) — setup, configuration, gotchas
- [Testing](docs/testing.md) — how to run the tests
- [Deployment](docs/deployment.md) — how changes reach CODE and PROD

## In progress: the Stand migration

The UI is mid-migration from MUI to
[`@guardian/stand`](https://github.com/guardian/stand). Both UIs live in the
codebase: the Stand version is off by default and opt-in per browser via the
`switch-stand` feature switch, e.g.

```
https://newsletters-tool.local.dev-gutools.co.uk/drafts?switch-stand=true
```

If you're touching the UI, read [Stand migration](docs/stand-migration.md)
first — it explains which screens have moved, how the two versions coexist, and
which of the parallel `Stand*` components to change.

## Before you merge

⚠️ **Changes to [`libs/newsletters-data-client`](libs/newsletters-data-client)
can affect newsletter data used in PROD by other Guardian applications.** Read
[that package's README](libs/newsletters-data-client/README.md) first.

Merging to `main` deploys to PROD.
