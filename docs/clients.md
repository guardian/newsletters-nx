# Clients

The newsletters tool has two kinds of consumer: the **editorial users** of the tool itself, and the **downstream Guardian systems** that read newsletter data from the public API.

## What this tool provides to other systems

This repo is the **canonical source of truth for Guardian newsletter data**. Other systems do not hold their own copy of what newsletters exist — they read it from here. Specifically, the tool provides:

- **The list of newsletters that exist**, and their status (`pending`, `live`, `paused`, `cancelled`). This is what determines whether a newsletter can be subscribed to, promoted, or sent at all.
- **Stable identifiers** — `identityName`, `listId`, and the deprecated `listIdV1` — which other systems use as the key for subscriptions, analytics, and Braze attributes. See [Identifiers](#identifiers) below for how each is used.
- **Descriptive and promotional copy** — name, description, frequency, group, theme, sign-up headline — rendered directly on theguardian.com sign-up pages (for example, the [First Edition sign-up page](https://www.theguardian.com/global/2022/sep/20/sign-up-for-the-first-edition-newsletter-our-free-news-email)) and in-article sign-up blocks.
- **Tags and campaign codes** — the series tag, campaign tag, and email campaign codes used to associate articles and traffic with a newsletter. Specifically, when an article in Composer is tagged with the newsletter's campaign tag (`campaign/email/<identityName>`, alongside an `info/newsletter-sign-up` tag), `frontend` resolves that tag to look up the newsletter and renders its sign-up embed on the article (see `NewsletterService.getNewsletterResponseFromTags` in [`guardian/frontend`](https://github.com/guardian/frontend)).
- **Email rendering options** — the per-newsletter configuration (banners, subheadings, read-more sections, palette, dark theme) that the email rendering service uses to build the actual email.
- **Edition layouts** — how newsletters are grouped and ordered for https://www.theguardian.com/email-newsletters.

Because of this, the API is a shared contract. Changes to `newsletterDataSchema` in [`newsletters-data-client`](../libs/newsletters-data-client/README.md) can silently remove newsletters from the API response for every client listed below — see the [notes on not breaking the API](../libs/newsletters-data-client/README.md#how-not-to-break-the-api).

The tool does **not** send newsletters, manage subscribers, or create Braze campaigns. It holds the data those systems act on.

## Endpoints

Served by the read-only `newsletters-api` deployment (`readonly-newsletters`) at `https://newsletters.guardianapis.com`.

| Endpoint | Contents |
| --- | --- |
| `/api/newsletters` | Current newsletter data (v2 shape) |
| `/api/legacy/newsletters` | Deprecated v1 newsletter shape. No known active consumers — see [Data model](./data-model.md#compatibility--downstream-consumers) |
| `/api/layouts` | Edition layouts |

The full surface is described in [`open-api.yaml`](../apps/newsletters-api/open-api.yaml).

## Who uses the tool

| User | What they do |
| --- | --- |
| Newsletters / editorial teams | Create, edit, and launch newsletters; configure rendering options and edition layouts |
| Central Production | Receive launch and set-up notification emails and complete the manual Braze and sign-up page work |

## Identifiers

| Identifier | Used for | Consumers |
| --- | --- | --- |
| `identityName` | The primary key used across almost all consumers to look up a specific newsletter. | `identity`, `frontend`, `dotcom-rendering`, `email-rendering`, `manage-frontend` |
| `listId` | Subscription state specifically (subscribe/unsubscribe, "is user subscribed"). | `identity`, `gateway`, `dotcom-rendering`, `support-frontend` |
| `listIdV1` | Deprecated — kept only for backwards compatibility with legacy V1 email widget styling. No active consumer subscribes using it. | None (legacy only) |

## Who consumes the API

| Client | Uses | For                                                                                                                                              |
| --- | --- |--------------------------------------------------------------------------------------------------------------------------------------------------|
| [`guardian/frontend`](https://github.com/guardian/frontend) | `/api/newsletters`, `/api/layouts` | Newsletter sign-up embeds, the [email-newsletters index page](https://www.guardian.co.uk/email-newsletters), and edition layout pages (`NewsletterApi.scala`, `NewsletterSignupAgent.scala`) |
| [`guardian/dotcom-rendering`](https://github.com/guardian/dotcom-rendering) | Newsletter data passed through from `frontend` | Rendering sign-up pages and in-article newsletter sign-up blocks                                                                                 |
| [`guardian/identity`](https://github.com/guardian/identity) | `/api/newsletters` | Resolving newsletters for subscription management in the identity API (`NewslettersSourceClient.scala`)                                          |
| [`guardian/email-rendering`](https://github.com/guardian/email-rendering) | Newsletter data and rendering options | Rendering newsletter emails and previews                                                                                                         |
| [`guardian/ophan`](https://github.com/guardian/ophan) | `/api/newsletters` | Mapping email campaign codes for analytics                                                                                                       |
| [`guardian/ophan-data-lake`](https://github.com/guardian/ophan-data-lake) | `/api/newsletters` | Daily ingest of newsletter data into BigQuery                                                                                                    |
| [`guardian/targeted-experiences`](https://github.com/guardian/targeted-experiences) | `/api/newsletters` | Resolving Braze subscribe attribute names                                                                                                        |
| [`guardian/csnx`](https://github.com/guardian/csnx) | Types only (`@guardian/newsletter-types`) | Shared TypeScript types for the API response                                                                                                     |
| [`guardian/interactives`](https://github.com/guardian/interactives) | `/api/newsletters` | Used by the `create-thrasher` project generator CLI to let developers pick a newsletter and pre-populate a new thrasher template with its name, description, and campaign code |

This list reflects what is visible in the `guardian` org and may not be exhaustive. No client in it is known to read `/api/legacy/newsletters`.

## Access

See [Auth and permissions](./auth-and-permissions.md) for how the editorial tool and the read-only API are secured.
