# editorial-newsletters-ts

This library exports types and validation functions for the objects published by the Guardian editorial newsletters API.

The three type of "newsletter" objects, each with an "is" validation function:

-   `NewsletterData` - the full newsletter data model, as published on the /api/newsletters route
-   `LegacyNewsletter` - the legacy format for newsletter data, still consumed by existing projects and published on /api/legacy/newsletters
-   `LegacyCancelledNewsletter` - a variant the legacy format for newsletter data, representing a newsletter which is cancelled.

This library was generated with [Nx](https://nx.dev).

## Running unit tests

Run `nx test editorial-newsletters-ts` to execute the unit tests via [Jest](https://jestjs.io).

## Running lint

Run `nx lint editorial-newsletters-ts` to execute the lint via [ESLint](https://eslint.org/).
