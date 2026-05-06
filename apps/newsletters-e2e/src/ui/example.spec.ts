/*
import { test, expect } from '@playwright/test';
import {
	createDraftNewsletter,
	deleteDraftNewsletter,
	updateDraftNewsletter,
} from '../../helpers/draft-newsletter';

test.describe('Draft newsletter', () => {
	let listId: number;

	test.beforeEach(async ({ request }) => {
		listId = await createDraftNewsletter(request, 'My Test Newsletter');
	});

	test.afterEach(async ({ request }) => {
		await deleteDraftNewsletter(request, listId);
	});

	test('appears in the drafts list', async ({ page }) => {
		await page.goto('/');
		// ... your assertions
	});

	test('can be updated with production details', async ({ request, page }) => {
		await updateDraftNewsletter(request, listId, 'productionDetails', {
			category: 'article-based',
			frequency: 'Weekly',
		});
		await updateDraftNewsletter(request, listId, 'targeting', {
			theme: 'news',
			group: 'News in depth',
		});
		// ... your assertions
	});
});
*/
