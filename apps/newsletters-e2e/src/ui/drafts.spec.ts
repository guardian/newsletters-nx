import { expect, test } from '@playwright/test';
import {
	createDraftNewsletter,
	deleteDraftNewsletter,
} from '../../helpers/draft-newsletter';

test.describe('Top nav - drafts', () => {
	let listId: number;

	test.beforeEach(async ({ request }) => {
		listId = await createDraftNewsletter(
			request,
			'Draft newsletter - playwright test',
		);
	});

	test.afterEach(async ({ request }) => {
		await deleteDraftNewsletter(request, listId);
	});

	test('appears in the drafts list', async ({ page }) => {
		await page.goto('/');
		const draftsButton = page
			.locator('header')
			.getByRole('button', { name: 'Drafts' });

		await draftsButton.click();

		const newsletterTableEntry = page
			.locator('table td:nth-child(2)')
			.getByText('Draft newsletter - playwright test');
		await expect(newsletterTableEntry).toBeVisible();
	});
});
