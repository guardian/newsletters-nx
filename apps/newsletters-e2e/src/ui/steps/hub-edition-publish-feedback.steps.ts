import { expect } from '@playwright/test';
import { createBdd } from 'playwright-bdd';
import { test } from './fixtures';

const { Given, Then } = createBdd(test, {
	tags: '@feature-hub-edition-publish-feedback',
});
Given('an ongoing network error prevents publishing', async ({ page }) => {
	await page.route('**/**/api/layouts/**', async (route, request) => {
		if (request.method() === 'POST') {
			await route.abort('connectionfailed');
		} else {
			await route.continue();
		}
	});
});

Then(
	'the user remains on the edit layout for edition {string}',

	async ({ page }, edition: string) => {
		await expect(page).toHaveURL(new RegExp(`/layouts/edit/${edition}$`, 'i'));
		await expect(
			page.getByRole('button', { name: 'Save and publish layout' }),
		).toBeVisible();
	},
);

Then('an error alert is shown', async ({ page }) => {
	await expect(
		page.getByRole('alertdialog', { name: 'Failed to update' }),
	).toBeVisible();
});

Then('a success alert is shown', async ({ page }) => {
	await expect(
		page.getByRole('alertdialog', { name: 'Layout updated' }),
	).toBeVisible();
});
