# Publishing type changes to `@guardian/newsletter-types`

TypeScript clients do not import types from this repo. They use [`@guardian/newsletter-types`](https://github.com/guardian/csnx/tree/main/libs/%40guardian/newsletter-types), published from [`guardian/csnx`](https://github.com/guardian/csnx), which is a **hand-maintained mirror** of the API response shape — a subset, with fields that only matter to the internal wizard workflow excluded.

The types do not update themselves. If you change the API data structure here, you must raise a matching PR in `csnx`, or downstream TypeScript consumers will be typed against a stale shape.

## When a change is needed

Raise a `csnx` PR if your change affects the shape of `/api/newsletters` — for example adding, removing, or renaming a field, or changing its type or optionality, on `newsletterDataSchema` or the rendering options schema.

No change is needed for fields that only exist on drafts, or that are stripped before the API response.

## The change in `csnx`

1. **Edit the types.** [`libs/@guardian/newsletter-types/src/@types/newsletters-api.ts`](https://github.com/guardian/csnx/blob/main/libs/%40guardian/newsletter-types/src/%40types/newsletters-api.ts) — the relevant types are `NewsletterApiData` and `NewsletterEmailRenderingOptions`. Keep the TSDoc comments up to date; they are the only documentation consumers see.

2. **Add a changeset.** Run `pnpm changeset` and select `@guardian/newsletter-types`:

   | Bump | For |
      | --- | --- |
   | patch | comment or doc-only changes |
   | minor | adding a new optional field |
   | major | removing or renaming a field, or making an optional field required |

3. **Merge.** The changesets release workflow opens a version PR; merging that publishes the new version to npm.

## Ordering

For **additive** changes, publish the `csnx` types first (as optional), then merge the change here.

For **breaking** changes, follow the staged approach in the [`newsletters-data-client` README](../libs/newsletters-data-client/README.md#strategies-for-breaking-changes):

1. add the field as optional (minor release of the types)
2. backfill existing newsletters
3. update the sample data fixture (`./tools/scripts/fetch-sample-data-fixtures.sh`)
4. make the field required (major release of the types)

## After publishing

Consumers such as [`dotcom-rendering`](https://github.com/guardian/dotcom-rendering) need their `@guardian/newsletter-types` dependency bumping before they pick the change up.

## Non-TypeScript clients

Scala clients (`frontend`, `identity`, `ophan`) define their own case classes and are not covered by this package. Breaking changes need to be coordinated with those teams directly. See [Clients](./clients.md).
