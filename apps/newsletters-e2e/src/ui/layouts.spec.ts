import { expect, test } from '@playwright/test';
import { patchNewsletter } from '../../helpers/draft-newsletter';

const UK_LAYOUT_NEWSLETTER_NAME = 'Playwright Article Test';

test.describe('Top nav - layouts', () => {
	test.beforeEach(async ({ page, request }) => {
		// make sure the seeded newsletter is in its expected state
		// regardless of whether other tests have been messing around with it
		await patchNewsletter(request, 9001, {
			name: 'Playwright Article Test',
			status: 'live',
		});

		await page.goto('/');
		await page
			.locator('header')
			.getByRole('button', { name: 'Layouts' })
			.click();
		await expect(page).toHaveURL(/\/layouts/);
	});

	test('shows headings for all geographic regions', async ({ page }) => {
		for (const region of ['UK', 'US', 'AU', 'INT', 'EUR']) {
			await expect(
				page.getByRole('heading', { name: `${region} Layout` }),
			).toBeVisible();
		}
	});

	test('UK layout contains pre-seeded newsletter and links to its detail page', async ({
		page,
	}) => {
		await page.getByRole('link', { name: 'UK Layout' }).click();
		await expect(page).toHaveURL(/\/layouts\/uk/i);

		await expect(page.getByText(UK_LAYOUT_NEWSLETTER_NAME)).toBeVisible();

		await page.getByRole('link', { name: UK_LAYOUT_NEWSLETTER_NAME }).click();
		await expect(page).toHaveURL(/\/launched\/playwright-article-test/);

		await expect(
			page.getByRole('heading', { level: 2, name: UK_LAYOUT_NEWSLETTER_NAME }),
		).toBeVisible();
		await expect(
			page.getByRole('link', { name: 'View rendering preview' }),
		).toBeVisible();
		await expect(
			page.getByRole('link', { name: 'Edit Newsletter' }),
		).toBeVisible();
		await expect(
			page.getByRole('link', { name: 'Back to List' }),
		).toBeVisible();
		await expect(
			page.getByRole('button', { name: 'show raw data' }),
		).toBeVisible();
	});
});
