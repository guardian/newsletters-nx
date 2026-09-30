import type {
	NewsletterCategory,
	Theme,
} from '@newsletters-nx/newsletters-data-client';
import type { Locator, Page } from '@playwright/test';
import { expect } from '@playwright/test';
import { createFixtureDraft } from '../../../helpers/test-fixtures';
import type { NamedNewsletterRef } from './fixtures';
import { Given, Then, When } from './fixtures';

interface FilterConfig {
	param: string;
	values: Record<string, string>;
	activeLabels: [string, string];
}

const filters: Record<string, FilterConfig> = {
	Category: {
		param: 'category',
		values: {
			'Article based': 'article-based',
			'Article based legacy': 'article-based-legacy',
			'Fronts based': 'fronts-based',
			'Manual send': 'manual-send',
			Other: 'other',
		},
		activeLabels: ['Article based', 'Other'],
	},
	Pillar: {
		param: 'pillar',
		values: {
			News: 'news',
			Opinion: 'opinion',
			Culture: 'culture',
			Sport: 'sport',
			Lifestyle: 'lifestyle',
			Features: 'features',
		},
		activeLabels: ['News', 'Sport'],
	},
};

const fixtureNewsletters: Array<{
	name: string;
	category: NewsletterCategory;
	theme?: Theme;
}> = [
	{ name: 'Filter Article News', category: 'article-based', theme: 'news' },
	{ name: 'Filter Fronts Sport', category: 'fronts-based', theme: 'sport' },
	{ name: 'Filter Other No Pillar', category: 'other' },
];

const filterConfig = (filter: string): FilterConfig => {
	const config = filters[filter];
	if (config === undefined) {
		throw new Error(`Unknown filter: ${filter}`);
	}
	return config;
};

const filterValue = (filter: string, label: string): string => {
	const value = filterConfig(filter).values[label];
	if (value === undefined) {
		throw new Error(`Unknown ${filter} option: ${label}`);
	}
	return value;
};

// Rows also have accessible names containing words like "Category", so match
// the Select trigger by role.
const filterControl = (page: Page, filter: string): Locator =>
	page.getByRole('button', { name: new RegExp(`${filter}$`) });

const rowFor = (page: Page, ref: NamedNewsletterRef): Locator =>
	page.locator(`tr[data-href="/drafts/${ref.listId}"]`);

const openAllNewsletters = async (page: Page) => {
	if (new URL(page.url()).pathname !== '/all') {
		await page.goto('/all');
	}
};

const toggleOption = async (page: Page, filter: string, label: string) => {
	const trigger = filterControl(page, filter);
	if ((await trigger.getAttribute('aria-expanded')) !== 'true') {
		await trigger.click();
	}
	await page.getByRole('option', { name: label, exact: true }).click();
};

Given(
	'newsletters exist across multiple pillars and categories',
	async ({ request, namedNewsletters }) => {
		for (const { name, category, theme } of fixtureNewsletters) {
			const listId = await createFixtureDraft(request, {
				name,
				category,
				theme,
			});
			namedNewsletters.refsByName[name] = { kind: 'draft', listId };
		}
	},
);

Given(
	'the editor has active {word} filters',
	async ({ page }, filter: string) => {
		await openAllNewsletters(page);
		for (const label of filterConfig(filter).activeLabels) {
			await toggleOption(page, filter, label);
		}
	},
);

When('the editor opens the All newsletters page', async ({ page }) => {
	await page.goto('/all');
});

When(
	'the editor filters Category to {string} and {string}',
	async ({ page }, firstCategory: string, secondCategory: string) => {
		await openAllNewsletters(page);
		await toggleOption(page, 'Category', firstCategory);
		await toggleOption(page, 'Category', secondCategory);
	},
);

When(
	'the editor sets {word} to {string}',
	async ({ page }, filter: string, label: string) => {
		await openAllNewsletters(page);
		await toggleOption(page, filter, label);
	},
);

When(
	'the editor de-selects the selected {word} filters',
	async ({ page }, filter: string) => {
		for (const label of filterConfig(filter).activeLabels) {
			await toggleOption(page, filter, label);
		}
	},
);

Then('{word} is {string}', async ({ page }, filter: string, value: string) => {
	await expect(filterControl(page, filter)).toContainText(value);
});

Then(
	'{word} is reset to {string}',
	async ({ page }, filter: string, value: string) => {
		await expect(filterControl(page, filter)).toContainText(value);
	},
);

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
	'only rows matching Pillar {string} are shown',
	async ({ page, namedNewsletters }, label: string) => {
		const theme = filterValue('Pillar', label);
		for (const fixture of fixtureNewsletters) {
			const ref = namedNewsletters.refsByName[fixture.name];
			if (ref === undefined) {
				throw new Error(`No fixture newsletter named "${fixture.name}"`);
			}
			const row = rowFor(page, ref);
			if (fixture.theme === theme) {
				await expect(row).toBeVisible();
			} else {
				await expect(row).toHaveCount(0);
			}
		}
		// Other scenarios' rows may be listed too, but each must show this pillar.
		const pillarLabel = new RegExp(`^${label}( \\| .+)?$`);
		for (const row of await page.locator('tr[data-href]').all()) {
			await expect(row.getByText(pillarLabel)).toBeVisible();
		}
	},
);

Then(
	'the Category control shows a truncated selected-values summary',
	async ({ page }) => {
		const control = filterControl(page, 'Category');
		await expect(control).toContainText('Article based');
		await expect(control).toContainText('Other');
		await expect(control.locator('span').first()).toHaveCSS(
			'text-overflow',
			'ellipsis',
		);
	},
);

Then('the URL includes the selected Category values', async ({ page }) => {
	const { param } = filterConfig('Category');
	await expect(page).toHaveURL((url) => {
		const categories = url.searchParams.getAll(param);
		return (
			categories.includes(filterValue('Category', 'Article based')) &&
			categories.includes(filterValue('Category', 'Other'))
		);
	});
});

Then(
	'the URL includes {word} {string}',
	async ({ page }, filter: string, label: string) => {
		const { param } = filterConfig(filter);
		const value = filterValue(filter, label);
		await expect(page).toHaveURL((url) =>
			url.searchParams.getAll(param).includes(value),
		);
	},
);

Then(
	'URL query parameters for the {word} filter are removed',
	async ({ page }, filter: string) => {
		const { param } = filterConfig(filter);
		await expect(page).toHaveURL((url) => !url.searchParams.has(param));
	},
);
