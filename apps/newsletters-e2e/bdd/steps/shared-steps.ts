import { expect } from '@playwright/test';
import { patchNewsletter } from '../../helpers/draft-newsletter';
import { After, Given, Then, When } from '../fixtures';

const LIST_ID = 9001;

// ─── Lifecycle hooks ─────────────────────────────────────────────────────────

/**
 * Reset the seeded newsletter to its original state after every scenario.
 * Mirrors the afterEach cleanup in renderingOptions.spec.ts.
 */
After(async ({ request }) => {
	await patchNewsletter(request, LIST_ID, {
		renderingOptions: {
			displayDate: false,
			displayStandfirst: false,
			displayImageCaptions: false,
			contactEmail: '',
		},
		seriesTag: 'tests/series/playwright-article-test-email',
	});
});

// ─── Navigation ──────────────────────────────────────────────────────────────

Given(
	'I am on the rendering options page for the launched newsletter {string}',
	async ({ page }, name: string) => {
		await page.goto(`/launched/rendering-options/${name}`);
		await expect(page).toHaveURL(
			new RegExp(`/launched/rendering-options/${name}`),
		);
	},
);

Given(
	'I am on the stand design rendering options page for the launched newsletter {string}',
	async ({ page }, name: string) => {
		await page.goto(
			`/launched/rendering-options/${name}?switch-stand=true`,
		);
		await expect(page).toHaveURL(
			new RegExp(`/launched/rendering-options/${name}`),
		);
	},
);

// ─── Interaction ─────────────────────────────────────────────────────────────

/**
 * Fill in a labelled text input.
 * Asserts the field is visible before acting — fails loudly if it is absent,
 * rather than silently skipping (cf. the isVisible() guard in renderingOptions.spec.ts
 * that masked the #740 contactEmail bug).
 */
When(
	'I fill in {string} with {string}',
	async ({ page }, label: string, value: string) => {
		const field = page.getByLabel(label);
		await expect(field).toBeVisible();
		await field.fill(value);
	},
);

/**
 * Check a labelled checkbox.
 * Asserts visibility before acting for the same reason as `I fill in`.
 */
When('I check {string}', async ({ page }, label: string) => {
	const checkbox = page.getByLabel(label);
	await expect(checkbox).toBeVisible();
	await checkbox.check();
});

/**
 * Select an option from a combobox whose associated label exactly matches
 * the given text.
 */
When(
	'I select {string} from {string}',
	async ({ page }, option: string, label: string) => {
		const combobox = page
			.locator('label', { hasText: new RegExp(`^${label}$`) })
			.locator('..')
			.getByRole('combobox');
		await expect(combobox).toBeVisible();
		await combobox.click();
		await page.getByRole('option', { name: option }).click();
	},
);

/**
 * Submit the rendering options form.
 * Waits for either the success toast or the optional Braze sync dialog, then
 * dismisses the dialog if it appeared.  The Braze dialog is an environment-
 * specific side-effect (not present in CI / USE_DEVELOPER_PROFILE=true), so
 * handling it here keeps individual scenarios clean.
 */
When('I save the rendering options', async ({ page }) => {
	await page.getByRole('button', { name: 'update' }).click();
	const brazeButton = page.getByRole('button', { name: 'Save without update' });
	const brazeAppeared = await brazeButton
		.waitFor({ state: 'visible', timeout: 3000 })
		.then(() => true)
		.catch(() => false);
	if (brazeAppeared) {
		await brazeButton.click();
	}
});

When('I reload the page', async ({ page }) => {
	await page.reload();
});

// ─── Assertions ──────────────────────────────────────────────────────────────

Then('{string} should be visible', async ({ page }, label: string) => {
	await expect(page.getByLabel(label)).toBeVisible();
});

Then(
	'{string} should have the value {string}',
	async ({ page }, label: string, value: string) => {
		await expect(page.getByLabel(label)).toHaveValue(value);
	},
);

Then('{string} should be checked', async ({ page }, label: string) => {
	await expect(page.getByLabel(label)).toBeChecked();
});

Then('the rendering options are saved successfully', async ({ page }) => {
	await expect(page.getByText('Rendering options updated')).toBeVisible();
});
