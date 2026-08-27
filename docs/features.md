# Features

The newsletters tool lets Guardian staff create, manage and launch newsletters. This page describes its features in more detail.

## Manage newsletters

- Browse all Guardian newsletters in a searchable, filterable table. View state (search, filters, sort) is shareable via the URL:
  - [/launched](https://newsletters-tool.gutools.co.uk/launched)
- View and edit newsletters through schema-driven forms, or directly as JSON (developers only).

## Create a newsletter

- Create a newsletter using a guided wizard that steps through name, frequency, dates, tags, targeting, production details and promotion content:
  - [/drafts/newsletter-data](https://newsletters-tool.gutools.co.uk/drafts/newsletter-data)
- Save progress as a draft at any point, skip steps, and come back later to finish.
- View, edit and delete drafts from a drafts list:
  - [/drafts](https://newsletters-tool.gutools.co.uk/drafts)

## Launch a newsletter

- Launch a newsletter using a wizard that checks the draft is complete, confirms the identity name and Braze layout, and takes the newsletter live.
- Cancel a launch part-way through if needed.

## Configure rendering

- Configure how a newsletter renders in email: header, footer, images, link lists, read-more and podcast blocks, dark sections and palette overrides.
- Browse and preview the available rendering templates before applying them:
  - [/templates](https://newsletters-tool.gutools.co.uk/templates)

## Edit edition layouts

- View how newsletters are arranged into edition layouts:
  - [/layouts](https://newsletters-tool.gutools.co.uk/layouts)
- Edit layouts visually or as JSON, with warnings shown for any missing newsletters.

## Send notifications

Send automated emails to editorial and production teams when key events happen:

- A new draft is created.
- A newsletter is launched.
- Braze set-up is requested.
- A Braze update is requested.
- Render tags or a sign-up page are requested.

## Serve newsletter data to the rest of the Guardian

Expose a public, read-only API for other Guardian systems:

- https://newsletters.guardianapis.com/api/newsletters

See [Clients](./clients.md) for details on who consumes it.

## Control access

Require Guardian sign-in for all users, with edit and launch actions further gated by permissions. See [Auth and permissions](./auth-and-permissions.md) for details.

---

For how these features are implemented, see [Architecture](./architecture.md) and [Data model](./data-model.md).
