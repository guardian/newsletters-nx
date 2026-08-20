# Data model

The shape of newsletter data, where it is stored, and which fields are generated rather than entered.

## Zod schemas are the source of truth

TypeScript types are derived from Zod schemas, not declared alongside them. The pattern throughout is `z.infer`:

```ts
// libs/newsletters-data-client/src/lib/schemas/draft-newsletter-data-type.ts
export const draftNewsletterDataSchema = newsletterDataSchema.partial().extend({
	renderingOptions: renderingOptionsSchema.partial().optional(),
	thrasherOptions: thrasherOptionsSchema.partial().optional(),
});
export type DraftNewsletterData = z.infer<typeof draftNewsletterDataSchema>;
```

The schemas live in [`libs/newsletters-data-client/src/lib/schemas/`](../libs/newsletters-data-client/src/lib/schemas). The repo is on Zod v4 (`zod: ^4.3.6` in the root `package.json`).

Because the schemas are real runtime values rather than compile-time types, they are reused for three separate jobs: validating API payloads, driving step validation in the state machine, and **generating the UI form fields** (see [State machine](./state-machine.md)). Adding a field to a schema adds it to the form.

## Drafts vs launched newsletters

A draft is _the same schema, made partial_. `draftNewsletterDataSchema` is literally `newsletterDataSchema.partial()`, so every field is optional while drafting and required once launched. This is why a draft can be saved at any point mid-wizard.

|                   | Draft                       | Launched                               |
| ----------------- | --------------------------- | -------------------------------------- |
| Schema            | `draftNewsletterDataSchema` | `newsletterDataSchema`                 |
| Identified by     | numeric `listId`            | `listId`, plus a unique `identityName` |
| Stored under      | `draft-storage/`            | `launched-newsletters/`                |
| Storage interface | `DraftStorage`              | `NewsletterStorage`                    |

The transition happens in `LaunchService.launchDraft` — see [Launch flow](./launch-flow.md).

## Storage: in-memory vs S3

Two implementations sit behind each storage interface, chosen once at startup in [`apps/newsletters-api/src/services/storage/index.ts`](../apps/newsletters-api/src/services/storage/index.ts):

```ts
const isUsingInMemoryStore = isUsingInMemoryStorage();

const draftStore: DraftStorage = isUsingInMemoryStore
	? makeInMemoryStorageInstance()
	: makeS3DraftStorageInstance();
```

`isUsingInMemoryStorage()` reads `USE_IN_MEMORY_STORAGE`, which `pnpm dev` sets to `'true'`. In-memory storage is seeded from `static/newsletters.seed.json` plus an optional gitignored `newsletters.local.json`. Use `pnpm dev:s3` to run against real S3 with `frontend` credentials.

The bucket name comes from the `NEWSLETTER_BUCKET_NAME` environment variable, which the CDK sets on the instance from the `s3BucketName` SSM parameter so the name is not public. Keys are `draft-storage/<listId>.json` and `launched-newsletters/<identityName>.json`, from the `STORAGE_FOLDER` and `OBJECT_PREFIX` constants on the two S3 storage classes.

There is also a `LayoutStorage` with the same in-memory/S3 split.

## Derived fields

Seven fields are generated from the newsletter's name by `deriveNewsletterFieldsFromName` in [`derive-newsletter-fields.ts`](../libs/newsletters-data-client/src/lib/derive-newsletter-fields.ts): `identityName`, `brazeSubscribeEventNamePrefix`, `brazeNewsletterName`, `brazeSubscribeAttributeName`, `brazeSubscribeAttributeNameAlternate`, `campaignName` and `campaignCode`.

For a newsletter named "Down to Earth" this produces `down-to-earth`, `down_to_earth`, `Editorial_DownToEarth`, and so on. They are suggestions, not fixed: the launch wizard has `editIdentityName` and `editBraze` steps, and any values the user edits arrive as `extraValues` and are spread _over_ the derived defaults during launch. `addSuffixToMakeTokenUnique` appends `-i`, `-ii`, … when a derived name collides with an existing one.

A separate set of _computed_ values is never stored at all — `temporarySignUpUrl`, `emailRenderingLatestInSeriesUrl`, `brazeSubscribeEventName` and friends in [`newsletter-value-generators.ts`](../libs/newsletters-data-client/src/lib/newsletter-value-generators.ts) are generated on demand for display and for the notification emails.

## Legacy format

`transformDataToLegacyNewsletter.ts` produces a v1 shape for older consumers. Per the root README, changes to that structure must be communicated to [Data Design](mailto:data.design@theguardian.com) **before** merging.

---

Part of the [newsletters-nx documentation](./README.md).
