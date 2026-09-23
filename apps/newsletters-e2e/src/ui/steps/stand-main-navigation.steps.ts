import type { Page } from '@playwright/test';
import { expect } from '@playwright/test';
import type { DataTable } from 'playwright-bdd';
import { Given, Then, When } from './fixtures';

// The Stand main nav's links aren't wrapped in a <nav> landmark on
// non-wizard routes (see workspace-layout.steps.ts), so links are located by
// their accessible name across the whole page rather than scoped to a nav
// landmark.
const navLink = (page: Page, label: string) =>
	page.getByRole('link', { name: label });

Given(
	'an editor goes to the tool with the stand design switch on',
	async ({ page }) => {
		await page.goto('/drafts?switch-stand=true');
	},
);

Then(
	'they should see the following navigation',
	async ({ page }, table: DataTable) => {
		const rows = table.hashes();
		const expectedLabels = rows.map((row) => row['label'] ?? '');

		// The nav renders after the initial route navigation completes, so
		// wait for its last expected link before reading link order below.
		await navLink(
			page,
			expectedLabels[expectedLabels.length - 1] ?? '',
		).waitFor();

		const allLinkLabels = await page.getByRole('link').allTextContents();
		const actualOrder = allLinkLabels.filter((label) =>
			expectedLabels.includes(label),
		);
		expect(actualOrder).toEqual(expectedLabels);

		for (const { label, path } of rows) {
			await expect(navLink(page, label ?? '')).toHaveAttribute(
				'href',
				path ?? '',
			);
		}
	},
);

When(/^they go to the (.+) page$/, async ({ page }, label: string) => {
	await navLink(page, label).click();
});

Then(/^they should be on the (.+) page$/, async ({ page }, label: string) => {
	const path = await navLink(page, label).getAttribute('href');
	await expect(page).toHaveURL(new RegExp(`${path ?? ''}$`));
});
