# Launched newsletters

## What this feature does

Launched newsletters are the authoritative, published newsletter records. The tool lets users browse them, inspect generated values, edit selected metadata, preview rendered output, and update rendering settings.

## User-facing views

### List view

`/launched` fetches `/api/newsletters` and shows the launched collection in [`NewslettersListView.tsx`](../../apps/newsletters-ui/src/app/components/views/NewslettersListView.tsx) and [`NewslettersTable.tsx`](../../apps/newsletters-ui/src/app/components/NewslettersTable.tsx).

### Detail view

`/launched/:id` shows:

- status and restricted-state warnings
- editorial metadata such as group, region, and frequency
- copy, links, tags, and campaign values
- generated embed/Braze snippets
- links to preview, edit, and raw JSON

Key file:

- [`apps/newsletters-ui/src/app/components/NewsletterDataDetails.tsx`](../../apps/newsletters-ui/src/app/components/NewsletterDataDetails.tsx)

### Edit view

`/launched/edit/:id` uses [`EditNewsletterForm.tsx`](../../apps/newsletters-ui/src/app/components/EditNewsletterForm.tsx) to patch launched newsletter data through `/api/newsletters/:newsletterId`.

This form is permission-aware because it builds its schema from the current user’s permissions.

### Rendering preview

`/launched/preview/:id` requests rendered HTML from `/api/rendering-templates/preview/:newsletterId` and displays it in [`RenderingPreviewPage.tsx`](../../apps/newsletters-ui/src/app/components/RenderingPreviewPage.tsx).

## API behaviour

Read routes for launched newsletters live in [`apps/newsletters-api/src/app/routes/newsletters.ts`](../../apps/newsletters-api/src/app/routes/newsletters.ts):

- `GET /api/newsletters`
- `GET /api/newsletters/:newsletterId`
- `PATCH /api/newsletters/:newsletterId`
- `POST /api/newsletters/:newsletterId` for full replacement

Notable details:

- writes are rate-limited
- writes validate both access and schema shape
- image URLs can be dynamically signed on read when enabled

## Data and compatibility

- The strict launched-newsletter schema is [`newsletterDataSchema`](../../libs/newsletters-data-client/src/lib/schemas/newsletter-data-type.ts).
- The API still exposes `/api/legacy/newsletters` for consumers expecting the older shape.
- `transformDataToLegacyNewsletter` in [`libs/newsletters-data-client/src/lib/transformDataToLegacyNewsletter.ts`](../../libs/newsletters-data-client/src/lib/transformDataToLegacyNewsletter.ts) performs that compatibility conversion.

## Relevant tests

- [`apps/newsletters-e2e/src/ui/launched.spec.ts`](../../apps/newsletters-e2e/src/ui/launched.spec.ts)
- [`apps/newsletters-e2e/src/ui/editArticleNewsletter.spec.ts`](../../apps/newsletters-e2e/src/ui/editArticleNewsletter.spec.ts)
- [`apps/newsletters-e2e/src/ui/editFrontsNewsletter.spec.ts`](../../apps/newsletters-e2e/src/ui/editFrontsNewsletter.spec.ts)
- [`apps/newsletters-e2e/src/api/newsletters.spec.ts`](../../apps/newsletters-e2e/src/api/newsletters.spec.ts)
