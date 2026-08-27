# Stand migration

The UI is being migrated from [MUI](https://mui.com/) to
[`@guardian/stand`](https://github.com/guardian/stand), the Guardian's design
system for internal tools. Both UIs currently exist in the codebase, selected at
runtime by a feature switch. MUI is still the default; nothing has been removed.

## The feature switch

`switch-stand`, defined in
[`featureSwitches.ts`](../apps/newsletters-ui/src/app/featureSwitches.ts),
defaults to `false`. Opt in with a query param, which persists in
`localStorage`:

```
https://newsletters-tool.local.dev-gutools.co.uk/drafts?switch-stand=true
```

Use `?switch-stand=false` to turn it off.

## What's migrated

- **Done:** top bar, and the create-newsletter wizard (including a new review step).
- **Partial:** the rendering-options and launch wizards use the Stand wizard shell but the old workflow layouts.
- **Not started:** newsletter and draft lists, detail views, JSON editors, edition layouts.

## How the two coexist

Stand versions are parallel files prefixed `Stand*` / `StandRedesign*` (nav,
wizard, step nav, schema form, markdown view, dialogs, issue reports), so the
MUI originals are untouched. Search for `isFeatureSwitchEnabled('switch-stand')`
to find the places that branch on it.

Stand's reset and font CSS is imported globally in
[`main.tsx`](../apps/newsletters-ui/src/main.tsx) for all users.

## Workflow changes

The redesign isn't purely visual.
[`NEWSLETTER_DATA_STAND_REDESIGN`](../libs/newsletter-workflow/src/lib/steps/standRedesignNewsletterData/index.ts)
is a separate `WizardLayout` from `NEWSLETTER_DATA`: it replaces the
`createDraftNewsletter` step (just a name field) with a combined
name/frequency step, adds a new `review` step, and drops `thrasher`. Both
read and write the same draft data, so a draft can be continued in either UI.

## Working on it

- Put new work on migrated screens in the `Stand*` components; only change the MUI equivalents if the old UI needs the fix too.
- Both wizards share the same backend — a change to a form schema or step affects both.
- Keep both e2e create flows passing:
  [`createNewsletterStandRedesign.spec.ts`](../apps/newsletters-e2e/src/ui/createNewsletterStandRedesign.spec.ts)
  (opts in via the switch) and
  [`createNewsletter.spec.ts`](../apps/newsletters-e2e/src/ui/createNewsletter.spec.ts).
- `@guardian/stand` is pinned to an exact version and is pre-1.0 — bump it deliberately.


## Completing the migration
Finishing means migrating the remaining screens, then removing the switch, the
MUI components and theme, the MUI dependencies, and the `StandRedesign` prefixes.
