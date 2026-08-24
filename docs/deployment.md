# Deployment

CDK stacks, RiffRaff, the CODE and PROD environments, and the CI workflows.

## CDK

Infrastructure is [@guardian/cdk](https://github.com/guardian/cdk) in [`cdk/`](../cdk). [`cdk/bin/cdk.ts`](../cdk/bin/cdk.ts) instantiates the `NewslettersTool` stack twice, once per stage:

| Stage | Tool                                      | Read-only API                                 |
| ----- | ----------------------------------------- | --------------------------------------------- |
| CODE  | `newsletters-tool.code.dev-gutools.co.uk` | `readonly-newsletters.code.dev-gutools.co.uk` |
| PROD  | `newsletters-tool.gutools.co.uk`          | `readonly-newsletters.gutools.co.uk`          |

Stack `newsletters`, region `eu-west-1`. [`cdk/lib/newsletters-tool.ts`](../cdk/lib/newsletters-tool.ts) creates two `GuNodeApp`s on t4g.micro, each scaling 1–2 instances, plus the S3 data bucket, IAM policies for bucket and SES access, SES domain identities, CloudWatch alarms to the `newsletters-alerts` SNS topic, and CNAMEs.

The deployed stages in this stack are **CODE** and **PROD**. `STAGE=DEV` values
seen in local `.env` examples are for local runtime behaviour, not a deployed CDK
stage in this repo. See [Local development](./local-development.md).

The two apps are protected differently. The tool sits behind Google auth. The read-only API has no user auth at all — instead two listener rules on its load balancer allow requests carrying an `X-Gu-API-Key` header matching the `readOnlyEndpointApiKey` SSM parameter, and return a fixed 403 to everything else.

Instance configuration is injected as environment variables through user data — `NEWSLETTER_BUCKET_NAME`, `STAGE`, `STACK`, `APP`, `ENABLE_EMAIL_SERVICE`, plus the flags that differentiate the two deployments: `NEWSLETTERS_API_READ`, `NEWSLETTERS_UI_SERVE` and `ENABLE_DYNAMIC_IMAGE_SIGNING`. The tool's `ENABLE_EMAIL_SERVICE` value is read from the per-stage `enableEmailService` SSM parameter; the read-only API is always passed `'false'`.

Scripts: `npm run synth`, `diff`, `test`, `test-update`, `lint` (run from `cdk/`). The stack has a snapshot test, so infrastructure changes need `npm run test-update`.

## RiffRaff and CI

[`riff-raff.yaml`](../riff-raff.yaml) declares one CloudFormation deployment and two autoscaling deployments, both depending on it, for stages CODE and PROD. AMIs come from Amigo (`newsletters-node-24-ubuntu-22`).

[`.github/workflows/ci.yml`](../.github/workflows/ci.yml) runs on pushes to `main` and on pull requests, with three jobs:

- **E2E Tests** — Playwright against a locally started API using in-memory storage and a fake user profile
- **Build, lint and unit tests** — `pnpm lint`, `pnpm test`, plus CDK lint/test/synth
- **Deploy** — needs both of the above, bundles the UI and API, synths the templates and uploads to RiffRaff via `guardian/actions-riff-raff`

**Merging to `main` deploys to PROD.** To deploy a branch to CODE, push it and open a PR (draft is fine), then pick the build in [RiffRaff](https://riffraff.gutools.co.uk/deployment/request) under project `newsletters::newsletters-tool`.

`check-labels.yaml` is a separate PR-labelling check.
