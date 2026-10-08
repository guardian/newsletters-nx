import type { Page } from '@playwright/test';
import { expect } from '@playwright/test';
import { Given, Then, When } from './fixtures';

const layoutAction = (page: Page, name: string) =>
	page
		.getByRole('button', { name, exact: true })
		.or(page.getByRole('link', { name, exact: true }));

Given(
	'the editor is viewing the layout for region {string} in read-only mode',
	async ({ page }, edition: string) => {
		await page.route(`**/api/layouts/${edition}`, async (route) => {
			await route.fulfill({ json: { ok: true, data: { groups: [] } } });
		});
		await page.goto(`/layouts/${edition}`);
		await expect(layoutAction(page, 'Edit layout')).toBeVisible();
	},
);

const regionNames: Record<string, string> = {
	UK: 'United Kingdom',
	US: 'United States',
	AU: 'Australia',
	INT: 'International',
	EUR: 'Europe',
};

When('the editor chooses to edit the layout', async ({ page }) => {
	await layoutAction(page, 'Edit layout').click();
});

Then(
	'the editor is viewing the edit page at {string}',
	async ({ page }, path: string) => {
		await expect(page).toHaveURL((url) => url.pathname === path);
		const edition = path.split('/').pop()?.toUpperCase();
		await expect(
			page.getByRole('heading', {
				name: (edition && regionNames[edition]) ?? `Edit Layout for ${edition}`,
				exact: true,
			}),
		).toBeVisible();
	},
);

Then('the {string} button is visible', async ({ page }, name: string) => {
	await expect(layoutAction(page, name)).toBeVisible();
});

Then('the {string} button is not visible', async ({ page }, name: string) => {
	await expect(layoutAction(page, name)).toBeHidden();
});

Then('the edit history controls are not visible', async ({ page }) => {
	for (const name of ['Undo', 'Redo', 'Reset']) {
		await expect(page.getByRole('button', { name, exact: true })).toBeHidden();
	}
});

Then('a content box is displayed beneath the top section', async ({ page }) => {
	const header = page
		.locator('header')
		.filter({ has: page.getByRole('heading', { name: 'United Kingdom' }) });
	const contentBox = header.locator('xpath=following-sibling::*[1]');

	await expect(contentBox).toBeVisible();
	await expect(contentBox).toContainText(
		'No content available. Click on "Edit layout" to add content.',
	);
});

Then('the content box shows {string}', async ({ page }, text: string) => {
	await expect(page.getByText(text, { exact: true })).toBeVisible();
});
