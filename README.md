# NewslettersNx

This is a monorepo for:

- defining the data model for editorial newsletters at the Guardian
- serving an API to access the newsletter data
- serving a user interface for editorial to manage their newsletters
- the state-machine library used between UI and API

It uses [pnpm workspaces](https://pnpm.io/workspaces) to manage its packages.

For how the system fits together — the monorepo map, data model, state machine, launch flow, auth and deployment — see the [documentation in `docs/`](docs/README.md).

## Running locally

To run the UI and API locally with the default options:

see [E2E Testing Documentation] (apps/newsletters-e2e/README.md) for more details

### Run set-up script

This will:

- create a `.env.local` file in `./apps/newsletters-api/` based on a template `.env.local.example.txt` file in the same folder.
- run `dev-nginx` and register `newsletters-tool.local.dev-gutools.co.uk`. More info [here](https://github.com/guardian/dev-nginx)

```bash
./scripts/setup.sh
```

### Run the app

fetch some `frontend` credentials from [Janus](https://janus.gutools.co.uk/credentials?permissionId=frontend-dev&tzOffset=1)

`pnpm run dev`

The app will be available at [here](https://newsletters-tool.local.dev-gutools.co.uk/)
The api will be available at [here](https://localhost:3000/)

See the documentation for the [API](apps/newsletters-api/README.md) for the configuration options.

## Testing

### Unit Tests

```bash
pnpm run test
```

### E2E Tests

```bash
pnpm run test:e2e
```

## Development

**NOTE** Merging changes to the 'newsletters-data-client' library can impact the newsletters data used in PROD by other Guardian applications. Please check the notes at the [README for that project](libs/newsletters-data-client/README.md) for more details.

**NOTE** Any changes to the legacy API data structure should be communicated to the [Data Design](mailto:data.design@theguardian.com) **before** merging to main.

## UI Tool Deployment

The newsletters-tool is deployed to PROD
https://newsletters-tool.gutools.co.uk/

CODE environment (for testing) deployed to:
https://newsletters-tool.code.dev-gutools.co.uk/

Continuous Integration (CI) is configured on this Repo. Merging to main will trigger redeployment to of PROD using [RiffRaff](https://riffraff.gutools.co.uk/). To deploy a build to CODE, push your branch to github and create a PR (draft will do). The build can be selected and deployed from [RiffRaff's deploy page](https://riffraff.gutools.co.uk/deployment/request) (project=newsletters::newsletters-tool).

See [Deployment](docs/deployment.md) for the CDK stacks, CI jobs and infrastructure detail.

## User Permissions for the UI Tool

Users need to log in to a Guardian account using Google auth to access the UI. By default, Guardian staff have "viewer" permissions, which let them access the tool but not change any data. Specific users can be granted extra permissions by updating the `userPermissions` parameter in AWS Parameter Store (there is one per stage). Updates take up to 15 minutes to take effect.

See [Auth and permissions](docs/auth-and-permissions.md) for the full details, including the access levels and the outstanding move to the [permissions system](https://github.com/guardian/permissions).
