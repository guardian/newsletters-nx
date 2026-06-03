import { expect, test } from '@playwright/test';
import { patchNewsletter } from '../../helpers/draft-newsletter';

const NEWSLETTER_ID_NAME = 'playwright-fronts-test';
const LIST_ID = 9002;
const DETAIL_URL_PATTERN = new RegExp(`/launched/${NEWSLETTER_ID_NAME}$`);
const EDIT_URL_PATTERN = new RegExp(`/launched/edit/${NEWSLETTER_ID_NAME}$`);

test.describe('Edit fronts-based newsletter', () => {
	test.afterEach(async ({ request }) => {
		// Reset the newsletter to its original seeded state so other tests are not affected.
		await patchNewsletter(request, LIST_ID, {
			name: 'Playwright Fronts Test',
			status: 'live',
			frequency: 'Monthly',
			regionFocus: null,
			theme: 'lifestyle',
			restricted: false,
			signUpDescription:
				'A test newsletter for Playwright E2E tests (fronts-based).',
			signUpEmbedDescription:
				'Sign up for the Playwright Fronts Test newsletter.',
			mailSuccessDescription: 'You are signed up for Playwright Fronts Test.',
			highlightCardTitle: 'Playwright Fronts Test highlight',
			composerTag: null,
			composerCampaignTag: null,
			signupPage: '/global/sign-up-for-playwright-fronts-test',
			illustrationCard: null,
			illustrationSquare: null,
			brazeNewsletterName: 'Editorial_PlaywrightFrontsTest',
			brazeSubscribeAttributeName: 'PlaywrightFrontsTest_Subscribe_Email',
			brazeSubscribeEventNamePrefix: 'playwright_fronts_test',
			brazeSubscribeAttributeNameAlternate: [
				'email_subscribe_playwright_fronts_test',
			],
			tagCreationStatus: 'COMPLETED',
			signupPageCreationStatus: 'COMPLETED',
			brazeCampaignCreationStatus: 'COMPLETED',
		});
	});
	test('can edit all fields of a fronts-based newsletter', async ({ page }) => {
		await page.goto('/');
		await page
			.locator('header')
			.getByRole('button', { name: 'Launched' })
			.click();
		await expect(page).toHaveURL(/\/launched$/);

		await page.getByRole('link', { name: NEWSLETTER_ID_NAME }).click();
		await expect(page).toHaveURL(DETAIL_URL_PATTERN);

		await page.getByRole('link', { name: 'Edit Newsletter' }).click();
		await expect(page).toHaveURL(EDIT_URL_PATTERN);

		await page
			.getByLabel('Name *', { exact: true })
			.fill('Updated Fronts Test');

		await page.getByLabel('Frequency').click();
		await page.getByRole('option', { name: 'Fortnightly' }).click();

		await page
			.getByLabel('Sign up description')
			.fill('Updated sign up description for fronts E2E tests.');

		await page
			.getByLabel('Sign up embed description')
			.fill('Updated sign up embed description for fronts E2E tests.');

		await page
			.getByLabel('Sign-up success message')
			.fill('Thanks for signing up to Updated Fronts Test!');

		await page
			.getByLabel('Sign-up highlight card title')
			.fill('Updated Fronts Test highlight');

		await page
			.getByLabel('Composer tag(s)')
			.fill('tests/playwright-fronts-test');

		await page
			.getByLabel('Composer campaign tag description')
			.fill('playwright-fronts-test-campaign');

		await page
			.getByLabel('Path to Sign up page')
			.fill('/global/sign-up-for-playwright-fronts-test-updated');

		await page
			.getByLabel('URL of image the newsleter graphic/logo (5:3 format)')
			.fill('https://media.guim.co.uk/playwright-fronts-card.jpg');

		await page
			.getByLabel('URL of image the newsleter graphic/logo (1:1 format)')
			.fill('https://media.guim.co.uk/playwright-fronts-square.jpg');

		await page
			.getByLabel('brazeNewsletterName')
			.fill('Editorial_PlaywrightFrontsTest_Updated');

		await page
			.getByLabel('brazeSubscribeAttributeName *', { exact: true })
			.fill('PlaywrightFrontsTest_Updated_Subscribe_Email');

		await page
			.getByLabel('brazeSubscribeEventNamePrefix')
			.fill('playwright_fronts_test_updated');

		await page.getByRole('checkbox', { name: 'Restricted' }).check();

		// Radio groups note:
		// The MUI RadioGroup element sets role="radiogroup" which we could use as a slector,
		// but aria-labelledby uses an ID with spaces, which browsers can't resolve
		// so the accessible name is lost.
		// Instead we can get the radio group via its labels parent container.

		await page
			.locator('label', { hasText: /^Region focus$/ })
			.locator('..')
			.getByRole('radio', { name: 'UK' })
			.click();

		await page
			.locator('label', { hasText: /^Status$/ })
			.locator('..')
			.getByRole('radio', { name: 'paused' })
			.click();

		await page
			.locator('label', { hasText: /^Tag creation status$/ })
			.locator('..')
			.getByRole('radio', { name: 'REQUESTED', exact: true })
			.click();

		await page
			.locator('label', { hasText: /^Sign up creation status$/ })
			.locator('..')
			.getByRole('radio', { name: 'REQUESTED', exact: true })
			.click();

		await page
			.locator('label', { hasText: /^Braze campaign creation status$/ })
			.locator('..')
			.getByRole('radio', { name: 'REQUESTED', exact: true })
			.click();

		await page
			.locator('label', { hasText: /^Pillar$/ })
			.locator('..')
			.getByRole('combobox')
			.click();
		await page.getByRole('option', { name: 'opinion' }).click();

		const arrayField = page
			.locator('[aria-label="brazeSubscribeAttributeNameAlternate"]')
			.or(
				page.locator('fieldset', {
					hasText: 'brazeSubscribeAttributeNameAlternate',
				}),
			);
		const addButton = arrayField.getByRole('button', { name: /add/i });
		if (await addButton.isVisible()) {
			await addButton.click();
			await arrayField
				.getByRole('textbox')
				.last()
				.fill('email_subscribe_playwright_fronts_test_updated');
		}

		await page.getByRole('button', { name: 'Update Newsletter' }).click();

		// After updating the newsletter, the form redirects to the detail page
		await expect(page).toHaveURL(DETAIL_URL_PATTERN);
		await expect(
			page.getByRole('heading', { name: 'Updated Fronts Test' }),
		).toBeVisible();
	});
});
