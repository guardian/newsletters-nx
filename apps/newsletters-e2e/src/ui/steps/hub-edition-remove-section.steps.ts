import type { EditionId } from '@newsletters-nx/newsletters-data-client';
import type { Page } from '@playwright/test';
import { expect } from '@playwright/test';
import type { DataTable } from 'playwright-bdd';
import { createBdd } from 'playwright-bdd';
import { test } from './fixtures';

const { Given, Then, When } = createBdd(test, {
	tags: '@feature-remove-section-from-layout',
});

const sectionRegionLocator = (page: Page, sectionName: string) => {
	return page.getByRole('region', { name: sectionName, exact: true });
};
const removeSectionButtonLocator = (page: Page, sectionName: string) => {
	const region = sectionRegionLocator(page, sectionName);
	return region.getByRole('button', { name: 'Delete section' });
};

const removeSectionDialogLocator = (page: Page) => {
	return page.getByRole('dialog', {
		name: 'Are you sure you want to delete this section?',
	});
};

const confirmRemoveSectionButtonLocator = (page: Page) => {
	return removeSectionDialogLocator(page).getByRole('button', {
		name: 'Confirm deletion',
	});
};

const cancelRemoveSectionButtonLocator = (page: Page) => {
	return removeSectionDialogLocator(page).getByRole('button', {
		name: 'Cancel',
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

When(
	'the editor removes the {string} section',
	async ({ page }, section: string) => {
		await removeSectionButtonLocator(page, section).click();
		await confirmRemoveSectionButtonLocator(page).click();
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
	'the {string} section should not be visible',
	async ({ page }, section: string) => {
		await expect(sectionRegionLocator(page, section)).not.toBeAttached();
	},
);

Given(
	'the editor is editing the layout for the {edition} edition',
	async ({ page }, edition: EditionId) => {
		// Implement the step to navigate to the specified edition layout page
		await page.goto(`/layouts/edit/${edition}`);
	},
);

When(
	'the editor requests removal of the {string} section',
	async ({ page }, section: string) => {
		await removeSectionButtonLocator(page, section).click();
	},
);

Then('the editor is asked to confirm removal', async ({ page }) => {
	await expect(removeSectionDialogLocator(page)).toBeVisible();
});

When('the editor confirms removal', async ({ page }) => {
	await confirmRemoveSectionButtonLocator(page).click();
});
When('the editor cancels removal', async ({ page }) => {
	await cancelRemoveSectionButtonLocator(page).click();
});

Then(
	'the {string} section is not shown on the page',
	async ({ page }, sectionName: string) => {
		await expect(sectionRegionLocator(page, sectionName)).not.toBeVisible();
	},
);
Then(
	'the {string} section remains on the page',
	async ({ page }, sectionName: string) => {
		await expect(sectionRegionLocator(page, sectionName)).toBeVisible();
	},
);
