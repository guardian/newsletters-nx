import { expect } from '@playwright/test';
import { Then, When } from './fixtures';

When(
	'the editor opens the layout draft page',
	async ({ page, namedNewsletters }) => {
		const ref = namedNewsletters.refsByName['Layout draft'];
		if (ref?.kind !== 'draft') {
			throw new Error('No layout draft was created');
		}
		await page.goto(`/drafts/${ref.listId}`);
	},
);

Then('the layout draft has no launched preview controls', async ({ page }) => {
	await expect(
		page.getByRole('heading', { name: 'Layout draft', exact: true }),
	).toBeVisible();
	await expect(
		page.getByRole('tab', { name: 'Layout', exact: true }),
	).toHaveCount(0);
	await expect(
		page.getByRole('link', { name: 'Edit layout', exact: true }),
	).toHaveCount(0);
	await expect(page.getByTitle('Newsletter email preview')).toHaveCount(0);
});
