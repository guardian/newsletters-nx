import type { Page } from '@playwright/test';
import { expect } from '@playwright/test';
import { Given, Then, When } from './fixtures';

interface SavedLayout {
	groups: Array<{ title: string; newsletters: string[] }>;
}

const savedLayouts = new WeakMap<Page, SavedLayout[]>();

const addArea = (page: Page) =>
	page.getByRole('region', { name: 'Add newsletters', exact: true });

Given(
	'the editor is editing the layout for edition {string} with empty sections {string} and {string}, launched newsletters {string} and {string} and a cancelled newsletter {string}',
	async (
		{ page },
		edition: string,
		firstSection: string,
		secondSection: string,
		first: string,
		second: string,
		cancelled: string,
	) => {
		const saved: SavedLayout[] = [];
		savedLayouts.set(page, saved);
		const layout: SavedLayout = {
			groups: [
				{ title: firstSection, newsletters: [] },
				{ title: secondSection, newsletters: [] },
			],
		};
		const newsletters = [
			{ name: first, status: 'live' },
			{ name: second, status: 'live' },
			{ name: cancelled, status: 'cancelled' },
		].map(({ name, status }) => ({
			identityName: name.toLowerCase(),
			name,
			status,
		}));
		await page.route('**/api/newsletters', async (route) => {
			await route.fulfill({ json: { ok: true, data: newsletters } });
		});
		await page.route(
			new RegExp(`/api/layouts/${edition}$`, 'i'),
			async (route) => {
				if (route.request().method() === 'POST') {
					saved.push(route.request().postDataJSON() as SavedLayout);
				}
				await route.fulfill({ json: { ok: true, data: layout } });
			},
		);
		await page.goto(`/layouts/edit/${edition}`);
		await expect(
			page.getByRole('button', {
				name: 'Save and publish layout',
				exact: true,
			}),
		).toBeVisible();
	},
);

When(
	'the editor opens the add newsletter area for section {string}',
	async ({ page }, title: string) => {
		await page
			.getByRole('region', { name: title, exact: true })
			.getByRole('button', { name: 'Add newsletter', exact: true })
			.click();
	},
);

When(
	'the editor adds {string} to the layout',
	async ({ page }, name: string) => {
		await addArea(page)
			.getByRole('button', { name: `Add ${name}`, exact: true })
			.click();
	},
);

When('the editor closes the add newsletter area', async ({ page }) => {
	await addArea(page)
		.getByRole('button', { name: 'Close', exact: true })
		.click();
});

When(
	'the editor presses the {string} button',
	async ({ page }, label: string) => {
		await page.getByRole('button', { name: label, exact: true }).click();
	},
);

Then(
	'{string} is listed in section {string}',
	async ({ page }, name: string, title: string) => {
		await expect(
			page
				.getByRole('region', { name: title, exact: true })
				.getByRole('button', { name: `Remove ${name}`, exact: true }),
		).toBeVisible();
	},
);

Then('the add newsletter area is still open', async ({ page }) => {
	await expect(addArea(page)).toBeVisible();
});

Then(
	'only {int} add newsletter area is open',
	async ({ page }, count: number) => {
		await expect(addArea(page)).toHaveCount(count);
	},
);

Then('no add newsletter area is open', async ({ page }) => {
	await expect(addArea(page)).toHaveCount(0);
});

Then(
	'{string} is offered in the add newsletter area',
	async ({ page }, name: string) => {
		await expect(
			addArea(page).getByRole('button', { name: `Add ${name}`, exact: true }),
		).toBeVisible();
	},
);

Then(
	'{string} is not offered in the add newsletter area',
	async ({ page }, name: string) => {
		await expect(addArea(page)).toBeVisible();
		await expect(
			addArea(page).getByRole('button', { name: `Add ${name}`, exact: true }),
		).toHaveCount(0);
	},
);

Then(
	'the layout for edition {string} is saved with {string} in section {string}',
	async ({ page }, _edition: string, identityName: string, title: string) => {
		await expect
			.poll(() => savedLayouts.get(page)?.length ?? 0)
			.toBeGreaterThan(0);
		const [saved] = savedLayouts.get(page) ?? [];
		expect(saved?.groups.find((g) => g.title === title)?.newsletters).toEqual([
			identityName,
		]);
	},
);

Then('the stored layout is unchanged', async ({ page }) => {
	await page.waitForLoadState('networkidle');
	expect(savedLayouts.get(page) ?? []).toHaveLength(0);
});
