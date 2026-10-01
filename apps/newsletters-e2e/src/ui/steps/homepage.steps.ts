import type { Locator, Page } from '@playwright/test';
import { expect } from '@playwright/test';
import { Given, Then, When } from './fixtures';

// Each card is a <section aria-label=...>, i.e. a "region" landmark.
const card = (page: Page, title: string): Locator =>
	page.getByRole('region', { name: title });

const cardRows = (page: Page, title: string): Locator =>
	card(page, title).locator('tr[data-href]');

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
	'the editor selects {string} in the {string} card',
	async ({ page }, action: string, title: string) => {
		await card(page, title).getByRole('link', { name: action }).click();
	},
);

Then(
	'the {string} card lists {string}',
	async ({ page }, title: string, name: string) => {
		await expect(
			cardRows(page, title).filter({ hasText: name }).first(),
		).toBeVisible();
	},
);

Then(
	'the {string} card does not list {string}',
	async ({ page }, title: string, name: string) => {
		// Wait for the card to load before asserting absence.
		await expect(cardRows(page, title).first()).toBeVisible();
		await expect(cardRows(page, title).filter({ hasText: name })).toHaveCount(
			0,
		);
	},
);

Then(
	'the {string} card has no {string} action',
	async ({ page }, title: string, action: string) => {
		await expect(card(page, title)).toBeVisible();
		await expect(cardRows(page, title).first()).toBeVisible();
		await expect(
			card(page, title).getByRole('link', { name: action }),
		).toHaveCount(0);
	},
);

Then(
	'the editor is taken to the create-newsletter wizard',
	async ({ page }) => {
		await expect(page).toHaveURL(/\/drafts\/newsletter-data/);
	},
);

Then('the editor is taken to the All Newsletters page', async ({ page }) => {
	await expect(page).toHaveURL(/\/all$/);
	await expect(
		page.getByRole('grid', { name: 'All newsletters' }),
	).toBeVisible();
});

const boxes = async (page: Page, first: string, second: string) => {
	await expect(card(page, first)).toBeVisible();
	await expect(card(page, second)).toBeVisible();
	const a = await card(page, first).boundingBox();
	const b = await card(page, second).boundingBox();
	if (!a || !b) {
		throw new Error('Could not measure the homepage cards');
	}
	return { a, b };
};

Then(
	'the {string} and {string} cards sit side by side',
	async ({ page }, first: string, second: string) => {
		const { a, b } = await boxes(page, first, second);
		expect(a.x + a.width).toBeLessThanOrEqual(b.x + 1);
		expect(Math.abs(a.y - b.y)).toBeLessThan(2);
	},
);

Then(
	'the {string} and {string} cards are stacked',
	async ({ page }, first: string, second: string) => {
		const { a, b } = await boxes(page, first, second);
		expect(a.y + a.height).toBeLessThanOrEqual(b.y + 1);
		expect(Math.abs(a.x - b.x)).toBeLessThan(2);
	},
);

Then('the editor sees the Legacy homepage button grid', async ({ page }) => {
	await expect(
		page.getByRole('button', { name: 'View draft newsletters' }),
	).toBeVisible();
});

Then('the homepage has no {string} card', async ({ page }, title: string) => {
	await expect(card(page, title)).toHaveCount(0);
});
