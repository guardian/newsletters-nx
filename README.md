# NewslettersNx

This monorepo powers Guardian editorial newsletters:
- newsletter data model and storage
- newsletters API
- editorial management UI
- shared workflow/state-machine libraries

It uses [pnpm workspaces](https://pnpm.io/workspaces) to manage its packages.

## Quick start

From the repo root:

```bash
pnpm install
./scripts/setup.sh
pnpm run dev
```

The app will be available at https://newsletters-tool.local.dev-gutools.co.uk/.
The API will be available at http://localhost:3000/.

For configuration, local auth/permissions, and troubleshooting, see [Local development](docs/local-development.md).

## Documentation

Start with the [docs index](docs/README.md). Common entry points:

- [Architecture](docs/architecture.md)
- [Local development](docs/local-development.md)
- [Deployment](docs/deployment.md)
- [Auth and permissions](docs/auth-and-permissions.md)
- [Launch flow](docs/launch-flow.md)
- [Data model](docs/data-model.md)
- [Testing](docs/testing.md)

## Testing

See [Testing](docs/testing.md) for the testing strategy, commands, and CI behaviour.

## Development

**NOTE** Merging changes to the 'newsletters-data-client' library can impact the newsletters data used in PROD by other Guardian applications. Please check the notes at the [README for that project](libs/newsletters-data-client/README.md) for more details.

**NOTE** Any changes to the legacy API data structure should be communicated to the [Data Design](mailto:data.design@theguardian.com) **before** merging to main.
