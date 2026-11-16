import { expect, test } from '@playwright/test';
import {
	createDraftNewsletter,
	deleteDraftNewsletter,
} from '../../helpers/draft-newsletter';

test('draft and launched detail pages have the same responsive width', async ({
	page,
	request,
}) => {
	const listId = await createDraftNewsletter(request, 'Width test draft');

	try {
		for (const viewportWidth of [1440, 768, 390]) {
			await page.setViewportSize({ width: viewportWidth, height: 900 });
			await page.goto(`/drafts/${listId}`);
			await expect(
				page.getByRole('heading', { name: 'Width test draft' }),
			).toBeVisible();
			const draftWidth = await page
				.locator('main')
				.evaluate((element) => element.getBoundingClientRect().width);

			await page.goto('/newsletters/playwright-launched-seed/details');
			await expect(
				page.getByRole('heading', { name: 'Playwright Launched Seed' }),
			).toBeVisible();
			const launchedWidth = await page
				.locator('main')
				.evaluate((element) => element.getBoundingClientRect().width);

			expect(draftWidth).toBeCloseTo(launchedWidth, 0);
			expect(draftWidth).toBeCloseTo(Math.min(viewportWidth, 1056), 0);
		}
	} finally {
		await deleteDraftNewsletter(request, listId);
	}
});
