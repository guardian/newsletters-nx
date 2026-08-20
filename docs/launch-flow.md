# Launch flow

What actually happens when a newsletter is launched — and what the `*CreationStatus` fields do and do not mean.

Launching is the part of the system most often misunderstood, so this section is deliberately literal.

`executeLaunch` ([`libs/newsletter-workflow/src/lib/executeLaunch.ts`](../libs/newsletter-workflow/src/lib/executeLaunch.ts)) runs when the user presses the launch button on the `doLaunch` step. It does four things:

1. **Creates the newsletter record.** `LaunchService.launchDraft` reads the draft, applies defaults and derived fields, spreads the user's edited values over the top, and writes it via `newsletterStorage.create`.
2. **Deletes the draft.** If the delete fails the launch still succeeds and a warning is logged. There is an open `TO DO` in `LaunchService` asking whether drafts should be archived rather than deleted.
3. **Sends three SES emails**, in parallel: `NEWSLETTER_LAUNCH`, `BRAZE_SET_UP_REQUEST` and `CENTRAL_PRODUCTION_TAGS_AND_SIGNUP_PAGE_REQUEST`.
4. **Sets the `*CreationStatus` fields** to `REQUESTED` or `NOT_REQUESTED` based on whether those sends succeeded.

Steps 3 and 4 are deliberately not awaited — the comment in the code explains that the UI should not wait for notification emails before confirming the newsletter exists.

## What `REQUESTED` actually means

**`REQUESTED` means "a notification email was sent". It does not mean the thing was created.**

`brazeCampaignCreationStatus: 'REQUESTED'` means an email asking someone to create a Braze campaign was sent. **The Braze campaign is created manually, by a human**, after reading that email. The same is true of `tagCreationStatus` and `signupPageCreationStatus`: Central Production create the tag and the sign-up page by hand. Nothing in this repo talks to Braze, and nothing in this repo creates a tag or a page.

The email body makes the expectation explicit — the Braze set-up request ends by asking the recipient to come back to the tool and confirm once they have finished:

```tsx
// libs/email-builder/src/lib/components/RequestBrazeSetUpMessage.tsx
<p>
	When you have set up the campaign, please go to{' '}
	<a href={pageEditLink}>this page on the newsletters tool</a> to confirm!
</p>
```

So the statuses track _our_ side of a handoff, not the state of the downstream system.

## Known defect: the statuses are attributed to the wrong emails

> ⚠️ This describes a live bug. It is tracked separately and is **not** fixed by the change that introduced this document.

As currently written, three promises are destructured into two variables:

```ts
// libs/newsletter-workflow/src/lib/executeLaunch.ts
const [brazeRequestEmailResult, tagAndSignUpPageCreationEmailResult] =
	await Promise.all([
		sendEmail('NEWSLETTER_LAUNCH'),
		sendEmail('BRAZE_SET_UP_REQUEST'),
		sendEmail('CENTRAL_PRODUCTION_TAGS_AND_SIGNUP_PAGE_REQUEST'),
	]);
```

The result is that:

- `brazeCampaignCreationStatus` reflects the **`NEWSLETTER_LAUNCH`** email
- `tagCreationStatus` and `signupPageCreationStatus` reflect the **`BRAZE_SET_UP_REQUEST`** email
- the **`CENTRAL_PRODUCTION_TAGS_AND_SIGNUP_PAGE_REQUEST`** result is discarded entirely

The variable names read as though the mapping is correct, which is probably why this has survived. In practice all three sends usually succeed or fail together, so the statuses are usually right by luck.

Update this section when the fix lands.

A second, subtler caveat: `sendEmailNotifications` returns `{ success: true }` _without sending anything_ when notifications are disabled:

```ts
// libs/email-builder/src/lib/service.ts
const { areEmailNotificationsEnabled } = emailEnvInfo;
if (!areEmailNotificationsEnabled) {
	return { success: true };
}
```

That flag comes from `ENABLE_EMAIL_SERVICE`. For the tool the CDK populates it from the per-stage `enableEmailService` SSM parameter, so email sending can be switched off in either stage without a deploy; the read-only API is always passed `'false'`. So a `REQUESTED` status does not guarantee an email left the building — only that nothing failed.

## Requesting a Braze update after launch

Braze values can change after a newsletter is live, which needs a second request to the Braze team. That path starts in [`RenderingOptionsForm.tsx`](../apps/newsletters-ui/src/app/components/RenderingOptionsForm.tsx): when the user ticks the Braze notification option, the form saves the rendering options, then calls `requestNotification(identityName, 'brazeUpdate')`, and **only on success** writes `brazeCampaignCreationStatus: 'REQUESTED'` back.

That maps to `BRAZE_UPDATE_REQUEST` in [`routes/notifications.ts`](../apps/newsletters-api/src/app/routes/notifications.ts), which requires `editNewsletters` permission and rejects the request with a 400 if the newsletter has no `seriesTag` — the series tag is what the Braze campaign pulls content from.

Note the status is set by the _client_ here, unlike at launch where the server sets it.

## email-builder

Notification emails are authored as React components and rendered to static markup:

```tsx
// libs/email-builder/src/lib/components/RequestBrazeSetUpMessage.tsx
const html = renderToStaticMarkup(<RequestBrazeSetUpMessage {...props} />);
```

Each message builder returns `{ subject, html, text }`, and every renderer falls back to the plain-text version if rendering throws, so a component bug degrades the email rather than failing the send. `buildSendEmailCommand` turns that into an SES `SendEmailCommand` with both an HTML and a text body.

Recipients are **not** in the code. They come from the `emailRecipientConfiguration` SSM parameter, read through the cached config helper with a 15-minute max age:

```ts
// libs/email-builder/src/lib/message-config.ts
const {
	draftCreatedRecipients,
	brazeRecipients,
	launchRecipients,
	centralProductionRecipients,
} = JSON.parse(
	await getConfigValue('emailRecipientConfiguration', {
		maxAge: TIME_BETWEEN_RECIPIENT_PARAM_CHECKS,
	}),
) as EmailRecipientConfiguration;
```

Each message id maps to one of those four lists, so mailing lists can be changed in Parameter Store without a deploy. `getMessageConfig` also switches the sender address and the `toolHost` used in email links by stage, so a CODE email links back to CODE. Replies always go to `newsletters@guardian.co.uk`.

The five message ids are `NEW_DRAFT_CREATED`, `NEWSLETTER_LAUNCH`, `BRAZE_SET_UP_REQUEST`, `BRAZE_UPDATE_REQUEST` and `CENTRAL_PRODUCTION_TAGS_AND_SIGNUP_PAGE_REQUEST`.

---

Part of the [newsletters-nx documentation](./README.md).
