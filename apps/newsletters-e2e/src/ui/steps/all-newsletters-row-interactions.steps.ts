import type { Page } from '@playwright/test';
import { expect } from '@playwright/test';
import { Then, When } from './fixtures';

// The row's accessible name includes its pillar/category sub-text as well as
// its title, so matching on the newsletter name alone is enough to find it
// uniquely.
const newsletterRow = (page: Page, name: string) =>
	page.getByRole('row', { name });

When(
	'the editor clicks the {string} row',
	async ({ page }, name: string) => {
		await newsletterRow(page, name).click();
	},
);

// The most Tab presses we'll make while looking for the target row, so a
// keyboard-navigation regression fails the test instead of looping forever.
const maxTabStops = 20;

When(
	'the editor moves keyboard focus to the {string} row',
	async ({ page }, name: string) => {
		const row = newsletterRow(page, name);
		for (let stops = 0; stops < maxTabStops; stops += 1) {
			await page.keyboard.press('Tab');
			if (await row.evaluate((el) => el === document.activeElement)) {
				return;
			}
		}
		// Fails with a clear message if the row was never reached by Tab.
		await expect(row).toBeFocused();
	},
);

When('the editor presses {string}', async ({ page }, key: string) => {
	await page.keyboard.press(key);
});

Then(
	'the editor sees the detail page for {string}',
	async ({ page }, name: string) => {
		await expect(page.getByRole('heading', { level: 2, name })).toBeVisible();
	},
);

Then(
	'the {string} row shows a visible focus indicator',
	async ({ page }, name: string) => {
		await expect(newsletterRow(page, name)).toHaveAttribute(
			'data-focus-visible',
			'true',
		);
	},
);
