import type { Locator, Page } from '@playwright/test';
import { expect } from '@playwright/test';
import { Then, When } from './fixtures';

// Each card is a <section aria-label=...>, i.e. a "region" landmark.
const card = (page: Page, title: string): Locator =>
	page.getByRole('region', { name: title });

When('the editor opens the homepage', async ({ page }) => {
	// No switch-stand param, so the design chosen earlier is kept.
	await page.goto('/');
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
		expect(a.y).toBeCloseTo(b.y, 0);
	},
);

Then(
	'the {string} and {string} cards are stacked',
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

Then('the homepage has no {string} card', async ({ page }, title: string) => {
	await expect(card(page, title)).toHaveCount(0);
});
