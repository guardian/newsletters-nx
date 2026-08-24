# Documentation

Reference docs for how `newsletters-nx` works. For getting the app running locally, start with the [root README](../README.md).

## Choose a path

- **New to this repo**: [Architecture](./architecture.md) then [Local development](./local-development.md)
- **Changing newsletter behaviour/data**: [Data model](./data-model.md) and [Launch flow](./launch-flow.md)
- **Working on access control**: [Auth and permissions](./auth-and-permissions.md)
- **Deploying or debugging environments**: [Deployment](./deployment.md)
- **Verifying changes before merge**: [Testing](./testing.md)

| Doc | What it covers |
| --- | --- |
| [Architecture](./architecture.md) | How this repo fits into Guardian's newsletter ecosystem, package responsibilities, and external services |
| [Local development](./local-development.md) | Getting set up, configuration, and running the tests |
| [Data model](./data-model.md) | How newsletter data is shaped, validated, stored, and transformed |
| [Launch flow](./launch-flow.md) | What happens when a draft newsletter is launched, and what launch statuses mean |
| [Auth and permissions](./auth-and-permissions.md) | How authentication and authorisation currently work (and where permissions are moving) |
| [Deployment](./deployment.md) | CDK stacks, RiffRaff, CODE/PROD environments, and CI workflows |
| [Testing](./testing.md) | Testing layers, commands, and CI expectations |

## Contributing to these docs

- Keep docs close to the code they describe; prefer linking to source over duplicating it.
- If a doc describes something still in flux (e.g. a migration in progress), say so explicitly and link the tracking issue.
- Update the relevant doc(s) as part of the PR that changes the behaviour they describe, not as a follow-up.
