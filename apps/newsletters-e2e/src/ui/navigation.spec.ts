import { expect, test } from '@playwright/test';

test.describe('UI Tests', () => {
	test.describe('Header menu journeys', () => {
		test('should load home page and click Launched button', async ({
			page,
		}) => {
			await page.goto('/');
			await page.waitForLoadState('networkidle');

			await expect(page).toHaveTitle(/Newsletter/i);

			const launchedButton = page.getByRole('button', {
				name: 'Launched',
				exact: true,
			});

			await expect(launchedButton).toBeVisible();
			await launchedButton.click();

			await expect(page).toHaveURL('/launched');
		});

		test('should load home page and click Drafts button', async ({ page }) => {
			await page.goto('/');
			await page.waitForLoadState('networkidle');

			await expect(page).toHaveTitle(/Newsletter/i);

			const draftsButton = page.getByRole('button', {
				name: 'Drafts',
				exact: true,
			});

			await expect(draftsButton).toBeVisible();
			await draftsButton.click();

			await expect(page).toHaveURL('/drafts');
		});

		test('should load home page and click Email Templates button', async ({
			page,
		}) => {
			await page.goto('/');
			await page.waitForLoadState('networkidle');

			await expect(page).toHaveTitle(/Newsletter/i);

			const emailTemplatesButton = page.getByRole('button', {
				name: 'Email Templates',
				exact: true,
			});

			await expect(emailTemplatesButton).toBeVisible();
			await emailTemplatesButton.click();

			await expect(page).toHaveURL('/templates');
		});

		test('should load home page and click Layouts button', async ({
			page,
		}) => {
			await page.goto('/');
			await page.waitForLoadState('networkidle');

			await expect(page).toHaveTitle(/Newsletter/i);

			const layoutsButton = page.getByRole('button', {
				name: 'Layouts',
				exact: true,
			});

			await expect(layoutsButton).toBeVisible();
			await layoutsButton.click();

			await expect(page).toHaveURL('/layouts');
		});
	});
});

//Email Templates
