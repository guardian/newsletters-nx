import { expect, test } from '@playwright/test';
import { patchNewsletter } from '../../helpers/draft-newsletter';

const NEWSLETTER_ID_NAME = 'playwright-article-test';
const RENDERING_OPTIONS_URL_PATTERN = new RegExp(
	`/launched/rendering-options/${NEWSLETTER_ID_NAME}`,
);

test.describe('Rendering options', () => {
	test.beforeEach(async ({ page }) => {
		await page.goto('/');
		await page
			.locator('header')
			.getByRole('button', { name: 'Launched' })
			.click();
		await expect(page).toHaveURL(/\/launched$/);

		await page.getByRole('link', { name: NEWSLETTER_ID_NAME }).click();
		await expect(page).toHaveURL(
			new RegExp(`/launched/${NEWSLETTER_ID_NAME}$`),
		);

		await page.getByRole('link', { name: 'Edit Newsletter' }).click();
		await expect(page).toHaveURL(
			new RegExp(`/launched/edit/${NEWSLETTER_ID_NAME}$`),
		);

		await page.getByRole('link', { name: 'Edit Rendering Options' }).click();
		await expect(page).toHaveURL(RENDERING_OPTIONS_URL_PATTERN);
	});

	const LIST_ID = 9001;
	test.afterEach(async ({ request }) => {
		// reset the seeded newsletter state back to it original state so that tests can start from the same state
		await patchNewsletter(request, LIST_ID, {
			renderingOptions: {
				displayDate: false,
				displayStandfirst: false,
				displayImageCaptions: false,
			},
			seriesTag: 'tests/series/playwright-article-test-email',
		});
	});

	test('can edit rendering options fields and save', async ({ page }) => {
		await page
			.getByLabel('Add the series tag')
			.fill('tests/series/playwright-article-rendering');

		await page.getByRole('checkbox', { name: 'Display date?' }).check();
		await page.getByRole('checkbox', { name: 'Display standfirst?' }).check();
		await page
			.getByRole('checkbox', { name: 'Display image captions?' })
			.check();

		const optionalCheckboxes = [
			'Include breaking news sections?',
			'Dark headline section?',
			'Display Newsletter name above headline?',
		];
		for (const label of optionalCheckboxes) {
			const checkbox = page.getByRole('checkbox', { name: label });
			if (await checkbox.isVisible()) {
				await checkbox.check();
			}
		}

		const urlFields: Array<[string, string]> = [
			[
				'URL for the main banner',
				'https://media.guim.co.uk/playwright-main-banner.jpg',
			],
			[
				'URL for the mobile size main banner',
				'https://media.guim.co.uk/playwright-mobile-banner.jpg',
			],
			[
				'URL for standard subheading banner',
				'https://media.guim.co.uk/playwright-subheading-banner.jpg',
			],
			[
				'URL for dark subheading banner',
				'https://media.guim.co.uk/playwright-dark-banner.jpg',
			],
		];
		for (const [label, value] of urlFields) {
			const input = page.getByLabel(label);
			if (await input.isVisible()) {
				await input.fill(value);
			}
		}

		const contactEmail = page.getByLabel('Contact email');
		if (await contactEmail.isVisible()) {
			await contactEmail.fill('playwright-test@guardian.co.uk');
		}

		const paletteOverride = page
			.locator('label', { hasText: /^Palette override$/ })
			.locator('..')
			.getByRole('combobox');
		if (await paletteOverride.isVisible()) {
			await paletteOverride.click();
			await page.getByRole('option', { name: 'news' }).click();
		}

		const bulletListStyle = page
			.locator('label', {
				hasText: /^Display unordered list as bullets or lines$/,
			})
			.locator('..')
			.getByRole('combobox');
		if (await bulletListStyle.isVisible()) {
			await bulletListStyle.click();
			await page.getByRole('option', { name: 'bulleted' }).click();
		}

		await page.getByRole('button', { name: 'update' }).click();

		const brazeDialog = page.getByRole('dialog');
		if (await brazeDialog.isVisible()) {
			await page.getByRole('button', { name: 'Save without update' }).click();
		}

		await expect(page.getByText('Rendering options updated')).toBeVisible();

		await page.reload();
		await expect(page).toHaveURL(RENDERING_OPTIONS_URL_PATTERN);

		await expect(page.getByLabel('Add the series tag')).toHaveValue(
			'tests/series/playwright-article-rendering',
		);
		await expect(
			page.getByRole('checkbox', { name: 'Display date?' }),
		).toBeChecked();
		await expect(
			page.getByRole('checkbox', { name: 'Display standfirst?' }),
		).toBeChecked();
		await expect(
			page.getByRole('checkbox', { name: 'Display image captions?' }),
		).toBeChecked();
	});
});
