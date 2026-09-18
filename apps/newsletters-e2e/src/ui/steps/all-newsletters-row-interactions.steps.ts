import type { Page } from '@playwright/test';
import { expect } from '@playwright/test';
import { Then, When } from './fixtures';

// The row's accessible name includes its thumbnail alt text and sub-text as
// well as its title, so matching on the newsletter name alone is enough to
// find it uniquely.
const newsletterRow = (page: Page, name: string) =>
	page.getByRole('row', { name });

When(
	'the editor clicks the {string} row',
	async ({ page }, name: string) => {
		await newsletterRow(page, name).click();
	},
);

When(
	'the editor moves keyboard focus to the {string} row',
	async ({ page }, name: string) => {
		// A keydown establishes react-aria's "keyboard" interaction modality so
		// the subsequent programmatic focus shows a focus ring, matching how a
		// real Tab press would behave.
		await page.keyboard.press('Tab');
		await newsletterRow(page, name).focus();
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
