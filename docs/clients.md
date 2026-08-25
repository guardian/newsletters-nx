# Clients

The newsletters tool has two kinds of consumer: the **editorial users** of the tool itself, and the **downstream Guardian systems** that read newsletter data from the public API.

## What this tool provides to other systems

This repo is the **canonical source of truth for Guardian newsletter data**. Other systems do not hold their own copy of what newsletters exist — they read it from here. Specifically, the tool provides:

- **The list of newsletters that exist**, and their status (`pending`, `live`, `paused`, `cancelled`). This is what determines whether a newsletter can be subscribed to, promoted, or sent at all.
- **Stable identifiers** — `identityName`, `listId`, and the legacy `listIdV1` — which other systems use as the key for subscriptions, analytics, and Braze attributes.
- **Descriptive and promotional copy** — name, description, frequency, group, theme, sign-up headline — rendered directly on theguardian.com sign-up pages and in-article sign-up blocks.
- **Tags and campaign codes** — the series tag, campaign tag, and email campaign codes used to associate articles and traffic with a newsletter.
- **Email rendering options** — the per-newsletter configuration (banners, subheadings, read-more sections, palette, dark theme) that the email rendering service uses to build the actual email.
- **Edition layouts** — how newsletters are grouped and ordered for edition-based pages.

Because of this, the API is a shared contract. Changes to `newsletterDataSchema` in [`newsletters-data-client`](../libs/newsletters-data-client/README.md) can silently remove newsletters from the API response for every client listed below — see the [notes on not breaking the API](../libs/newsletters-data-client/README.md#how-not-to-break-the-api).

The tool does **not** send newsletters, manage subscribers, or create Braze campaigns. It holds the data those systems act on.

## Endpoints

Served by the read-only `newsletters-api` deployment (`readonly-newsletters`) at `https://newsletters.guardianapis.com`.

| Endpoint | Contents |
| --- | --- |
| `/api/newsletters` | Current newsletter data (v2 shape) |
| `/api/legacy/newsletters` | Legacy newsletter shape, kept for backwards compatibility |
| `/api/layouts` | Edition layouts |

The full surface is described in [`open-api.yaml`](../apps/newsletters-api/open-api.yaml).

## Who uses the tool

| User | What they do |
| --- | --- |
| Newsletters / editorial teams | Create, edit, and launch newsletters; configure rendering options and edition layouts |
| Central Production | Receive launch and set-up notification emails and complete the manual Braze and sign-up page work |
| Data Design | Consume the legacy API structure; must be told before any change to it |

## Who consumes the API

| Client | Uses | For |
| --- | --- | --- |
| [`guardian/frontend`](https://github.com/guardian/frontend) | `/api/newsletters`, `/api/legacy/newsletters`, `/api/layouts` | Newsletter sign-up embeds, the email-newsletters index page, and edition layout pages (`NewsletterApi.scala`, `NewsletterSignupAgent.scala`) |
| [`guardian/dotcom-rendering`](https://github.com/guardian/dotcom-rendering) | Newsletter data passed through from `frontend` | Rendering sign-up pages and in-article newsletter sign-up blocks |
| [`guardian/identity`](https://github.com/guardian/identity) | `/api/newsletters`, `/api/legacy/newsletters` | Resolving newsletters for subscription management in the identity API (`NewslettersSourceClient.scala`) |
| [`guardian/email-rendering`](https://github.com/guardian/email-rendering) | Newsletter data and rendering options | Rendering newsletter emails and previews |
| [`guardian/ophan`](https://github.com/guardian/ophan) | `/api/newsletters`, `/api/legacy/newsletters` | Mapping email campaign codes for analytics |
| [`guardian/ophan-data-lake`](https://github.com/guardian/ophan-data-lake) | `/api/newsletters` | Daily ingest of newsletter data into BigQuery |
| [`guardian/targeted-experiences`](https://github.com/guardian/targeted-experiences) | `/api/newsletters` | Resolving Braze subscribe attribute names |
| [`guardian/csnx`](https://github.com/guardian/csnx) | Types only (`@guardian/newsletter-types`) | Shared TypeScript types for the API response |
| [`guardian/interactives`](https://github.com/guardian/interactives) | `/api/newsletters` | Project scaffolding that needs the newsletter list |

This list reflects what is visible in the `guardian` org and may not be exhaustive.

## Access

- The **editorial tool** is behind Guardian Google sign-in at the load balancer.
- The **read-only API** is a second deployment of the same code with the UI and write routes disabled, gated by an `X-Gu-API-Key` header. See [Architecture](./architecture.md) and [Auth and permissions](./auth-and-permissions.md).
