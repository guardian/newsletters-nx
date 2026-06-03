import { expect, test } from '@playwright/test';

test.describe('Top nav - launched', () => {
	test('appears in the launched list', async ({ page }) => {
		await page.goto('/');
		const launchedButton = page
			.locator('header')
			.getByRole('button', { name: 'Launched' });

		await launchedButton.click();

		const newsletterIdTableEntry = page
			.locator('table td:nth-child(1)')
			.getByRole('link', { name: 'playwright-launched-seed' });
		await expect(newsletterIdTableEntry).toBeVisible();

		const newsletterNameTableEntry = page.getByRole('cell', {
			name: 'Playwright Launched Seed',
		});
		await expect(newsletterNameTableEntry).toBeVisible();

		const newsletterStatusTableEntry = page.locator('table th:nth-child(7)');
		await expect(newsletterStatusTableEntry).toContainText('Status');
	});

	test('has correct edit newsletter options', async ({ page }) => {
		await page.goto('/');
		const launchedButton = page
			.locator('header')
			.getByRole('button', { name: 'Launched' });

		await launchedButton.click();

		const newsletterTableEntry = page
			.locator('table td:nth-child(1)')
			.getByRole('link', { name: 'playwright-launched-seed' });

		await newsletterTableEntry.click();

		const newsletterTitle = page.getByRole('heading', {
			name: 'Playwright Launched Seed',
		});
		await expect(newsletterTitle).toBeVisible();

		const editNewsletterLink = page.getByRole('link', {
			name: 'Edit Newsletter',
		});
		await editNewsletterLink.click();

		await expect(page).toHaveURL('/launched/edit/playwright-launched-seed');

		const nameInput = page.getByRole('textbox', { name: 'Name the newsletter', exact: true });
		await expect(nameInput).toBeEditable();

		const frequencyDropDown = page.getByTestId('frequency-select');
		await expect(frequencyDropDown).toBeVisible();
		await expect(frequencyDropDown).toBeEnabled();

		const regionRadioOption = page.getByRole('radio', { name: 'UK' });
		await expect(regionRadioOption).toBeEditable();

		const pillarLabel = page.locator('label:has-text("Pillar")');
		await expect(pillarLabel).toBeVisible();

		const statusRadioOption = page.getByRole('radio', { name: 'paused' });
		await expect(statusRadioOption).toBeEditable();

		const image5x3 = page.getByRole('textbox', {
			name: 'URL of image the newsleter graphic/logo (5:3 format)',
		});
		await expect(image5x3).toBeEditable();

		const image1x1 = page.getByRole('textbox', {
			name: 'URL of image the newsleter graphic/logo (1:1 format)',
		});
		await expect(image1x1).toBeEditable();

		const seriesTagPath = page.getByRole('textbox', {
			name: 'Series tag (path)',
		});
		await expect(seriesTagPath).toBeEditable();

		const composerTags = page.getByRole('textbox', {
			name: 'Composer tag(s)',
		});
		await expect(composerTags).toBeEditable();

		const composerCampaignTagDesc = page.getByRole('textbox', {
			name: 'Composer campaign tag',
		});
		await expect(composerCampaignTagDesc).toBeEditable();

		const pathToSignupPage = page.getByRole('textbox', {
			name: 'Path to Sign up page',
		});
		await expect(pathToSignupPage).toBeEditable();

		const signUpDescription = page.getByRole('textbox', {
			name: 'Sign up description',
		});
		await expect(signUpDescription).toBeEditable();

		const signSuccessMessage = page.getByRole('textbox', {
			name: 'Sign-up success message',
		});
		await expect(signSuccessMessage).toBeEditable();

		const signUpHighlightCardTitle = page.getByRole('textbox', {
			name: 'Sign-up highlight card title',
		});
		await expect(signUpHighlightCardTitle).toBeEditable();

		const brazeNewsletterName = page.getByRole('textbox', {
			name: 'brazeNewsletterName',
		});
		await expect(brazeNewsletterName).toBeEditable();

		const brazeSubscribeAttributeName = page.getByRole('textbox', {
			name: 'brazeSubscribeAttributeName',
		});
		await expect(brazeSubscribeAttributeName).toBeEditable();

		const brazeSubscribeEventNamePrefix = page.getByRole('textbox', {
			name: 'brazeSubscribeEventNamePrefix',
		});
		await expect(brazeSubscribeEventNamePrefix).toBeEditable();
	});
});
