import type { EditionId } from '@newsletters-nx/newsletters-data-client';
import { editionIdSchema } from '@newsletters-nx/newsletters-data-client';
import { expect } from '@playwright/test';
import type { DataTable } from 'playwright-bdd';
import { defineParameterType } from 'playwright-bdd';
import { Given, Then, When } from './fixtures';

defineParameterType({
	name: 'edition',
	regexp: /uk|us|au|int|eur|UK|US|AU|INT|EUR/,
	transformer: (s: string) => editionIdSchema.parse(s.toUpperCase()),
});

Given(
	'the stored layout for the {edition} edition consists of the following sections',
	async ({ storedLayouts }, edition: EditionId, table: DataTable) => {
		await storedLayouts.create(edition, {
			groups: table
				.hashes()
				.map((row) => ({ title: row.title!, newsletters: [] })),
		});
	},
);

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
	'there is only 1 section named {string} in the layout',
	async ({ page }, section: string) => {
		await expect(
			page.getByRole('main').getByRole('heading', { level: 4, name: section }),
		).toHaveCount(1);
	},
);

Then(
	'the stored layout for the {edition} edition should consist of the following sections',
	async ({ storedLayouts }, edition: EditionId, table: DataTable) => {
		const saved = await storedLayouts.get(edition);
		expect(saved?.groups).toEqual(
			table.hashes().map((row) => ({
				title: row.title,
				newsletters: [],
			})),
		);
	},
);

Given(
	'the editor is editing the layout for the {edition} edition',
	async ({ page }, edition: EditionId) => {
		// Implement the step to navigate to the specified edition layout page
		await page.goto(`/layouts/edit/${edition}`);
	},
);
