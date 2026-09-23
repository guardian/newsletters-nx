import { expect } from '@playwright/test';
import { Given, Then } from './fixtures';

// Route glob for each data source the All Newsletters view merges; matched
// against the frontend's own relative fetch path (see fetch-api-data.ts),
// not the upstream API origin.
const sourceRoutes: Record<
	'launched newsletters' | 'draft newsletters',
	string
> = {
	'launched newsletters': '**/api/newsletters',
	'draft newsletters': '**/api/drafts',
};

// Error text the loader/view produce for a failed source (see
// `sourceLabels` in AllNewslettersView.tsx) - kept as a literal here so this
// test also catches an accidental wording change in that map.
const failureMessages: Record<
	'launched newsletters' | 'draft newsletters',
	string
> = {
	'launched newsletters': 'Could not load launched newsletters.',
	'draft newsletters': 'Could not load draft newsletters.',
};

Given('the launched newsletters source fails to load', async ({ page }) => {
	await page.route(sourceRoutes['launched newsletters'], async (route) => {
		await route.fulfill({
			status: 500,
			contentType: 'application/json',
			body: JSON.stringify({ ok: false, message: 'Internal error' }),
		});
	});
});

Given('the draft newsletters source fails to load', async ({ page }) => {
	await page.route(sourceRoutes['draft newsletters'], async (route) => {
		await route.fulfill({
			status: 500,
			contentType: 'application/json',
			body: JSON.stringify({ ok: false, message: 'Internal error' }),
		});
	});
});

Then(
	'a non-blocking error says launched newsletters failed to load',
	async ({ page }) => {
		// "Non-blocking": the error and the table of the surviving rows are
		// both visible at once, rather than the error replacing the list.
		await expect(
			page.getByText(failureMessages['launched newsletters']),
		).toBeVisible();
		await expect(
			page.getByRole('grid', { name: 'All newsletters' }),
		).toBeVisible();
	},
);

Then(
	'a non-blocking error says draft newsletters failed to load',
	async ({ page }) => {
		await expect(
			page.getByText(failureMessages['draft newsletters']),
		).toBeVisible();
		await expect(
			page.getByRole('grid', { name: 'All newsletters' }),
		).toBeVisible();
	},
);

Then('the newsletters table has no rows', async ({ page }) => {
	// The view has no dedicated "no results" state: when both sources fail
	// the table itself just renders with a header and no body rows, with the
	// two error messages above it carrying the explanation instead.
	await expect(
		page.getByRole('grid', { name: 'All newsletters' }),
	).toBeVisible();
	await expect(page.locator('tr[data-href]')).toHaveCount(0);
});
