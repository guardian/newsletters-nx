import type {
	NewsletterCategory,
	Theme,
} from '@newsletters-nx/newsletters-data-client';
import type { Locator, Page } from '@playwright/test';
import { expect } from '@playwright/test';
import { createFixtureDraft } from '../../../helpers/test-fixtures';
import type { NamedNewsletterRef } from './fixtures';
import { Given, Then, When } from './fixtures';

interface FixtureNewsletter {
	name: string;
	category: NewsletterCategory;
	theme?: Theme;
}

interface FilterConfig {
	param: string;
	fixtureKey: 'category' | 'theme';
	values: Record<string, string>;
	activeLabels: [string, string];
	// Matches the row's "Pillar | Category" label when it shows one of `labels`.
	rowLabelPattern: (labels: string[]) => RegExp;
}

const anyOf = (labels: string[]) => `(${labels.join('|')})`;
const separator = ' \\| ';

const filters: Record<string, FilterConfig> = {
	Category: {
		param: 'category',
		fixtureKey: 'category',
		values: {
			'Article based': 'article-based',
			'Article based legacy': 'article-based-legacy',
			'Fronts based': 'fronts-based',
			'Manual send': 'manual-send',
			Other: 'other',
		},
		activeLabels: ['Article based', 'Other'],
		// Category is the last part of the label, e.g. "Other" or "Culture | Other".
		rowLabelPattern: (labels) =>
			new RegExp(`(^|${separator})${anyOf(labels)}$`),
	},
	Pillar: {
		param: 'pillar',
		fixtureKey: 'theme',
		values: {
			News: 'news',
			Opinion: 'opinion',
			Culture: 'culture',
			Sport: 'sport',
			Lifestyle: 'lifestyle',
			Features: 'features',
		},
		activeLabels: ['News', 'Sport'],
		// Pillar is the first part of the label, e.g. "News" or "News | Article based".
		rowLabelPattern: (labels) =>
			new RegExp(`^${anyOf(labels)}(${separator}|$)`),
	},
};

const fixtureNewsletters: FixtureNewsletter[] = [
	{ name: 'Filter Article News', category: 'article-based', theme: 'news' },
	{ name: 'Filter Fronts Sport', category: 'fronts-based', theme: 'sport' },
	{ name: 'Filter Other Culture', category: 'other', theme: 'culture' },
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
	'the editor filters {word} to {string} and {string}',
	async ({ page }, filter: string, first: string, second: string) => {
		await openAllNewsletters(page);
		await toggleOption(page, filter, first);
		await toggleOption(page, filter, second);
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

Then(
	'{word} should be {string}',
	async ({ page }, filter: string, value: string) => {
		await expect(filterControl(page, filter)).toContainText(value);
	},
);

Then(
	'{word} is reset to {string}',
	async ({ page }, filter: string, value: string) => {
		await expect(filterControl(page, filter)).toContainText(value);
	},
);

Then(
	'only newsletters in {word} {string} or {string} are shown',
	async (
		{ page, namedNewsletters },
		filter: string,
		first: string,
		second: string,
	) => {
		const config = filterConfig(filter);
		const selected = [filterValue(filter, first), filterValue(filter, second)];
		for (const fixture of fixtureNewsletters) {
			const ref = namedNewsletters.refsByName[fixture.name];
			if (ref === undefined) {
				throw new Error(`No fixture newsletter named "${fixture.name}"`);
			}
			const row = rowFor(page, ref);
			const value = fixture[config.fixtureKey];
			if (value !== undefined && selected.includes(value)) {
				await expect(row).toBeVisible();
			} else {
				await expect(row).toHaveCount(0);
			}
		}
		// Other scenarios' rows may be listed too, but each must match the filter.
		const rowLabel = config.rowLabelPattern([first, second]);
		for (const row of await page.locator('tr[data-href]').all()) {
			await expect(row.getByText(rowLabel)).toBeVisible();
		}
	},
);

Then(
	'the {word} control shows a truncated selected-values summary',
	async ({ page }, filter: string) => {
		const control = filterControl(page, filter);
		for (const label of filterConfig(filter).activeLabels) {
			await expect(control).toContainText(label);
		}
		await expect(control.locator('span').first()).toHaveCSS(
			'text-overflow',
			'ellipsis',
		);
	},
);

Then(
	'the URL includes the selected {word} values',
	async ({ page }, filter: string) => {
		const { param, activeLabels } = filterConfig(filter);
		const expected = activeLabels.map((label) => filterValue(filter, label));
		await expect(page).toHaveURL((url) => {
			const values = url.searchParams.getAll(param);
			return expected.every((value) => values.includes(value));
		});
	},
);

Then(
	'URL query parameters for the {word} filter are removed',
	async ({ page }, filter: string) => {
		const { param } = filterConfig(filter);
		await expect(page).toHaveURL((url) => !url.searchParams.has(param));
	},
);
