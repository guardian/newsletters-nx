# Documentation

To get the app running, start with the [root README](../README.md).

- [Local development](./local-development.md) — setup, configuration, gotchas
- [Testing](./testing.md) — the test layers, commands, and what CI checks
- [Deployment](./deployment.md) — how to ship a change to CODE or PROD
- [Infrastructure](./infrastructure.md) — CDK stacks, stages, the two deployed apps, RiffRaff
- [Architecture](./architecture.md) — how the packages fit together, and what this repo is and isn't responsible for
- [Launch flow](./launch-flow.md) — what happens when a newsletter is launched
- [Auth and permissions](./auth-and-permissions.md) — how access control works today
- [Data model](./data-model.md) — how newsletter data is shaped, stored and changed

Package-level detail lives in each package's own README.

## Contributing to these docs

Update the relevant doc in the same PR as the change it describes. Prefer
linking to source over duplicating it, and if something is mid-migration, say so
and link the tracking issue.
