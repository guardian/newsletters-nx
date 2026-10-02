import { expect } from '@playwright/test';
import { Given, Then, When } from './fixtures';

const resetParams = ['search', 'category', 'pillar', 'status', 'sort'];

Given(
	'the editor has active search and filters with {string} results showing',
	async ({ page }, results: string) => {
		const params = new URLSearchParams({
			search: results === 'some' ? 'Filter' : 'NoSuchClearAllNewsletter',
			category: 'article-based',
			pillar: 'news',
			status: 'draft',
			sort: 'newsletter-name',
			'switch-stand': 'true',
		});
		await page.goto(`/all?${params.toString()}`);
		const rows = page.locator('tr[data-href]');
		if (results === 'some') {
			await expect(rows.first()).toBeVisible();
		} else {
			await expect(rows).toHaveCount(0);
			await expect(
				page.getByText('No results found', { exact: true }),
			).toBeVisible();
		}
	},
);

When('the editor selects "Clear all"', async ({ page }) => {
	await page.getByRole('button', { name: 'Clear all', exact: true }).click();
});

Then(
	'URL query parameters for search, filter, and sort are removed',
	async ({ page }) => {
		await expect(page).toHaveURL(
			(url) =>
				resetParams.every((param) => !url.searchParams.has(param)) &&
				url.searchParams.get('switch-stand') === 'true',
		);
	},
);

Then('the default newsletter row order is restored', async ({ page }) => {
	const restoredHrefs = await page
		.locator('tr[data-href]')
		.evaluateAll((rows) => rows.map((row) => row.getAttribute('data-href')));
	await page.reload();
	await expect
		.poll(() =>
			page
				.locator('tr[data-href]')
				.evaluateAll((rows) =>
					rows.map((row) => row.getAttribute('data-href')),
				),
		)
		.toEqual(restoredHrefs);
});
