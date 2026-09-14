import { expect } from '@playwright/test';
import { createDraftNewsletter } from '../../../helpers/draft-newsletter';
import { Given, Then, When } from './fixtures';

Given('a draft newsletter exists', async ({ request, draftWorld }) => {
	draftWorld.listId = await createDraftNewsletter(
		request,
		`Stand Switch E2E ${Date.now()}`,
	);
});

Given('the switch-stand flag is off', async ({ page }) => {
	// Full page navigation so `checkFeatureSwitchURLParams` (called at module
	// load) picks up the query param and (re)writes it to localStorage.
	await page.goto('/drafts?switch-stand=false');
});

Given('the switch-stand flag is on', async ({ page }) => {
	await page.goto('/drafts?switch-stand=true');
});

When(
	'an editor turns the switch-stand flag on and opens the newsletter data step',
	async ({ page }) => {
		await page.goto('/drafts/newsletter-data?switch-stand=true');
	},
);

When('an editor opens the newsletter data step', async ({ page }) => {
	// No switch-stand query param here: `checkFeatureSwitchURLParams` only
	// writes params present in the URL, so the flag set by the preceding
	// Given step is left untouched.
	await page.goto('/drafts/newsletter-data');
});

When('an editor opens the all-drafts page', async ({ page }) => {
	await page.goto('/drafts');
});

Then('the Stand wizard shell is displayed', async ({ page }) => {
	// Both wizard variants render their own <nav aria-label="Newsletter
	// creation steps"> step sidebar, so `getByRole('navigation')` alone
	// can't distinguish the shells. Only `<StandLayout>` (rendered when the
	// switch is on AND we're on a wizard route) additionally wraps its top
	// bar nav in a semantic <nav>, via `StandLayout.TopBar` -- identify it by
	// its "Draft newsletters" link, which is unique to `StandMainNav`.
	const topBarNav = page
		.getByRole('navigation')
		.filter({ has: page.getByRole('link', { name: 'Draft newsletters' }) });
	await expect(topBarNav).toBeVisible();
});

Then('the MUI wizard shell is displayed', async ({ page }) => {
	// The MUI shell renders `<Box component="main">`, a landmark the Stand
	// shell never produces, and has no top-bar <nav> landmark (MainNav uses
	// buttons, not links, and isn't wrapped in a <nav> element) -- only the
	// step sidebar <nav> is present.
	const topBarNav = page
		.getByRole('navigation')
		.filter({ has: page.getByRole('link', { name: 'Draft newsletters' }) });
	await expect(topBarNav).toHaveCount(0);
	await expect(page.getByRole('main')).toBeVisible();
});

Then('the Stand navigation is displayed', async ({ page }) => {
	// On non-wizard routes the Stand shell doesn't wrap the nav in a <nav>
	// landmark, so assert on content unique to `StandMainNav` instead: its
	// "Draft newsletters" link (the MUI `MainNav` equivalent is a "Drafts"
	// button, not a link).
	await expect(
		page.getByRole('link', { name: 'Draft newsletters' }),
	).toBeVisible();
});
