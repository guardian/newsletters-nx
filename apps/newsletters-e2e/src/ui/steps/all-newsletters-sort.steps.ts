import type { Page } from '@playwright/test';
import { expect } from '@playwright/test';
import { createFixtureDraft } from '../../../helpers/test-fixtures';
import type { NamedNewsletterRef } from './fixtures';
import { Given, Then, When } from './fixtures';

const sortParam = 'sort';
const sortValues: Record<string, string> = {
	'Most recent': 'most-recent',
	'Newsletter name': 'newsletter-name',
};

const sortValue = (label: string): string => {
	const value = sortValues[label];
	if (value === undefined) {
		throw new Error(`Unknown sort option: ${label}`);
	}
	return value;
};

const sortControl = (page: Page) =>
	page.getByRole('button', { name: /Sort by$/ });

const hrefForName = (
	namedNewsletters: Record<string, NamedNewsletterRef>,
	name: string,
) => {
	const ref = namedNewsletters[name];
	if (ref === undefined) {
		throw new Error(`No newsletter named "${name}"`);
	}
	return ref.kind === 'draft'
		? `/drafts/${ref.listId}`
		: `/launched/${ref.identityName}`;
};

const expectOrder = async (
	page: Page,
	namedNewsletters: Record<string, NamedNewsletterRef>,
	expectedOrder: string[],
) => {
	const hrefs = await page
		.locator('tr[data-href]')
		.evaluateAll((rows) =>
			rows.map((row) => row.getAttribute('data-href') ?? ''),
		);
	const indices = expectedOrder.map((name) =>
		hrefs.indexOf(hrefForName(namedNewsletters, name)),
	);
	for (let index = 1; index < indices.length; index += 1) {
		expect(indices[index]).toBeGreaterThan(indices[index - 1] ?? -1);
	}
};

const chooseSort = async (page: Page, label: string) => {
	const trigger = sortControl(page);
	if ((await trigger.getAttribute('aria-expanded')) !== 'true') {
		await trigger.click();
	}
	await page.getByRole('option', { name: label, exact: true }).click();
};

Given(
	'newsletters with different last-updated dates are available',
	async ({ request, namedNewsletters }) => {
		const newsletters = [
			{ name: 'Alpha Digest', updatedTimestamp: 1_000 },
			{ name: 'Zeta Weekly', updatedTimestamp: 2_000 },
			{ name: 'Morning Briefing', updatedTimestamp: 3_000 },
		];

		for (const newsletter of newsletters) {
			const listId = await createFixtureDraft(request, {
				name: newsletter.name,
				meta: { updatedTimestamp: newsletter.updatedTimestamp },
			});
			namedNewsletters.refsByName[newsletter.name] = {
				kind: 'draft',
				listId,
			};
		}
	},
);

Given('the URL contains a valid sort value', async ({ page }) => {
	await page.goto(`/all?${sortParam}=newsletter-name`);
});

When(
	'the editor changes "Sort by" to {string}',
	async ({ page }, value: string) => {
		await chooseSort(page, value);
	},
);

When('the editor reloads the All newsletters page', async ({ page }) => {
	await page.reload();
});

Then('Sort by should be {string}', async ({ page }, value: string) => {
	await expect(sortControl(page)).toContainText(value);
});

Then(
	'the "Sort by" control is pre-populated from the URL',
	async ({ page }) => {
		await expect(sortControl(page)).toContainText('Newsletter name');
	},
);

Then(
	'rows are reordered by {string}',
	async ({ page, namedNewsletters }, value: string) => {
		const expectedOrder =
			value === 'Newsletter name'
				? ['Alpha Digest', 'Morning Briefing', 'Zeta Weekly']
				: ['Morning Briefing', 'Zeta Weekly', 'Alpha Digest'];
		await expectOrder(page, namedNewsletters.refsByName, expectedOrder);
	},
);

Then(
	'the visible row order matches that state',
	async ({ page, namedNewsletters }) => {
		const expectedOrder = ['Alpha Digest', 'Morning Briefing', 'Zeta Weekly'];
		await expectOrder(page, namedNewsletters.refsByName, expectedOrder);
	},
);

Then('the URL includes the selected sort order', async ({ page }) => {
	const selectedSort = await sortControl(page).innerText();
	await expect(page).toHaveURL(
		(url) => url.searchParams.get(sortParam) === sortValue(selectedSort),
	);
});
