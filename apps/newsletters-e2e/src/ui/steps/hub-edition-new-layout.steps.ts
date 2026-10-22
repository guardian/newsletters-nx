import type { EditionId } from '@newsletters-nx/newsletters-data-client';
import { expect, type Page } from '@playwright/test';
import { createBdd } from 'playwright-bdd';
import { test } from './fixtures';

const { Given, Then, When } = createBdd(test, {
	tags: '@feature-new-edition-layout',
});

const goToEditionViewLayoutPage = async (page: Page, edition: string) => {
	await page.goto(`/layouts/${edition}`);
};

const gotToEditionEditLayoutPage = async (page: Page, edition: string) => {
	await page.goto(`/layouts/edit/${edition}`);
};

Given(
	"there is no stored layout for edition '{edition}'",
	async ({ storedLayouts }, edition: EditionId) => {
		await storedLayouts.delete(edition);
	},
);

Given(
	"the user is viewing the 'view layout' page for edition {string}",
	async ({ page }, edition: string) => {
		await goToEditionViewLayoutPage(page, edition);
	},
);

Given(
	"the user is viewing the 'edit layout' page for edition {string}",
	async ({ page }, edition: string) => {
		await gotToEditionEditLayoutPage(page, edition);
	},
);

When(
	"the user navigates to the 'view layout' page for edition {string}",
	async ({ page }, edition: string) => {
		await goToEditionViewLayoutPage(page, edition);
	},
);

When(
	"the user navigates to the 'edit layout' page for edition {string}",
	async ({ page }, edition: string) => {
		await gotToEditionEditLayoutPage(page, edition);
	},
);

When(
	'the user adds a section named {string} and publishes',
	async ({ page }, sectionName: string) => {
		await page
			.getByRole('button', {
				name: `Add section to the beginning`,
			})
			.click();

		await page
			.getByRole('region', { name: 'Unnamed section' })
			.getByRole('textbox', { name: 'Section title' })
			.fill(sectionName);

		await page.getByRole('button', { name: 'Save and publish layout' }).click();
	},
);

Then(
	'the user will see a message indicating the layout is empty',
	async ({ page }) => {
		await expect(page.getByText('No content available.')).toBeVisible();
	},
);

Then(
	"the user will only see the 'add section to the beginning' and the 'add section to the end' buttons",
	async ({ page }) => {
		await expect(
			page.getByRole('button', { name: 'Add section to the beginning' }),
		).toBeVisible();
		await expect(
			page.getByRole('button', { name: 'Add section to the end' }),
		).toBeVisible();

		await expect(
			page.getByRole('button').filter({ hasText: 'Add section' }),
		).toHaveCount(2);
	},
);

Then(
	"there will be stored layout for edition '{edition}' with a single section named {string}",
	async ({ storedLayouts }, edition: EditionId, sectionName: string) => {
		const layout = await storedLayouts.get(edition);

		expect(layout?.groups).toHaveLength(1);
		expect(layout?.groups[0]?.title).toEqual(sectionName);
	},
);

Then("the user will see a 'Not Found' error message", async ({ page }) => {
	await expect(
		page.getByRole('heading', {
			name: 'The page you are looking for cannot be found',
		}),
	).toBeVisible();
});
