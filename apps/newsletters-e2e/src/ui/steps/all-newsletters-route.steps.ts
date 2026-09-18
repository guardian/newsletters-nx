import type { Page } from '@playwright/test';
import { expect } from '@playwright/test';
import { Then, When } from './fixtures';

const API_BASE = process.env['API_URL'] ?? 'http://localhost:3000';

// Only the Stand shell's top bar wraps its nav links in a <nav> landmark;
// filtering by a Stand-only link identifies the shell, not just the design.
const standShellNav = (page: Page) =>
	page
		.getByRole('navigation')
		.filter({ has: page.getByRole('link', { name: 'Draft newsletters' }) });

const allNewslettersTable = (page: Page) =>
	page.getByRole('grid', { name: 'All newsletters' });

When('the editor opens the All Newsletters view', async ({ page }) => {
	// No switch-stand param: that would set the design rather than read it.
	await page.goto('/all');
});

Then(
	'the All Newsletters view is displayed inside the Stand shell',
	async ({ page }) => {
		await expect(allNewslettersTable(page)).toBeVisible();
		await expect(standShellNav(page)).toBeVisible();
	},
);

Then(
	'the All Newsletters view accounts for every newsletter from both',
	async ({ page, request }) => {
		const counts = await Promise.all(
			['api/newsletters', 'api/drafts'].map(async (path) => {
				const response = await request.get(`${API_BASE}/${path}`);
				const body = (await response.json()) as { data: unknown[] };
				return body.data.length;
			}),
		);
		const [launchedCount = 0, draftCount = 0] = counts;

		// Otherwise a view showing only one source could still pass.
		expect(
			launchedCount,
			'expected launched newsletters to exist',
		).toBeGreaterThan(0);
		expect(draftCount, 'expected draft newsletters to exist').toBeGreaterThan(
			0,
		);

		await expect(
			page.getByText(`${launchedCount + draftCount} newsletters`),
		).toBeVisible();
	},
);

Then('the All Newsletters view is not available', async ({ page }) => {
	await expect(allNewslettersTable(page)).toHaveCount(0);
});

Then(
	'the launched newsletters overview still lists the launched newsletters',
	async ({ page }) => {
		await page.goto('/launched');
		await expect(
			page.getByRole('heading', { name: 'View launched newsletters' }),
		).toBeVisible();
		await expect(page.locator('table tbody tr').first()).toBeVisible();
	},
);

Then(
	'the drafts overview still lists the draft newsletters',
	async ({ page }) => {
		await page.goto('/drafts');
		await expect(
			page.getByRole('heading', { name: 'View draft newsletters' }),
		).toBeVisible();
		await expect(page.locator('table tbody tr').first()).toBeVisible();
	},
);

Then(
	'the Legacy navigation keeps its Launched and Drafts entries',
	async ({ page }) => {
		const header = page.locator('header');
		await expect(
			header.getByRole('button', { name: 'Launched' }),
		).toBeVisible();
		await expect(header.getByRole('button', { name: 'Drafts' })).toBeVisible();
	},
);

Then(
	'the Legacy navigation does not offer All Newsletters',
	async ({ page }) => {
		await expect(
			page.locator('header').getByRole('button', { name: 'All newsletters' }),
		).toHaveCount(0);
		await expect(
			page.getByRole('link', { name: 'All newsletters' }),
		).toHaveCount(0);
	},
);
