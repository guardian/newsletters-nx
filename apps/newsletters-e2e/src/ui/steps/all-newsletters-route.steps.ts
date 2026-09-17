import type { Page } from '@playwright/test';
import { expect } from '@playwright/test';
import { Then, When } from './fixtures';

const API_BASE = process.env['API_URL'] ?? 'http://localhost:3000';

/**
 * Only the Stand shell (`StandLayout`) wraps the top bar's links in a <nav>
 * landmark; the Legacy shell's navigation is buttons in a <header>, and the
 * Stand design outside the Stand shell renders its links without the
 * landmark. Filtering by a link that only the Stand navigation has therefore
 * identifies the shell, not just the design.
 */
const standShellNav = (page: Page) =>
	page
		.getByRole('navigation')
		.filter({ has: page.getByRole('link', { name: 'Draft newsletters' }) });

const allNewslettersTable = (page: Page) =>
	page.getByRole('grid', { name: 'All newsletters' });

When(
	'the editor opens the All Newsletters view',
	async ({ page, apiRequestLog }) => {
		// Only this navigation's API calls are of interest; drop anything the
		// preceding steps' pages did.
		apiRequestLog.reset();
		// A full page load, so `checkFeatureSwitchURLParams` runs and the router
		// is built from the design the preceding step chose. No switch-stand
		// param here: that would set the design rather than read the chosen one.
		await page.goto('/all');
	},
);

Then(
	'the All Newsletters view is displayed inside the Stand shell',
	async ({ page }) => {
		await expect(allNewslettersTable(page)).toBeVisible();
		await expect(standShellNav(page)).toBeVisible();
	},
);

Then(
	'the launched and the draft newsletters are loaded at the same time',
	async ({ page, apiRequestLog }) => {
		await expect(allNewslettersTable(page)).toBeVisible();

		const { events } = apiRequestLog;
		const startedBoth = ['/api/newsletters', '/api/drafts'].map((path) =>
			events.findIndex(
				(event) => event.type === 'started' && event.path === path,
			),
		);
		expect(
			startedBoth,
			'both list endpoints should be requested',
		).not.toContain(-1);

		// Requested in parallel rather than one after the other: neither request
		// had finished by the time the later of the two was sent.
		const firstFinished = events.findIndex(
			(event) =>
				event.type === 'finished' &&
				['/api/newsletters', '/api/drafts'].includes(event.path),
		);
		expect(
			Math.max(...startedBoth),
			'the second list request should be sent before the first one finishes',
		).toBeLessThan(firstFinished);
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
