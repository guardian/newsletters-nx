# How automated tests describe behaviour

The most useful behavioural coverage for contributors is in [`apps/newsletters-e2e`](../../apps/newsletters-e2e). Those Playwright tests show the expected user journeys more directly than the setup README alone.

## Feature-to-test map

| Feature area | Main tests | What they demonstrate |
| --- | --- | --- |
| Draft list and search | [`drafts.spec.ts`](../../apps/newsletters-e2e/src/ui/drafts.spec.ts) | Draft headings, table columns, search, and presence of created drafts |
| Draft creation (legacy wizard) | [`createNewsletter.spec.ts`](../../apps/newsletters-e2e/src/ui/createNewsletter.spec.ts) | End-to-end completion of the older draft wizard for article-based and fronts-based newsletters |
| Draft creation (Stand redesign) | [`createNewsletterStandRedesign.spec.ts`](../../apps/newsletters-e2e/src/ui/createNewsletterStandRedesign.spec.ts) | Current redesigned setup flow, review step, step navigation, and validation |
| Launch-ready launched newsletters | [`launched.spec.ts`](../../apps/newsletters-e2e/src/ui/launched.spec.ts) | Navigating to launched newsletters and opening edit actions |
| Editing launched data | [`editArticleNewsletter.spec.ts`](../../apps/newsletters-e2e/src/ui/editArticleNewsletter.spec.ts), [`editFrontsNewsletter.spec.ts`](../../apps/newsletters-e2e/src/ui/editFrontsNewsletter.spec.ts) | Field-level editing for different newsletter categories |
| Rendering options | [`renderingOptions.spec.ts`](../../apps/newsletters-e2e/src/ui/renderingOptions.spec.ts) | Updating rendering fields and persisting them |
| Layout browsing | [`layouts.spec.ts`](../../apps/newsletters-e2e/src/ui/layouts.spec.ts) | Edition headings, newsletter cards, and links from layouts into launched newsletters |
| Basic navigation | [`navigation.spec.ts`](../../apps/newsletters-e2e/src/ui/navigation.spec.ts) | Top-level menu behaviour |
| API access | [`api/newsletters.spec.ts`](../../apps/newsletters-e2e/src/api/newsletters.spec.ts) | Basic newsletter API retrieval |

## Lower-level tests

Shared libraries also carry important intent:

- [`libs/state-machine/src/lib/*.spec.ts`](../../libs/state-machine/src/lib) verifies generic wizard navigation and response generation.
- [`libs/newsletters-data-client/src/lib/**/*.spec.ts`](../../libs/newsletters-data-client/src/lib) verifies schema compatibility, draft-to-newsletter conversion, and legacy transformation rules.
- [`libs/email-builder/src/lib/**/*.spec.ts`](../../libs/email-builder/src/lib) verifies email message generation used by launch and setup notifications.
- [`cdk/lib/newsletters-tool.test.ts`](../../cdk/lib/newsletters-tool.test.ts) verifies the infrastructure definition.

## What the tests say about current versus legacy behaviour

- The redesigned draft setup flow has its own dedicated Playwright suite and is the best source of truth for the intended future-facing editor experience.
- The older draft wizard still has coverage, which is a sign that it remains supported in code even if it is no longer the preferred path.
- Compatibility with legacy newsletter data is protected by schema and transformation tests in `newsletters-data-client`.
