# Documentation

Reference docs for how `newsletters-nx` works. For getting the app running locally, start with the [root README](../README.md).

| Doc | What it covers |
| --- | --- |
| [Architecture](./architecture.md) | How this repo fits into Guardian's newsletter ecosystem, package responsibilities, and external services |
| [Data model](./data-model.md) | How newsletter data is shaped, validated, stored, and transformed |
| [Launch flow](./launch-flow.md) | What happens when a draft newsletter is launched, and what launch statuses mean |
| [Auth and permissions](./auth-and-permissions.md) | How authentication and authorisation currently work (and where permissions are moving) |
| [Deployment](./deployment.md) | CDK stacks, RiffRaff, CODE/PROD environments, and CI workflows |

## Contributing to these docs

- Keep docs close to the code they describe; prefer linking to source over duplicating it.
- If a doc describes something still in flux (e.g. a migration in progress), say so explicitly and link the tracking issue.
- Update the relevant doc(s) as part of the PR that changes the behaviour they describe, not as a follow-up.
