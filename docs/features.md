# Features

The newsletters tool lets Guardian staff create, manage and launch newsletters. This page describes what it does.

## Manage newsletters

- Search, filter and sort every launched Guardian newsletter in one table at [/launched](https://newsletters-tool.gutools.co.uk/launched), or every draft at [/drafts](https://newsletters-tool.gutools.co.uk/drafts). The URL captures your view, so you can share it.
- Edit newsletters through schema-driven forms, or as raw JSON (developers only).

## Create a newsletter

- A wizard at [/drafts/newsletter-data](https://newsletters-tool.gutools.co.uk/drafts/newsletter-data) walks you through name, frequency, dates, tags, targeting, production details and promotion content.
- Skip steps, save as a draft at any point, and finish later.
- Manage your drafts at [/drafts](https://newsletters-tool.gutools.co.uk/drafts).

## Launch a newsletter

- A launch wizard checks the draft is complete, confirms the identity name and Braze layout, then takes the newsletter live.
- Cancel part-way through if you need to.

## Configure rendering

- Set how a newsletter looks in email: header, footer, images, link lists, read-more and podcast blocks, dark sections and palette overrides.
- Preview the available templates at [/templates](https://newsletters-tool.gutools.co.uk/templates) before applying one.

## Edit edition layouts

- See how newsletters are arranged into edition layouts at [/layouts](https://newsletters-tool.gutools.co.uk/layouts).
- Edit layouts visually or as JSON. Missing newsletters are flagged with warnings.

## Send notifications

Editorial and production teams are emailed automatically when someone:

- creates a draft
- launches a newsletter
- requests Braze set-up or a Braze update
- requests render tags or a sign-up page

## Serve newsletter data to the rest of the Guardian

A public, read-only API serves newsletter data to other Guardian systems:

- https://newsletters.guardianapis.com/api/newsletters

See [Clients](./clients.md) for who uses it.

## Control access

Everyone must sign in with a Guardian account, and editing and launching need extra permissions. See [Auth and permissions](./auth-and-permissions.md).

---

For how these features are implemented, see [Architecture](./architecture.md) and [Data model](./data-model.md).
