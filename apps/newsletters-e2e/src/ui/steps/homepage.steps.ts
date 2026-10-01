import type { Locator, Page } from '@playwright/test';
import { expect } from '@playwright/test';
import {
	createFixtureDraft,
	createFixtureNewsletter,
} from '../../../helpers/test-fixtures';
import { Given, Then, When } from './fixtures';

// Each card is a <section aria-label=...>, i.e. a "region" landmark.
const card = (page: Page, title: string): Locator =>
	page.getByRole('region', { name: title });

const cardRows = (page: Page, title: string): Locator =>
	card(page, title).locator('tr[data-href]');

When('the editor opens the homepage', async ({ page }) => {
	// No switch-stand param, so the design chosen earlier is kept.
	await page.goto('/');
});

Given(
	/^(\d+) (draft|launched) newsletters named "([^"]+)" with a number suffix, oldest first$/,
	async (
		{ request, namedNewsletters },
		count: string,
		kind: string,
		prefix: string,
	) => {
		const total = Number(count);
		// Timestamps start in the future so these always outrank any
		// newsletters left over from other scenarios.
		const base = Date.now() + 24 * 60 * 60 * 1000;
		for (let n = 1; n <= total; n++) {
			const name = `${prefix} ${n}`;
			const meta = { updatedTimestamp: base + n * 1000 };
			if (kind === 'draft') {
				const listId = await createFixtureDraft(request, { name, meta });
				namedNewsletters.refsByName[name] = { kind: 'draft', listId };
			} else {
				const { identityName, listId } = await createFixtureNewsletter(
					request,
					{ name, meta },
				);
				namedNewsletters.refsByName[name] = {
					kind: 'launched',
					identityName,
					listId,
				};
			}
		}
	},
);

Given(
	"the user does not have the 'edit everything' permission to see the homepage action",
	async ({ page }) => {
		// Same approach as wizard-permissions: the dev profile is an admin, so
		// the permissions response is mocked.
		await page.route('**/api/user/permissions', async (route) => {
			await route.fulfill({
				status: 200,
				contentType: 'application/json',
				body: JSON.stringify({
					ok: true,
					data: { editEverything: false, useJsonEditor: false },
				}),
			});
		});
	},
);

When(
	'the editor selects the {string} row',
	async ({ page, namedNewsletters }, name: string) => {
		const ref = namedNewsletters.refsByName[name];
		if (ref === undefined) {
			throw new Error(`No newsletter named "${name}" was created`);
		}
		const href =
			ref.kind === 'draft'
				? `/drafts/${ref.listId}`
				: `/launched/${ref.identityName}`;
		await page.locator(`tr[data-href="${href}"]`).click();
	},
);

When(
	'the editor selects {string} in the {string} card',
	async ({ page }, action: string, title: string) => {
		await card(page, title).getByRole('link', { name: action }).click();
	},
);

Then(
	'the {string} card lists {string}',
	async ({ page }, title: string, name: string) => {
		// Trailing digit guard so "Cap Draft 1" does not match "Cap Draft 16".
		await expect(
			cardRows(page, title).filter({ hasText: new RegExp(`${name}(?!\\d)`) }),
		).toHaveCount(1);
	},
);

Then(
	'the {string} card does not list {string}',
	async ({ page }, title: string, name: string) => {
		// Make sure the card has rendered before asserting absence.
		await expect(card(page, title)).toBeVisible();
		await expect(cardRows(page, title).first()).toBeVisible();
		// Exact word match so "Cap Draft 1" does not match "Cap Draft 16".
		const exactName = new RegExp(`${name}(?!\\d)`);
		await expect(
			cardRows(page, title).filter({ hasText: exactName }),
		).toHaveCount(0);
	},
);

Then(
	'the {string} card lists {int} rows',
	async ({ page }, title: string, count: number) => {
		await expect(cardRows(page, title)).toHaveCount(count);
	},
);

Then(
	'the {string} card lists {string} first',
	async ({ page }, title: string, name: string) => {
		await expect(cardRows(page, title).first()).toContainText(name);
	},
);

Then(
	'the {string} card has no {string} action',
	async ({ page }, title: string, action: string) => {
		await expect(card(page, title)).toBeVisible();
		await expect(cardRows(page, title).first()).toBeVisible();
		await expect(
			card(page, title).getByRole('link', { name: action }),
		).toHaveCount(0);
	},
);

Then(
	'the editor is taken to the {string} newsletter',
	async ({ page }, name: string) => {
		await expect(page).toHaveURL(/\/launched\/|\/drafts\//);
		await expect(page.getByText(name).first()).toBeVisible();
	},
);

Then(
	'the editor is taken to the create-newsletter wizard',
	async ({ page }) => {
		await expect(page).toHaveURL(/\/drafts\/newsletter-data/);
	},
);

Then('the editor is taken to the All Newsletters page', async ({ page }) => {
	await expect(page).toHaveURL(/\/all$/);
	await expect(
		page.getByRole('grid', { name: 'All newsletters' }),
	).toBeVisible();
});

const boxes = async (page: Page, first: string, second: string) => {
	await expect(card(page, first)).toBeVisible();
	await expect(card(page, second)).toBeVisible();
	const a = await card(page, first).boundingBox();
	const b = await card(page, second).boundingBox();
	if (!a || !b) {
		throw new Error('Could not measure the homepage cards');
	}
	return { a, b };
};

Then(
	'the {string} and {string} cards sit side by side',
	async ({ page }, first: string, second: string) => {
		const { a, b } = await boxes(page, first, second);
		expect(a.x + a.width).toBeLessThanOrEqual(b.x + 1);
		expect(Math.abs(a.y - b.y)).toBeLessThan(2);
	},
);

Then(
	'the {string} and {string} cards are stacked',
	async ({ page }, first: string, second: string) => {
		const { a, b } = await boxes(page, first, second);
		expect(a.y + a.height).toBeLessThanOrEqual(b.y + 1);
		expect(Math.abs(a.x - b.x)).toBeLessThan(2);
	},
);

Then('the editor sees the Legacy homepage button grid', async ({ page }) => {
	await expect(
		page.getByRole('button', { name: 'View draft newsletters' }),
	).toBeVisible();
});

Then('the homepage has no {string} card', async ({ page }, title: string) => {
	await expect(card(page, title)).toHaveCount(0);
});
