import { expect, test } from '@playwright/test';
import { patchNewsletter } from '../../helpers/draft-newsletter';

// 'Playwright Article Test' is pre-seeded in newsletters.local.json
const NEWSLETTER_ID_NAME = 'playwright-article-test';
const LIST_ID = 9001;
const DETAIL_URL_PATTERN = new RegExp(`/launched/${NEWSLETTER_ID_NAME}$`);
const EDIT_URL_PATTERN = new RegExp(`/launched/edit/${NEWSLETTER_ID_NAME}$`);

test.describe('Edit article-based newsletter', () => {
	test.afterEach(async ({ request }) => {
		await patchNewsletter(request, LIST_ID, {
			name: 'Playwright Article Test',
			status: 'live',
			frequency: 'Weekly',
			regionFocus: 'UK',
			theme: 'news',
			restricted: false,
			signUpDescription:
				'A test newsletter for Playwright E2E tests (article-based).',
			signUpEmbedDescription:
				'Sign up for the Playwright Article Test newsletter.',
			mailSuccessDescription: 'You are signed up for Playwright Article Test.',
			highlightCardTitle: 'Playwright Article Test highlight',
			seriesTag: 'tests/series/playwright-article-test-email',
			composerTag: null,
			composerCampaignTag: null,
			signupPage: '/global/sign-up-for-playwright-article-test',
			illustrationCard: null,
			illustrationSquare: null,
			brazeNewsletterName: 'Editorial_PlaywrightArticleTest',
			brazeSubscribeAttributeName: 'PlaywrightArticleTest_Subscribe_Email',
			brazeSubscribeEventNamePrefix: 'playwright_article_test',
			brazeSubscribeAttributeNameAlternate: [
				'email_subscribe_playwright_article_test',
			],
			tagCreationStatus: 'COMPLETED',
			signupPageCreationStatus: 'COMPLETED',
			brazeCampaignCreationStatus: 'COMPLETED',
		});
	});
	test('can edit all fields of an article-based newsletter', async ({
		page,
	}) => {
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
			.getByLabel('Name the newsletter *', { exact: true })
			.fill('Updated Article Test');

		await page.getByTestId('frequency-select').click();
		await page.getByRole('option', { name: 'Fortnightly' }).click();

		await page
			.getByLabel('Sign up description')
			.fill('Updated sign up description for E2E tests.');

		await page
			.getByLabel('Sign up embed description')
			.fill('Updated sign up embed description for E2E tests.');

		await page
			.getByLabel('Sign-up success message')
			.fill('Thanks for signing up to Updated Article Test!');

		await page
			.getByLabel('Sign-up highlight card title')
			.fill('Updated Article Test highlight');


		await page
			.getByLabel('Add the series tag')
			.fill('tests/series/playwright-article-updated');

		await page
			.getByLabel('Campaign tag')
			.fill('tests/playwright-article-test');

		await page
			.getByLabel('Campaign description')
			.fill('playwright-article-test-campaign');

		await page
			.getByLabel('Path to Sign up page')
			.fill('/global/sign-up-for-playwright-article-test-updated');

		await page
			.getByLabel('URL of image the newsleter graphic/logo (5:3 format)')
			.fill('https://media.guim.co.uk/playwright-test-card.jpg');

		await page
			.getByLabel('URL of image the newsleter graphic/logo (1:1 format)')
			.fill('https://media.guim.co.uk/playwright-test-square.jpg');

		await page
			.getByLabel('brazeNewsletterName')
			.fill('Editorial_PlaywrightArticleTest_Updated');

		await page
			.getByLabel('brazeSubscribeAttributeName *', { exact: true })
			.fill('PlaywrightArticleTest_Updated_Subscribe_Email');

		await page
			.getByLabel('brazeSubscribeEventNamePrefix')
			.fill('playwright_article_test_updated');

		await page.getByRole('checkbox', { name: 'Restricted' }).check();

		await page
			.locator('label', { hasText: /^Region focus$/ })
			.locator('..')
			.getByRole('radio', { name: 'AU' })
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

		// brazeSubscribeAttributeNameAlternate: this field is a bit more involved,
		// existing entries can be edited via the input text field, new ones need
		// the 'Add New Item' button pressed and then named
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
				.fill('email_subscribe_playwright_article_test_updated');
		}

		await page.getByRole('button', { name: 'Update Newsletter' }).click();

		// After updating the newsletter the form redirects to the detail page
		await expect(page).toHaveURL(DETAIL_URL_PATTERN);
		await expect(
			page.getByRole('heading', { name: 'Updated Article Test' }),
		).toBeVisible();
	});
});
