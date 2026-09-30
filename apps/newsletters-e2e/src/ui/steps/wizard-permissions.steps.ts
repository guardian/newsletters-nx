import { expect } from '@playwright/test';
import { Then, When } from './fixtures';

When(
	'the user attempts to start the newsletter creation wizard',
	async ({ page }) => {
		await page.goto('/drafts/newsletter-data');
	},
);

When(
	'the user attempts to edit the existing draft newsletter',
	async ({ page, existingDraftNewsletter }) => {
		// Uses the existing draft fixture to attempt direct URL navigation to a specific newsletter
		await page.goto(
			`/drafts/newsletter-data/${existingDraftNewsletter.listId}`,
		);
	},
);

Then(
	'the user sees the Central Production permission warning',
	async ({ page }) => {
		const alert = page.getByRole('alert');
		await expect(alert).toBeVisible();
		await expect(alert).toContainText(
			'You do not have permissions to create or edit drafts.',
		);
	},
);

Then('the user can still access the main navigation', async ({ page }) => {
	// Asserts that the application shell hasn't crashed and the user isn't trapped
	const standNav = page
		.getByRole('navigation', { name: 'Top bar' })
		.filter({ has: page.getByRole('link', { name: 'All newsletters' }) });
	await expect(standNav).toBeVisible();
	await expect(
		page.getByRole('link', { name: 'All newsletters' }),
	).toBeVisible();
});
