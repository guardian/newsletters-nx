import type { Locator, Page } from '@playwright/test';
import { expect } from '@playwright/test';
import { Given, Then, When } from './fixtures';

// Each section is a <section aria-label=...>, i.e. a "region" landmark.
const section = (page: Page, title: string): Locator =>
	page.getByRole('region', { name: title });

const sectionRows = (page: Page, title: string): Locator =>
	section(page, title).locator('tr[data-href]');

When('the editor opens the homepage', async ({ page }) => {
	// No switch-stand param, so the design chosen earlier is kept.
	await page.goto('/');
});

Given('the editor cannot edit newsletters', async ({ page }) => {
	// Same approach as wizard-permissions: the dev profile is an admin, so
	// the permissions response is mocked.
	await page.route('**/api/user/permissions', async (route) => {
		await route.fulfill({
			status: 200,
			contentType: 'application/json',
			body: JSON.stringify({
				ok: true,
				data: { editEverything: false, useJsonEditor: false },
			}),
		});
	});
});

When(
	'the editor selects {string} in the {string} section',
	async ({ page }, action: string, title: string) => {
		await section(page, title).getByRole('link', { name: action }).click();
	},
);

Then(
	'the {string} section lists {string}',
	async ({ page }, title: string, name: string) => {
		await expect(
			sectionRows(page, title).filter({ hasText: name }).first(),
		).toBeVisible();
	},
);

Then(
	'the {string} section does not list {string}',
	async ({ page }, title: string, name: string) => {
		// Wait for the section's table to render (it may legitimately be empty)
		// before asserting absence.
		await expect(section(page, title).getByRole('grid')).toBeVisible();
		await expect(
			sectionRows(page, title).filter({ hasText: name }),
		).toHaveCount(0);
	},
);

Then(
	'the {string} section has no {string} action',
	async ({ page }, title: string, action: string) => {
		await expect(section(page, title).getByRole('grid')).toBeVisible();
		await expect(
			section(page, title).getByRole('link', { name: action }),
		).toHaveCount(0);
	},
);

Then(
	'the editor is taken to the create-newsletter wizard',
	async ({ page }) => {
		await expect(page).toHaveURL(/\/drafts\/newsletter-data/);
	},
);

const boxes = async (page: Page, first: string, second: string) => {
	await expect(section(page, first)).toBeVisible();
	await expect(section(page, second)).toBeVisible();
	const a = await section(page, first).boundingBox();
	const b = await section(page, second).boundingBox();
	if (!a || !b) {
		throw new Error('Could not measure the homepage sections');
	}
	return { a, b };
};

Then(
	'the {string} and {string} sections sit side by side',
	async ({ page }, first: string, second: string) => {
		const { a, b } = await boxes(page, first, second);
		expect(a.x + a.width).toBeLessThanOrEqual(b.x + 1);
		expect(a.y).toBeCloseTo(b.y, 0);
	},
);

Then(
	'the {string} and {string} sections are stacked',
	async ({ page }, first: string, second: string) => {
		const { a, b } = await boxes(page, first, second);
		expect(a.y + a.height).toBeLessThanOrEqual(b.y + 1);
		expect(a.x).toBeCloseTo(b.x, 0);
	},
);

Then('the editor sees the Legacy homepage button grid', async ({ page }) => {
	await expect(
		page.getByRole('button', { name: 'View draft newsletters' }),
	).toBeVisible();
});

Then(
	'the homepage has no {string} section',
	async ({ page }, title: string) => {
		await expect(section(page, title)).toHaveCount(0);
	},
);
