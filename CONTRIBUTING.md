# Contributing

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

## UI Tool Deployment

Continuous Integration (CI) is configured on this Repo. Merging to main will trigger redeployment to of PROD using [RiffRaff](https://riffraff.gutools.co.uk/). To deploy a build to CODE, push your branch to github and create a PR (draft will do). The build can be selected and deployed from [RiffRaff's deploy page](https://riffraff.gutools.co.uk/deployment/request) (project=newsletters::newsletters-tool).
