import { faker } from '@faker-js/faker';
import {
	type EditionId,
	type Layout,
} from '@newsletters-nx/newsletters-data-client';
import { expect } from '@playwright/test';
import { createBdd } from 'playwright-bdd';
import {
	createFixtureLayout,
	deleteFixtureLayout,
} from '../../../helpers/test-fixtures';
import { chunk } from '../../../utils/chunk';
import { test } from './fixtures';

const getEditionIdByName = (edition: string): EditionId => {
	const mapping: Record<string, EditionId> = {
		'United Kingdom': 'UK',
		'United States': 'US',
		Australia: 'AU',
		Europe: 'EUR',
		International: 'INT',
	};

	const editionCode = mapping[edition];
	if (!editionCode) {
		throw new Error(`No edition code found for edition '${edition}'`);
	}
	return editionCode;
};

const { Given, Then, When } = createBdd(test, {
	tags: '@newsletters-hub-landing-page',
});

Given(
	'the editor is viewing the newsletter hub landing page',
	async ({ page }) => {
		await page.goto('/layouts');
	},
);

Given(
	'the {string} edition does not have a layout configured',
	async ({ request }, edition: string) => {
		const editionId = getEditionIdByName(edition);

		await deleteFixtureLayout(request, editionId);
	},
);

Given(
	'the {string} edition has {int} newsletters and {int} groups',
	async ({ request }, edition: string, newsletters: number, groups: number) => {
		const newsletterNames = faker.helpers.uniqueArray(
			faker.word.noun.bind(undefined),
			newsletters,
		);
		const groupNames = faker.helpers.uniqueArray(
			faker.word.noun.bind(undefined),
			groups,
		);
		const chunked = chunk(newsletterNames, groupNames.length);

		const layout: Layout = {
			groups: groupNames.map((title, idx) => ({
				title,
				newsletters: chunked[idx] ?? [],
			})),
		};

		await createFixtureLayout(request, getEditionIdByName(edition), layout);
	},
);

When("the editor clicks the 'all newsletters page' link", async ({ page }) => {
	await page.getByRole('link', { name: 'all newsletter pages' }).click();
});

When(
	'the editor clicks the {string} title',
	async ({ page }, edition: string) => {
		const tileLocator = page
			.getByRole('list', { name: 'Available editions' })
			.getByRole('link', { name: edition });

		await tileLocator.click();
	},
);

Then(
	'the user should be navigated to the all newsletters page on the live site',
	async ({ page }) => {
		await expect
			.poll(() => page.url(), {
				timeout: 5_000,
			})
			.toBe('https://www.theguardian.com/email-newsletters');
	},
);

Then(
	'the user should be navigated to the {string} page',
	async ({ page }, path: string) => {
		await expect.poll(() => page.url(), { timeout: 5_000 }).toContain(path);
	},
);

Then(
	'the {string} tile should display the text {string}',
	async ({ page }, edition: string, text: string) => {
		const tileLocator = page
			.getByRole('list', { name: 'Available editions' })
			.getByRole('link', { name: edition });

		await expect(tileLocator).toContainText(text);
	},
);

When(
	'the editor navigates to the newsletter hub landing page',
	async ({ page }) => {
		await page.goto('/layouts');
	},
);

Then('the page is displayed in the stand design', async ({ page }) => {
	const topBarNav = page
		.getByRole('navigation')
		.filter({ has: page.getByRole('link', { name: 'All newsletters' }) });
	await expect(topBarNav).toBeVisible();
	await expect(
		page.getByRole('heading', { name: 'Newsletters hub layouts', exact: true }),
	).toBeVisible();
});

Then('the page is displayed in the legacy design', async ({ page }) => {
	const topBarNav = page
		.getByRole('navigation')
		.filter({ has: page.getByRole('link', { name: 'Draft newsletters' }) });
	await expect(topBarNav).toHaveCount(0);
	await expect(page.getByRole('main')).toBeVisible();
	await expect(
		page.getByRole('heading', { name: 'Layouts', exact: true }),
	).toBeVisible();
});
