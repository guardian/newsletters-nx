import { expect } from '@playwright/test';
import { Then, When } from './fixtures';

/**
 * Rows aren't real `<a>` elements (`TableRow` intercepts clicks/keypresses
 * itself, see `AllNewslettersTable.tsx`), but each one carries its
 * navigation target as `data-href` -- a stable locator that doesn't depend on
 * a row's visible text.
 */
const rowByHref = (page: import('@playwright/test').Page, href: string) =>
	page.locator(`tr[data-href="${href}"]`);

When('the editor clicks the "Playwright Launched Seed" row', async ({ page }) => {
	await rowByHref(page, '/launched/playwright-launched-seed').click();
});

When(
	'the editor focuses the "Playwright Launched Seed" row and presses Enter',
	async ({ page }) => {
		await rowByHref(page, '/launched/playwright-launched-seed').focus();
		await page.keyboard.press('Enter');
	},
);

Then(
	'the "Playwright Launched Seed" row shows its pillar and category label, and status badge',
	async ({ page }) => {
		const row = rowByHref(page, '/launched/playwright-launched-seed');
		await expect(row.getByText('Opinion | Article based')).toBeVisible();
		await expect(row.getByText('Paused')).toBeVisible();
	},
);

Then(
	'the "Playwright Launched Seed" row shows its thumbnail with meaningful alt text',
	async ({ page }) => {
		const row = rowByHref(page, '/launched/playwright-launched-seed');
		await expect(
			row.getByRole('img', { name: 'Playwright Launched Seed thumbnail' }),
		).toBeVisible();
	},
);

Then(
	"that draft's row shows a fallback image with meaningful alt text",
	async ({ page, existingDraftNewsletter }) => {
		const row = rowByHref(page, `/drafts/${existingDraftNewsletter.listId}`);
		await expect(row.getByText('No image')).toBeVisible();
		await expect(row.getByRole('img', { name: /No thumbnail available/ })).toBeVisible();
	},
);

Then(
	'the editor sees the detail page for "Playwright Launched Seed"',
	async ({ page }) => {
		await expect(page).toHaveURL(/\/launched\/playwright-launched-seed$/);
		await expect(
			page.getByRole('heading', { name: 'Playwright Launched Seed' }),
		).toBeVisible();
	},
);
