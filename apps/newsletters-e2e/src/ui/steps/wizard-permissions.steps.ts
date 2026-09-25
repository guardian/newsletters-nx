import { expect } from '@playwright/test';
import { Given, Then, When } from './fixtures';

Given(
	"the user does not have the 'edit everything' permission",
	async ({ page }) => {
		// NOTE: We are mocking the network response here rather than testing this fully end-to-end.
		// Currently, the E2E test environment boots with USE_DEVELOPER_PROFILE=true, which forces
		// the backend to treat all requests as coming from an admin user. Until the test setup is
		// updated to allow impersonating standard users via JWT headers, we intercept the API call
		// to simulate the 403 rejection.
		await page.route('**/api/currentstep', async (route) => {
			await route.fulfill({
				status: 403,
				contentType: 'application/json',
				body: JSON.stringify({
					errorMessage:
						'You do not have permissions for the Newsletter tool. Please contact Central Production if you need permission.',
					currentStepId: 'intro',
					hasPersistentError: true,
				}),
			});
		});
	},
);

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
			'You do not have permissions for the Newsletter tool. Please contact Central Production if you need permission.',
		);
	},
);

Then('the user can still access the main navigation', async ({ page }) => {
	// Asserts that the application shell hasn't crashed and the user isn't trapped
	const standNav = page
		.getByRole('navigation')
		.filter({ has: page.getByRole('link', { name: 'Draft newsletters' }) });
	await expect(standNav).toBeVisible();
	await expect(
		page.getByRole('link', { name: 'Draft newsletters' }),
	).toBeVisible();
});
