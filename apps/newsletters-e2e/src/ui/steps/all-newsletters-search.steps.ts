import type { Page } from '@playwright/test';
import { expect } from '@playwright/test';
import { Given, Then, When } from './fixtures';

const searchParam = 'search';

const searchInput = (page: Page) =>
	page.getByRole('searchbox', { name: 'Search' });

const resultCount = (page: Page) => page.getByText(/^\d+ newsletters?$/);

const searchFor = async (page: Page, term: string) => {
	if (new URL(page.url()).pathname !== '/all') {
		await page.goto('/all');
	}
	await searchInput(page).fill(term);
};

Given(
	'the editor has searched for {string}',
	async ({ page }, term: string) => {
		await searchFor(page, term);
	},
);

When('the editor searches for {string}', async ({ page }, term: string) => {
	await searchFor(page, term);
});

When('the editor clears the search term', async ({ page }) => {
	const input = searchInput(page);
	// The clear button is the browser's native search-cancel control, which
	// doesn't seem to have an emlement to target. Click the area where is should
	// show up instead
	const { width, height, paddingRight } = await input.evaluate((el) => {
		const rect = el.getBoundingClientRect();
		return {
			width: rect.width,
			height: rect.height,
			paddingRight: parseFloat(getComputedStyle(el).paddingRight),
		};
	});
	await input.click({
		position: { x: width - paddingRight - 6, y: height / 2 },
	});
});

Then('the search input is empty', async ({ page }) => {
	await expect(searchInput(page)).toHaveValue('');
});

Then('the result count matches the visible rows', async ({ page }) => {
	const rowCount = await page.locator('tr[data-href]').count();
	await expect(resultCount(page)).toHaveText(
		rowCount === 1 ? '1 newsletter' : `${rowCount} newsletters`,
	);
});

Then('the result count is {string}', async ({ page }, text: string) => {
	await expect(resultCount(page)).toHaveText(text);
});

Then('the URL includes the search term', async ({ page }) => {
	const term = await searchInput(page).inputValue();
	expect(term).not.toBe('');
	await expect(page).toHaveURL(
		(url) => url.searchParams.get(searchParam) === term,
	);
});

Then('the URL no longer includes the search term', async ({ page }) => {
	await expect(page).toHaveURL((url) => !url.searchParams.has(searchParam));
});

Then('the editor sees {string}', async ({ page }, text: string) => {
	await expect(page.getByText(text, { exact: true })).toBeVisible();
});
