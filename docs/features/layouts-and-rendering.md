# Layouts, templates, and rendering

## What these features do

These features connect newsletter records to presentation:

- **layouts** decide how newsletters are arranged by edition
- **rendering options** control how article-based emails are rendered
- **template views** show what templates are available in the external email-rendering service

## Layouts

### Purpose

`/layouts` lets users inspect per-edition newsletter layouts and, with permission, edit them.

The map and detail views combine:

- layout data from `/api/layouts`
- launched newsletter data from `/api/newsletters`

Key files:

- [`apps/newsletters-ui/src/app/components/views/LayoutMapView.tsx`](../../apps/newsletters-ui/src/app/components/views/LayoutMapView.tsx)
- [`apps/newsletters-ui/src/app/components/views/LayoutView.tsx`](../../apps/newsletters-ui/src/app/components/views/LayoutView.tsx)
- [`apps/newsletters-api/src/app/routes/layouts.ts`](../../apps/newsletters-api/src/app/routes/layouts.ts)

### What a user can do

- open an edition layout such as `/layouts/uk`
- see which newsletters are placed in each edition
- navigate from a layout card to the launched newsletter detail page
- edit the layout visually or as raw JSON when `editLayouts` permission is enabled

## Rendering options

### Purpose

Rendering options are mainly for article-based newsletters. They control how the external email-rendering service turns newsletter data into HTML.

The rendering-options view:

- edits a subset of newsletter fields (`category`, `seriesTag`, `renderingOptions`)
- previews the result live through the email-rendering preview API
- can optionally request a Braze update when a legacy article newsletter is moved to `article-based`

Key files:

- [`apps/newsletters-ui/src/app/components/RenderingOptionsForm.tsx`](../../apps/newsletters-ui/src/app/components/RenderingOptionsForm.tsx)
- [`apps/newsletters-api/src/app/routes/rendering-templates.ts`](../../apps/newsletters-api/src/app/routes/rendering-templates.ts)
- [`libs/newsletters-data-client/src/lib/schemas/data-collection-schema.ts`](../../libs/newsletters-data-client/src/lib/schemas/data-collection-schema.ts)

### What can be configured

The exact fields come from the rendering-options schemas and wizard steps, including:

- header/banner settings
- date and standfirst display
- image caption behaviour
- palette overrides
- read-more, link-list, dark-section, podcast, and footer configuration

Those groups are represented in [`libs/newsletter-workflow/src/lib/steps/renderingOptions`](../../libs/newsletter-workflow/src/lib/steps/renderingOptions).

## Email template list

`/templates` is read-only. It fetches `/api/rendering-templates`, which proxies the external email-rendering service’s template list, and links each entry to a Chromatic preview in [`TemplateList.tsx`](../../apps/newsletters-ui/src/app/components/TemplateList.tsx).

This is a visibility tool rather than a template editor: template implementation still lives outside this repository.

## Relevant tests

- [`apps/newsletters-e2e/src/ui/layouts.spec.ts`](../../apps/newsletters-e2e/src/ui/layouts.spec.ts)
- [`apps/newsletters-e2e/src/ui/renderingOptions.spec.ts`](../../apps/newsletters-e2e/src/ui/renderingOptions.spec.ts)
