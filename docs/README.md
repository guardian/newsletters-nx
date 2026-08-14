# Newsletters tool documentation

This documentation describes how the newsletters tool works for editors and contributors. It complements the engineering setup material in the repository root [`README.md`](../README.md).

## Start here

- [Architecture overview](./architecture/overview.md)
- [Drafting and launch workflows](./features/drafting-and-launch.md)
- [Launched newsletters](./features/launched-newsletters.md)
- [Layouts, templates, and rendering](./features/layouts-and-rendering.md)
- [How automated tests describe behaviour](./testing/overview.md)

## Scope

These pages are based on the current code and tests in:

- [`apps/newsletters-ui`](../apps/newsletters-ui)
- [`apps/newsletters-api`](../apps/newsletters-api)
- [`apps/newsletters-e2e`](../apps/newsletters-e2e)
- [`libs/newsletter-workflow`](../libs/newsletter-workflow)
- [`libs/newsletters-data-client`](../libs/newsletters-data-client)
- [`libs/state-machine`](../libs/state-machine)
- [`libs/email-builder`](../libs/email-builder)
- [`libs/util`](../libs/util)
- [`cdk`](../cdk)

## Current versus legacy behaviour

The repository currently contains both:

- a newer Stand-based draft creation flow behind the `switch-stand` feature switch in [`apps/newsletters-ui/src/app/featureSwitches.ts`](../apps/newsletters-ui/src/app/featureSwitches.ts), and
- older routes and compatibility code such as the legacy wizard UI and `/api/legacy/newsletters`.

The feature pages focus on the newer Stand-based draft setup journey where it exists, and note legacy paths only when they still matter for compatibility or migration.
