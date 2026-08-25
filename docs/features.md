# Features

What the newsletters tool lets you do.

## Manage newsletters

- Browse all Guardian newsletters in a searchable, filterable table (view state is shareable via the URL).
- View full details for a newsletter, including derived values and the raw JSON.
- Edit a newsletter via schema-driven forms, or directly as JSON.

## Create a newsletter

- Step through a guided wizard covering name, frequency, dates, tags, targeting, production details and promotion content.
- Save progress as a draft, skip steps, and come back later.
- See, edit and delete drafts from a drafts list.

## Launch a newsletter

- Run a launch wizard that checks the draft is complete, confirms the identity name and Braze layout, and takes the newsletter live.
- Cancel a launch part-way through.

## Configure rendering

- Set email rendering options: header, footer, images, link lists, read-more and podcast blocks, dark sections and palette overrides.
- Browse and preview rendering templates.

## Edit edition layouts

- View how newsletters are arranged into edition layouts.
- Edit layouts visually or as JSON, with warnings for missing newsletters.

## Send notifications

Automated emails to editorial and production teams for: new draft created, newsletter launched, Braze set-up requested, Braze update requested, and render tags / sign-up page requested.

## Serve newsletter data to the rest of the Guardian

A public read-only API is the canonical source of newsletter data for other Guardian systems — see [Clients](./clients.md).

## Access control

Guardian sign-in, with edit and launch actions gated by permissions. See [Auth and permissions](./auth-and-permissions.md).

---

For how these are implemented, see [Architecture](./architecture.md) and [Data model](./data-model.md).
