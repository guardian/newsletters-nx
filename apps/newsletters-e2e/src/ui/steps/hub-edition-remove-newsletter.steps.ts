import type { Page } from '@playwright/test';
import { expect } from '@playwright/test';
import { Given, Then, When } from './fixtures';
interface SavedLayout {
	groups: Array<{ title: string; newsletters: string[] }>;
}
// Layout bodies POSTed by the page, per page (i.e. per scenario).
const savedLayouts = new WeakMap<Page, SavedLayout[]>();
const identityNameOf = (name: string) => name.toLowerCase();
Given(
	'the editor is editing the layout for region {string} with newsletters {string} and {string} in section {string}',
	async (
		{ page },
		edition: string,
		first: string,
		second: string,
		title: string,
	) => {
		const saved: SavedLayout[] = [];
		savedLayouts.set(page, saved);
		const layout: SavedLayout = {
			groups: [
				{
					title,
					newsletters: [identityNameOf(first), identityNameOf(second)],
				},
			],
		};
		await page.route('**/api/newsletters', async (route) => {
			await route.fulfill({
				json: {
					ok: true,
					data: [first, second].map((name) => ({
						identityName: identityNameOf(name),
						name,
						status: 'live',
					})),
				},
			});
		});
		await page.route(
			new RegExp(`/api/layouts/${edition}$`, 'i'),
			async (route) => {
				if (route.request().method() === 'POST') {
					saved.push(route.request().postDataJSON() as SavedLayout);
					await route.fulfill({ json: { ok: true, data: layout } });
					return;
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
	'the editor removes {string} from the layout',
	async ({ page }, name: string) => {
		await page
			.getByRole('button', { name: `Remove ${name}`, exact: true })
			.click();
	},
);
When('the editor publishes the layout', async ({ page }) => {
	await page
		.getByRole('button', { name: 'Save and publish layout', exact: true })
		.click();
});
When('the editor cancels editing the layout', async ({ page }) => {
	await page.getByRole('button', { name: 'Cancel', exact: true }).click();
});
Then(
	'{string} is no longer listed in the layout',
	async ({ page }, name: string) => {
		await expect(page.getByText(name, { exact: true })).toBeHidden();
	},
);
Then(
	'{string} is still listed in the layout',
	async ({ page }, name: string) => {
		await expect(page.getByText(name, { exact: true })).toBeVisible();
	},
);
Then(
	'the layout for region {string} is saved with only {string} in section {string}',
	async ({ page }, _edition: string, identityName: string, title: string) => {
		await expect
			.poll(() => savedLayouts.get(page)?.length ?? 0)
			.toBeGreaterThan(0);
		const [saved] = savedLayouts.get(page) ?? [];
		expect(saved?.groups).toEqual([{ title, newsletters: [identityName] }]);
	},
);
Then('a success message is shown', async ({ page }) => {
	await expect(page.getByText(/Layout updated/)).toBeVisible();
});
Then('no layout has been saved', async ({ page }) => {
	expect(savedLayouts.get(page) ?? []).toHaveLength(0);
});
