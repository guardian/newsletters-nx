# Local development

## Prerequisites

- Node and pnpm — versions are pinned in [`.nvmrc`](../.nvmrc), [`mise.toml`](../mise.toml) and the `packageManager` field in [`package.json`](../package.json)
- [dev-nginx](https://github.com/guardian/dev-nginx), for the local HTTPS domain
- [Janus](https://janus.gutools.co.uk/) credentials, only if you want to use a real S3 bucket

## Setup

```bash
pnpm install
./scripts/setup.sh
pnpm run dev
```

[`scripts/setup.sh`](../scripts/setup.sh) creates `apps/newsletters-api/.env.local`
from the example file and registers the domain with `dev-nginx`.

The UI is then at https://newsletters-tool.local.dev-gutools.co.uk/ and the API
at http://localhost:3000/. Run both from the **workspace root**, not from
`apps/newsletters-api/`.

Out of the box you get in-memory storage, a fake developer profile and no
outbound email, so no AWS credentials are needed.

## Configuration

Every variable is documented inline in
[`env.local.example.txt`](../apps/newsletters-api/env.local.example.txt) — that
file is the reference. Two things it doesn't tell you:

- `NEWSLETTERS_UI_SERVE`, `NEWSLETTERS_API_READ` and `NEWSLETTERS_API_READ_WRITE`
  control which routes are registered. Each **defaults to enabled when unset and
  `NODE_ENV !== 'production'`**, which is why they're absent from the example
  file. See [`apiDeploymentSettings.ts`](../apps/newsletters-api/src/apiDeploymentSettings.ts).
- To test a different permission level, change **both**
  `LOCAL_USER_PROFILE_EMAIL` and the matching key in `USER_PERMISSIONS`. If they
  don't match you silently fall back to Viewer. Levels are the `UserAccessLevel`
  enum in [`user-profile.ts`](../libs/newsletters-data-client/src/lib/user-profile.ts).

⚠️ Never point a local instance at the PROD bucket, and don't commit real bucket
names. `.env.local` is gitignored.

Locally `STAGE=DEV`. `DEV` is **not** a deployed stage — see [Deployment](./deployment.md).

## Testing

See [Testing](./testing.md) for the testing strategy, command matrix, and CI expectations.
