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
			await page.waitForLoadState('networkidle');

			// run some general assertions on the launched newsletters page

			// check the page title
			const pageTitle = page.getByText('View launched newsletters');
			await expect(pageTitle).toBeVisible();

			/*
			// check the column filters
			const columnFilterContainer = page.getByTestId(
				'column-filters-container',
			);

			const filterCheckboxes = await columnFilterContainer
				.getByRole('checkbox')
				.all();

			console.log('column filter length = ', filterCheckboxes.length);
			*/
		});
	});
});
