# Working in newsletters-nx

## Workspace expectations

- Treat this as an Nx-shaped monorepo: deployable apps live in `apps/`, shared packages live in `libs/`.
- Workspace orchestration is currently driven by [`pnpm-workspace.yaml`](pnpm-workspace.yaml) and TypeScript path aliases in [`tsconfig.base.json`](tsconfig.base.json), not by a root `nx.json`.
- The main deployable surfaces are:
  - `apps/newsletters-ui`
  - `apps/newsletters-api`
  - `cdk/`
- Supporting repo areas:
  - `nginx/` for local hostname mapping used by [`scripts/setup.sh`](scripts/setup.sh)
  - `tools/` for helper scripts such as [`tools/scripts/fetch-sample-data-fixtures.sh`](tools/scripts/fetch-sample-data-fixtures.sh)

## Quality gates before merge

Run the root workspace checks for most code changes:

```bash
pnpm run lint
pnpm run test
pnpm run build
```

Run E2E coverage when you change user-facing flows or routing:

```bash
pnpm run test:e2e
```

If you touch `cdk/`, also run:

```bash
npm --prefix cdk run lint
npm --prefix cdk run test
npm --prefix cdk run synth
```

These expectations match the checked-in hooks and CI:

- [`.husky/pre-push`](.husky/pre-push) runs workspace lint/test/build
- [`.husky/pre-commit`](.husky/pre-commit) runs CDK lint/test when staged files include `cdk/`
- [`.github/workflows/ci.yml`](.github/workflows/ci.yml) runs E2E, unit tests, lint, build, and CDK synth

## Safe change boundaries

- Keep app-specific changes in the owning app unless the change is intentionally shared.
- Be cautious in [`libs/newsletters-data-client`](libs/newsletters-data-client/README.md): schema tightening can make existing S3 data disappear from API responses.
- Be cautious in `libs/newsletter-workflow` and `apps/newsletters-api/src/app/routes/currentStep.ts`: these files control the draft/create/launch wizards and permission checks.
- Do not commit secrets or local environment files. `apps/newsletters-api/.env.local` is for local use only and is gitignored.
- Do not point local testing at live PROD newsletter buckets; the API README explicitly warns against that.

## Review expectations

- Expect review from the owners in [`.github/CODEOWNERS`](.github/CODEOWNERS): `@guardian/newsletters` and `@guardian/digital-cms`.
- Call out cross-cutting changes in your PR description, especially if they affect:
  - shared schemas or legacy API output
  - launch permissions or email notifications
  - infrastructure, workflow, or deployment config

## Where infra and deployment changes live

- GitHub Actions: [`.github/workflows/`](.github/workflows)
- RiffRaff config: [`riff-raff.yaml`](riff-raff.yaml)
- AWS infrastructure: [`cdk/`](cdk/)
- Local ingress/dev hostname mapping: [`nginx/nginx-mapping.yml`](nginx/nginx-mapping.yml)

If a change spans app code and deploy config, ask for review on both parts together rather than landing them separately.
