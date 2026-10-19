import type { EditionId } from '@newsletters-nx/newsletters-data-client';
import type { Page } from '@playwright/test';
import { expect } from '@playwright/test';
import type { DataTable } from 'playwright-bdd';
import { createBdd } from 'playwright-bdd';
import { test } from './fixtures';

const { Given, Then, When } = createBdd(test, {
	tags: '@feature-rename-section-in-layout',
});

const sectionRegionLocator = (page: Page, sectionName: string) => {
	return page.getByRole('region', { name: sectionName, exact: true });
};

const sectionTitleInputLocator = (page: Page, sectionName: string) => {
	return sectionRegionLocator(page, sectionName).getByRole('textbox', {
		name: 'Section title',
	});
};

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

Given(
	'the editor is editing the layout for the {edition} edition',
	async ({ page }, edition: EditionId) => {
		await page.goto(`/layouts/edit/${edition}`);
	},
);

When(
	'the editor renames the {string} section to {string}',
	async ({ page }, section: string, newName: string) => {
		await sectionTitleInputLocator(page, section).fill(newName);
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

Then(
	'a section named {string} should be visible',
	async ({ page }, sectionName: string) => {
		await expect(sectionRegionLocator(page, sectionName)).toBeVisible();
	},
);

Then(
	'a section named {string} should not be visible',
	async ({ page }, sectionName: string) => {
		await expect(sectionRegionLocator(page, sectionName)).not.toBeAttached();
	},
);
