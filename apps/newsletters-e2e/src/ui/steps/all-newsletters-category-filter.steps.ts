import type { NewsletterCategory } from '@newsletters-nx/newsletters-data-client';
import type { Locator, Page } from '@playwright/test';
import { expect } from '@playwright/test';
import { createFixtureDraft } from '../../../helpers/test-fixtures';
import type { NamedNewsletterRef } from './fixtures';
import { Given, Then, When } from './fixtures';

const categoryParam = 'category';

const categoryValues: Record<string, NewsletterCategory> = {
	'Article based': 'article-based',
	'Article based legacy': 'article-based-legacy',
	'Fronts based': 'fronts-based',
	'Manual send': 'manual-send',
	Other: 'other',
};

const fixtureNewsletters: Array<{
	name: string;
	category: NewsletterCategory;
}> = [
	{ name: 'Category Article Newsletter', category: 'article-based' },
	{ name: 'Category Fronts Newsletter', category: 'fronts-based' },
	{ name: 'Category Other Newsletter', category: 'other' },
];

const categoryControl = (page: Page): Locator =>
	page.getByRole('button', { name: /Category$/ });

const categoryValue = (label: string): NewsletterCategory => {
	const value = categoryValues[label];
	if (value === undefined) {
		throw new Error(`Unknown category label: ${label}`);
	}
	return value;
};

const rowFor = (page: Page, ref: NamedNewsletterRef): Locator =>
	page.locator(`tr[data-href="/drafts/${ref.listId}"]`);

const openAllNewsletters = async (page: Page) => {
	if (new URL(page.url()).pathname !== '/all') {
		await page.goto('/all');
	}
};

const selectCategory = async (page: Page, label: string) => {
	const trigger = categoryControl(page);
	if ((await trigger.getAttribute('aria-expanded')) !== 'true') {
		await trigger.click();
	}
	await page.getByRole('option', { name: label, exact: true }).click();
};

Given(
	'newsletters exist across multiple categories',
	async ({ request, namedNewsletters }) => {
		for (const { name, category } of fixtureNewsletters) {
			const listId = await createFixtureDraft(request, { name, category });
			namedNewsletters.refsByName[name] = { kind: 'draft', listId };
		}
	},
);

Given('the editor has active Category filters', async ({ page }) => {
	await openAllNewsletters(page);
	await selectCategory(page, 'Article based');
	await selectCategory(page, 'Other');
});

When('the editor opens the All newsletters page', async ({ page }) => {
	await page.goto('/all');
});

When(
	'the editor filters Category to {string} and {string}',
	async ({ page }, firstCategory: string, secondCategory: string) => {
		await openAllNewsletters(page);
		await selectCategory(page, firstCategory);
		await selectCategory(page, secondCategory);
	},
);

When(
	'the editor de-selects the selected Category filters',
	async ({ page }) => {
		await selectCategory(page, 'Article based');
		await selectCategory(page, 'Other');
	},
);

Then('Category is {string}', async ({ page }, value: string) => {
	await expect(categoryControl(page)).toContainText(value);
});

Then('Category is reset to {string}', async ({ page }, value: string) => {
	await expect(categoryControl(page)).toContainText(value);
});

Then(
	'only newsletters in Article based or Other are shown',
	async ({ page, namedNewsletters }) => {
		for (const { name, category } of fixtureNewsletters) {
			const ref = namedNewsletters.refsByName[name];
			if (ref === undefined) {
				throw new Error(`No fixture newsletter named "${name}"`);
			}
			const row = rowFor(page, ref);
			if (category === 'article-based' || category === 'other') {
				await expect(row).toBeVisible();
			} else {
				await expect(row).toHaveCount(0);
			}
		}
	},
);

Then(
	'the Category control shows a truncated selected-values summary',
	async ({ page }) => {
		const control = categoryControl(page);
		await expect(control).toContainText('Article based');
		await expect(control).toContainText('Other');
		await expect(control.locator('span').first()).toHaveCSS(
			'text-overflow',
			'ellipsis',
		);
	},
);

Then('the URL includes the selected Category values', async ({ page }) => {
	await expect(page).toHaveURL((url) => {
		const categories = url.searchParams.getAll(categoryParam);
		return (
			categories.includes(categoryValue('Article based')) &&
			categories.includes(categoryValue('Other'))
		);
	});
});

Then(
	'URL query parameters for the Category filter are removed',
	async ({ page }) => {
		await expect(page).toHaveURL((url) => !url.searchParams.has(categoryParam));
	},
);
