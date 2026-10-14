import { expect } from '@playwright/test';
import type { DataTable } from 'playwright-bdd';
import { Then, When } from './fixtures';
import { savedLayouts } from './hub-edition-remove-newsletter.steps';

When(
	'the editor adds a new section to the beginning of the section list',
	async ({ page }) => {
		await page
			.getByRole('button', {
				name: `Add section to the beginning`,
			})
			.click();
	},
);

When(
	'the editor adds a new section to the end of the section list',
	async ({ page }) => {
		await page
			.getByRole('button', {
				name: `Add section to the end`,
			})
			.click();
	},
);

When(
	'the editor adds a new section between the {string} and {string} sections',
	async ({ page }, before: string, after: string) => {
		await page
			.getByRole('button', {
				name: `Add section between ${before} and ${after}`,
			})
			.click();
	},
);
Then(
	'a new section with no name is displayed on the page',
	async ({ page }) => {
		await expect(
			page.getByRole('region', { name: 'Unnamed section' }),
		).toBeVisible();
	},
);

Then(
	'the layout for edition {string} is saved with the following sections',
	async ({ page }, edition: string, table: DataTable) => {
		await expect
			.poll(() => savedLayouts.get(page)?.length ?? 0)
			.toBeGreaterThan(0);
		const [saved] = savedLayouts.get(page) ?? [];

		const expectedSections = table.hashes().map((row) => row.title);

		expect(saved?.groups.map((group) => group.title)).toEqual(expectedSections);
	},
);

Then(
	'there is only 1 section named {string} in the layout',
	async ({ page }, section: string) => {
		await expect(
			page.getByRole('main').getByRole('heading', { level: 4, name: section }),
		).toHaveCount(1);
	},
);

Then(
	'the stored layout for edition {string} consists of the following sections',
	({ page }, edition: string, table: DataTable) => {
		const saved = savedLayouts.get(page)?.[0];
		expect(saved?.groups).toEqual(
			table.hashes().map((row) => ({
				title: row.title,
				newsletters: [],
			})),
		);
	},
);
