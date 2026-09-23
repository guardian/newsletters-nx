import type { Page } from '@playwright/test';
import { expect } from '@playwright/test';
import { Then, When } from './fixtures';

// The Stand main nav's links aren't wrapped in a <nav> landmark on
// non-wizard routes (see workspace-layout.steps.ts), so its items can't be
// scoped by role. Its labels are unique across the page, so read all links
// and filter down to the known nav labels, preserving DOM order.
const standMainNavLabels = [
	'All newsletters',
	'Launched newsletters',
	'Draft newsletters',
	'Email templates',
	'Newsletter layouts',
	'Create new newsletter',
];

const standMainNavLinkNames = async (page: Page) => {
	// `allTextContents()` doesn't wait for the page to render, so wait for a
	// stable nav link first (the Stand shell's nav renders after the initial
	// route navigation completes).
	await page.getByRole('link', { name: 'Draft newsletters' }).waitFor();
	return (await page.getByRole('link').allTextContents()).filter((name) =>
		standMainNavLabels.includes(name),
	);
};

Then(
	'the Stand main navigation lists All Newsletters before Launched newsletters',
	async ({ page }) => {
		const linkNames = await standMainNavLinkNames(page);

		const allNewslettersIndex = linkNames.indexOf('All newsletters');
		const launchedNewslettersIndex = linkNames.indexOf('Launched newsletters');

		expect(allNewslettersIndex).toBeGreaterThanOrEqual(0);
		expect(launchedNewslettersIndex).toBeGreaterThanOrEqual(0);
		expect(allNewslettersIndex).toBeLessThan(launchedNewslettersIndex);
	},
);

When(
	'the editor selects All Newsletters from the Stand main navigation',
	async ({ page }) => {
		await page.getByRole('link', { name: 'All newsletters' }).click();
	},
);
