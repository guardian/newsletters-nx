import type { Page } from '@playwright/test';
import { expect } from '@playwright/test';
import type { DataTable } from 'playwright-bdd';
import { Then, When } from './fixtures';

const navLink = (page: Page, label: string) =>
	page.getByRole('navigation').getByRole('link', { name: label });

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

		const actualOrder = await page
			.getByRole('navigation')
			.getByRole('link')
			.allTextContents();
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

When("they use the 'Newsletter' button in the top bar", async ({ page }) => {
	const button = page.getByRole('link', { name: 'Back to dashboard' });
	await button.click();
});

Then('they should see the home page', async ({ page, baseURL }) => {
	expect(baseURL, 'base url not set').toBeDefined();
	await expect(page).toHaveURL(baseURL!);
});

Then(
	'the {string} nav link should not be visible',
	async ({ page }, label: string) => {
		const link = navLink(page, label);
		await expect(link).toHaveCount(0);
	},
);
