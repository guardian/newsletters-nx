# Deploying

How to get a change onto CODE or PROD. For what the infrastructure actually
consists of, see [Infrastructure](./infrastructure.md).

## Deploy to PROD

**Merging to `main` deploys to PROD.** There is no separate promotion step, so
make sure your change is ready before you merge.

## Deploy a branch to CODE

1. Push your branch and open a pull request — a draft PR is fine
2. Wait for CI to finish (the deploy job uploads the build to RiffRaff)
3. Go to [RiffRaff](https://riffraff.gutools.co.uk/deployment/request), pick
   project `newsletters::newsletters-tool`, choose your build, and deploy to CODE

## Change infrastructure

Infrastructure lives in [`cdk/`](../cdk). Run these from that directory:

| Command               | Use it to                                           |
| --------------------- | --------------------------------------------------- |
| `npm run diff`        | See what your change would do to a deployed stack   |
| `npm run synth`       | Generate the CloudFormation templates               |
| `npm run test`        | Run the snapshot test                               |
| `npm run test-update` | Regenerate the snapshot after an intentional change |
| `npm run lint`        | Lint the CDK code                                   |

The stack has a snapshot test, so **any infrastructure change needs
`npm run test-update`** or CI will fail. Commit the updated snapshot.

## What CI does

[`.github/workflows/ci.yml`](../.github/workflows/ci.yml) runs on pushes to
`main` and on every pull request:

| Job                        | What it does                                                                                                                  |
| -------------------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| E2E Tests                  | Playwright against a locally started API using in-memory storage and a fake user profile                                      |
| Build, lint and unit tests | `pnpm lint`, `pnpm test`, plus CDK lint, test and synth                                                                       |
| Deploy                     | Needs both jobs above. Bundles the UI and API, synths the templates, and uploads to RiffRaff via `guardian/actions-riff-raff` |

`check-labels.yaml` is a separate PR-labelling check, unrelated to deployment.

See [Testing](./testing.md) for more on the test jobs.

## Troubleshooting

**CDK snapshot test failing** — you changed infrastructure without regenerating
the snapshot. Run `npm run test-update` from `cdk/`.

**Your build isn't in RiffRaff** — the deploy job only runs after both test jobs
pass. Check CI first.

**Something works locally but not on CODE/PROD** — local runs with `STAGE=DEV`,
in-memory storage and a fake user profile. Deployed stages use S3, real SSM
config and Google auth. See [Local development](./local-development.md) and
[Infrastructure](./infrastructure.md).
