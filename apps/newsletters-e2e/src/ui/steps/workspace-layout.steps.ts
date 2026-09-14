import { expect } from '@playwright/test';
import { createDraftNewsletter } from '../../../helpers/draft-newsletter';
import { Given, Then, When } from './fixtures';

Given('a draft newsletter exists', async ({ request, draftWorld }) => {
	draftWorld.listId = await createDraftNewsletter(
		request,
		`Workspace Layout E2E ${Date.now()}`,
	);
});

Given("Editor Erin's workspace uses the classic layout", async ({ page }) => {
	// Full page navigation so `checkFeatureSwitchURLParams` (called at module
	// load) picks up the query param and (re)writes it to localStorage.
	await page.goto('/drafts?switch-stand=false');
});

Given("Editor Erin's workspace uses the modern layout", async ({ page }) => {
	await page.goto('/drafts?switch-stand=true');
});

When(
	'Editor Erin opens the newsletter creation step using the modern layout',
	async ({ page }) => {
		await page.goto('/drafts/newsletter-data?switch-stand=true');
	},
);

When('Editor Erin opens the newsletter creation step', async ({ page }) => {
	// No switch-stand query param here: `checkFeatureSwitchURLParams` only
	// writes params present in the URL, so the layout set by the preceding
	// Given step is left untouched.
	await page.goto('/drafts/newsletter-data');
});

When('Editor Erin opens the drafts overview', async ({ page }) => {
	await page.goto('/drafts');
});

Then(
	'Editor Erin sees the newsletter creation step in the modern layout',
	async ({ page }) => {
		// Both layout variants render their own <nav aria-label="Newsletter
		// creation steps"> step sidebar, so `getByRole('navigation')` alone
		// can't distinguish them. Only the modern layout's top bar additionally
		// wraps its navigation in a semantic <nav> -- identify it by its
		// "Draft newsletters" link, which is unique to the modern navigation.
		const topBarNav = page
			.getByRole('navigation')
			.filter({ has: page.getByRole('link', { name: 'Draft newsletters' }) });
		await expect(topBarNav).toBeVisible();
	},
);

Then(
	'Editor Erin sees the newsletter creation step in the classic layout',
	async ({ page }) => {
		// The classic layout renders a `<main>` landmark the modern layout
		// never produces, and has no top-bar <nav> landmark (its navigation
		// uses buttons, not links, and isn't wrapped in a <nav> element) --
		// only the step sidebar <nav> is present.
		const topBarNav = page
			.getByRole('navigation')
			.filter({ has: page.getByRole('link', { name: 'Draft newsletters' }) });
		await expect(topBarNav).toHaveCount(0);
		await expect(page.getByRole('main')).toBeVisible();
	},
);

Then(
	'Editor Erin sees the drafts overview in the modern layout',
	async ({ page }) => {
		// On non-wizard routes the modern layout doesn't wrap its navigation in
		// a <nav> landmark, so assert on content unique to it instead: its
		// "Draft newsletters" link (the classic layout's equivalent is a
		// "Drafts" button, not a link).
		await expect(
			page.getByRole('link', { name: 'Draft newsletters' }),
		).toBeVisible();
	},
);
