import { expect } from '@playwright/test';
import { createDraftNewsletter } from '../../../helpers/draft-newsletter';
import { Given, Then, When } from './fixtures';

Given(
	'an existing draft newsletter',
	async ({ request, existingDraftNewsletter }) => {
		const name = `E2E test draft ${Date.now()}`;
		existingDraftNewsletter.listId = await createDraftNewsletter(
			request,
			name,
		);
		existingDraftNewsletter.name = name;
	},
);

Given("an editor's workspace uses the Legacy design", async ({ page }) => {
	// Full page navigation so `checkFeatureSwitchURLParams` (called at module
	// load) picks up the query param and (re)writes it to localStorage.
	await page.goto('/drafts?switch-stand=false');
});

Given("an editor's workspace uses the Stand design", async ({ page }) => {
	await page.goto('/drafts?switch-stand=true');
});

When(
	'the editor opens the newsletter creation step using the Stand design',
	async ({ page }) => {
		await page.goto('/drafts/newsletter-data?switch-stand=true');
	},
);

When('the editor opens the newsletter creation step', async ({ page }) => {
	// No switch-stand query param here: `checkFeatureSwitchURLParams` only
	// writes params present in the URL, so the design set by the preceding
	// Given step is left untouched.
	await page.goto('/drafts/newsletter-data');
});

When('the editor opens the drafts overview', async ({ page }) => {
	await page.goto('/drafts');
});

Then(
	'the newsletter creation step is displayed in the Stand design',
	async ({ page }) => {
		// Both design variants render their own <nav aria-label="Newsletter
		// creation steps"> step sidebar, so `getByRole('navigation')` alone
		// can't distinguish them. Only the Stand design's top bar additionally
		// wraps its navigation in a semantic <nav> -- identify it by its
		// "Draft newsletters" link, which is unique to the Stand navigation.
		const topBarNav = page
			.getByRole('navigation')
			.filter({ has: page.getByRole('link', { name: 'Draft newsletters' }) });
		await expect(topBarNav).toBeVisible();
	},
);

Then(
	'the newsletter creation step is displayed in the Legacy design',
	async ({ page }) => {
		// The Legacy design renders a `<main>` landmark the Stand design never
		// produces, and has no top-bar <nav> landmark (its navigation uses
		// buttons, not links, and isn't wrapped in a <nav> element) -- only the
		// step sidebar <nav> is present.
		const topBarNav = page
			.getByRole('navigation')
			.filter({ has: page.getByRole('link', { name: 'Draft newsletters' }) });
		await expect(topBarNav).toHaveCount(0);
		await expect(page.getByRole('main')).toBeVisible();
	},
);

Then(
	'the drafts overview is displayed in the Stand design',
	async ({ page }) => {
		// On non-wizard routes the Stand design doesn't wrap its navigation in
		// a <nav> landmark, so assert on content unique to it instead: its
		// "Draft newsletters" link (the Legacy design's equivalent is a
		// "Drafts" button, not a link).
		await expect(
			page.getByRole('link', { name: 'Draft newsletters' }),
		).toBeVisible();
	},
);
