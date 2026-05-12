import { expect, test } from '@playwright/test';
import {
	cleanupStaleTestDrafts,
	createDraftNewsletter,
	deleteDraftNewsletter,
} from '../../helpers/draft-newsletter';

const DRAFT_NAME_PREFIX = 'Draft newsletter - playwright test';

test.describe('Top nav - drafts', () => {
	let listId: number;
	let draftName: string;

	test.beforeAll(async ({ request }) => {
		await cleanupStaleTestDrafts(request, DRAFT_NAME_PREFIX);
	});

	test.beforeEach(async ({ request }, testInfo) => {
		draftName = `${DRAFT_NAME_PREFIX} - ${testInfo.title}`;
		listId = await createDraftNewsletter(request, draftName);
	});

	test.afterEach(async ({ request }) => {
		await deleteDraftNewsletter(request, listId);
	});

	test('has the correct page heading and description', async ({ page }) => {
		await page.goto('/drafts');

		const heading = page.getByRole('heading', {
			name: 'View draft newsletters',
		});
		await expect(heading).toBeVisible();

		const description = page.getByText(
			'Please find below a list of draft newsletters in progress.',
		);
		await expect(description).toBeVisible();
	});

	test('has the correct table column headers', async ({ page }) => {
		await page.goto('/drafts');

		await expect(
			page.getByRole('columnheader', { name: 'Draft ID number' }),
		).toBeVisible();
		await expect(
			page.getByRole('columnheader', { name: 'Newsletter Name' }),
		).toBeVisible();
		await expect(
			page.getByRole('columnheader', { name: 'Category' }),
		).toBeVisible();
		await expect(
			page.getByRole('columnheader', { name: 'Pillar' }),
		).toBeVisible();
		await expect(
			page.getByRole('columnheader', { name: 'Progress' }),
		).toBeVisible();
	});

	test('has a visible search input field', async ({ page }) => {
		await page.goto('/drafts');

		const searchInput = page.getByLabel('Search for Newsletters');
		await expect(searchInput).toBeVisible();
	});

	test('appears in the drafts list', async ({ page }) => {
		await page.goto('/');
		const draftsButton = page
			.locator('header')
			.getByRole('button', { name: 'Drafts' });

		await draftsButton.click();

		const newsletterTableEntry = page
			.locator('table td:nth-child(2)')
			.getByText(draftName, { exact: true });
		await expect(newsletterTableEntry).toBeVisible();
	});

	test('search input filters drafts by name', async ({ page }) => {
		await page.goto('/drafts');

		const searchInput = page.getByLabel('Search for Newsletters');
		await searchInput.fill(draftName);

		const newsletterTableEntry = page
			.locator('table td:nth-child(2)')
			.getByText(draftName, { exact: true });
		await expect(newsletterTableEntry).toBeVisible();

		const tableRows = page.locator('table tbody tr');
		await expect(tableRows).toHaveCount(1);
	});
});
