import { expect, type Page, test } from '@playwright/test';
import { cleanupStaleTestDrafts } from '../../helpers/draft-newsletter';

const DRAFT_NAME_PREFIX = 'Playwright Create Test';
const CREATE_URL = '/drafts/newsletter-data';

async function completeIntroStep(page: Page) {
	const startButton = page.getByRole('button', { name: 'Start' });
	await expect(startButton).toBeVisible();
	await startButton.click();
}

async function completeNameStep(page: Page, name: string) {
	await expect(
		page.getByRole('heading', { name: "Enter the newsletter's name" }),
	).toBeVisible();
	const nameInput = page.getByRole('textbox', { name: 'Name' });
	await expect(nameInput).toBeVisible();

	await nameInput.fill(name);
	await page.getByRole('button', { name: 'Save and Continue' }).click();
}

async function completeProductionDetailsStep(
	page: Page,
	category: 'article-based' | 'fronts-based' | 'manual-send' | 'other',
) {
	const categoryGroup = page.getByRole('radiogroup', { name: /type of newsletter/i });
	await expect(categoryGroup).toBeVisible();
	await expect(
		categoryGroup.getByRole('radio', { name: 'article-based' }),
	).toBeVisible();
	await expect(
		categoryGroup.getByRole('radio', { name: 'fronts-based' }),
	).toBeVisible();
	await expect(
		categoryGroup.getByRole('radio', { name: 'manual-send' }),
	).toBeVisible();
	await expect(
		categoryGroup.getByRole('radio', { name: 'other' }),
	).toBeVisible();

	const articleLocationGroup = page
		.locator('label', { hasText: /^Location of newsletter$/ })
		.locator('..');
	await expect(articleLocationGroup).toBeVisible();
	await expect(
		articleLocationGroup.getByRole('radio', { name: 'Email only' }),
	).toBeVisible();
	await expect(
		articleLocationGroup.getByRole('radio', {
			name: 'Web for first send only',
		}),
	).toBeVisible();
	await expect(
		articleLocationGroup.getByRole('radio', { name: 'Web for all sends' }),
	).toBeVisible();

	await articleLocationGroup.getByRole('radio', { name: 'Email only' }).click();

	const frequencyCombobox = page
		.getByTestId('frequency-select')
	await expect(frequencyCombobox).toBeVisible();

	await categoryGroup
		.getByRole('radio', { name: category, exact: true })
		.click();
	await frequencyCombobox.click();
	await page.getByRole('option', { name: 'Weekly', exact: true }).click();
	await page.getByRole('button', { name: 'Save and Continue' }).click();
}

async function completeDatesStep(page: Page) {
	const launchDateInput = page
		.getByRole('group', { name: 'Launch date' })
		.first();
	const signUpDateInput = page
		.getByRole('group', { name: 'Sign up page date' })
		.first();
	const thrasherDateInput = page
		.getByRole('group', { name: 'Thrasher date' })
		.first();

	await expect(launchDateInput).toBeVisible();
	await expect(signUpDateInput).toBeVisible();
	await expect(thrasherDateInput).toBeVisible();
	await expect(
		page.getByRole('checkbox', { name: 'Needs to be private until launch?' }),
	).toBeVisible();

	const futureDate = '03062122';
	await launchDateInput.click();
	await launchDateInput.pressSequentially(futureDate);
	await signUpDateInput.click();
	await signUpDateInput.pressSequentially(futureDate);
	await thrasherDateInput.click();
	await thrasherDateInput.pressSequentially(futureDate);

	await page.getByRole('button', { name: 'Save and Continue' }).click();
}

async function completeTargetingStep(page: Page) {
	// MUI Select doesn't expose aria-labelledby reliably :s select the combobox
	// by finding it within the FormControl that contains the matching InputLabel.
	const themeFormControl = page.locator('.MuiFormControl-root', {
		has: page.locator('.MuiInputLabel-root', { hasText: /^Pillar$/ }),
	});
	const themeCombobox = themeFormControl.getByRole('combobox');
	await expect(themeCombobox).toBeVisible();
	await themeCombobox.click();
	await page.getByRole('option', { name: 'news' }).click();

	const groupFormControl = page.locator('.MuiFormControl-root', {
		has: page.locator('.MuiInputLabel-root', {
			hasText: /^Group for MMA page$/,
		}),
	});
	const groupCombobox = groupFormControl.getByRole('combobox');
	await expect(groupCombobox).toBeVisible();
	await groupCombobox.click();
	await page.getByRole('option', { name: 'News in depth' }).click();

	// the aria-labelledby ID contains spaces (invalid HTML) :( so resolve the
	// locator by its container
	const regionFocusFormControl = page.locator('.MuiFormControl-root', {
		has: page.locator('.MuiFormLabel-root', { hasText: /^Region focus$/ }),
	});
	const regionFocusGroup = regionFocusFormControl.getByRole('radiogroup');
	await expect(regionFocusGroup).toBeVisible();
	await regionFocusGroup.getByRole('radio', { name: 'UK' }).click();

	await page.getByRole('button', { name: 'Save and Continue' }).click();
}

async function completeTagsStep(page: Page) {
	await expect(page.getByLabel('Series tag (path)')).toBeVisible();
	await expect(page.getByLabel('The Series tag description')).toBeVisible();
	await expect(page.getByLabel('Composer tag(s)')).toBeVisible();
	await expect(
		page.getByLabel('Composer campaign tag description'),
	).toBeVisible();

	await page.getByRole('button', { name: 'Save and Continue' }).click();
}

async function completeThrasherStep(page: Page) {
	const singleThrasherCheckbox = page.getByRole('checkbox', {
		name: 'Single thrasher required?',
	});
	await expect(singleThrasherCheckbox).toBeVisible();
	await expect(singleThrasherCheckbox).toBeEnabled();

	// the aria-labelledby ID contains spaces (invalid HTML) :( so resolve the
	// locator by its container
	const singleThrasherLocationFormControl = page.locator(
		'.MuiFormControl-root',
		{
			has: page.locator('.MuiFormLabel-root', {
				hasText: /^single thrasher location$/i,
			}),
		},
	);
	const singleThrasherLocationGroup =
		singleThrasherLocationFormControl.getByRole('radiogroup');
	await expect(singleThrasherLocationGroup).toBeVisible();
	await singleThrasherLocationGroup
		.getByRole('radio', { name: 'Web only' })
		.click();

	const thrasherDescription = page.getByLabel('Thrasher description');
	await expect(thrasherDescription).toBeVisible();
	await expect(thrasherDescription).toBeEnabled();

	const multiThrashersAddButton = page.getByTitle(
		'add new entry to The configuration for multi-thrashers list',
	);
	await expect(multiThrashersAddButton).toBeVisible();
	await expect(multiThrashersAddButton).toBeEnabled();

	await page.getByRole('button', { name: 'Save and Continue' }).click();
}

async function completePromotionContentStep(page: Page, name: string) {
	await expect(page.getByLabel('Sign-up headline')).toBeVisible();
	await expect(page.getByLabel('Sign-up description')).toBeVisible();
	await expect(page.getByLabel('Sign up embed description')).toBeVisible();
	await expect(page.getByLabel('Sign-up success message')).toBeVisible();
	await expect(page.getByLabel('Sign-up highlight card title')).toBeVisible();
	await expect(
		page.getByLabel('URL of image the newsleter graphic/logo (5:3 format)'),
	).toBeVisible();
	await expect(
		page.getByLabel('URL of image the newsleter graphic/logo (1:1 format)'),
	).toBeVisible();

	await page.getByLabel('Sign-up headline').fill(`${name} newsletter`);
	await page.getByLabel('Sign-up description').fill(`Sign up for ${name}.`);
	await page
		.getByLabel('Sign up embed description')
		.fill(`Embed description for ${name}.`);
	await page
		.getByLabel('Sign-up highlight card title')
		.fill(`Highlight card for ${name}`);

	await page.getByRole('button', { name: 'Save and Continue' }).click();
}

// ─── Tests ───

test.describe('Create draft newsletter journey', () => {
	let draftName: string;

	test.beforeAll(async ({ request }) => {
		await cleanupStaleTestDrafts(request, DRAFT_NAME_PREFIX);
	});

	// eslint-disable-next-line no-empty-pattern -- stuck between 'no-empty-pattern' (eslint) and 'First argument must use the object destructuring pattern' (playwright)
	test.beforeEach(({}, testInfo) => {
		draftName = `${DRAFT_NAME_PREFIX} - ${testInfo.title}`;
	});

	test.afterEach(async ({ request }) => {
		await cleanupStaleTestDrafts(request, draftName);
	});

	test('completes the full journey for an article based newsletter', async ({
		page,
	}) => {
		await page.goto(CREATE_URL);

		await completeIntroStep(page);
		await completeNameStep(page, draftName);
		await completeProductionDetailsStep(page, 'article-based');
		await completeDatesStep(page);
		await completeTargetingStep(page);
		await completeTagsStep(page);
		await completeThrasherStep(page);
		await completePromotionContentStep(page, draftName);

		await expect(
			page.getByRole('heading', { name: "You're finished!" }),
		).toBeVisible();
		await expect(
			page.getByText(
				`Congratulations, you have reached the end of the wizard for newsletter ${draftName}`,
			),
		).toBeVisible();

		await expect(
			page.getByRole('link', { name: 'rendering options' }),
		).toBeVisible();

		// Link to the draft detail page should be visible
		await expect(
			page.getByRole('link', { name: 'details page' }),
		).toBeVisible();
	});

	test('completes the full journey for a fronts based newsletter', async ({
		page,
	}) => {
		await page.goto(CREATE_URL);

		await completeIntroStep(page);
		await completeNameStep(page, draftName);
		await completeProductionDetailsStep(page, 'fronts-based');
		await completeDatesStep(page);
		await completeTargetingStep(page);
		await completeTagsStep(page);
		await completeThrasherStep(page);
		await completePromotionContentStep(page, draftName);

		await expect(
			page.getByRole('heading', { name: "You're finished!" }),
		).toBeVisible();
		await expect(
			page.getByText(
				`Congratulations, you have reached the end of the wizard for newsletter ${draftName}`,
			),
		).toBeVisible();

		await expect(
			page.getByRole('link', { name: 'rendering options' }),
		).not.toBeVisible();
	});

	test('shows a validation error when submitting the name step without entering a name', async ({
		page,
	}) => {
		await page.goto(CREATE_URL);

		await completeIntroStep(page);

		await expect(page.getByRole('textbox', { name: 'Name' })).toBeVisible();
		await page.getByRole('button', { name: 'Save and Continue' }).click();

		await expect(page.getByRole('alert')).toBeVisible();
		await expect(page.getByRole('textbox', { name: 'Name' })).toBeVisible();
	});
});

test.describe('Wizard step nav skip functionality', () => {
	let draftName: string;

	test.beforeAll(async ({ request }) => {
		await cleanupStaleTestDrafts(request, DRAFT_NAME_PREFIX);
	});

	// eslint-disable-next-line no-empty-pattern -- stuck between 'no-empty-pattern' (eslint) and 'First argument must use the object destructuring pattern' (playwright)
	test.beforeEach(({}, testInfo) => {
		draftName = `${DRAFT_NAME_PREFIX} - ${testInfo.title}`;
	});

	test.afterEach(async ({ request }) => {
		await cleanupStaleTestDrafts(request, draftName);
	});

	test('step nav items are not clickable on a non-skippable step', async ({
		page,
	}) => {
		await page.goto(CREATE_URL);

		await expect(page.locator('.left-aligned-step-button')).not.toBeVisible();
	});

	test('step nav items become skip buttons when on a skippable step', async ({
		page,
	}) => {
		await page.goto(CREATE_URL);
		await completeIntroStep(page);
		await completeNameStep(page, draftName);

		// Wait for the production details step to confirm the wizard has advanced.
		await expect(
			page.getByRole('heading', { name: /Production details/ }),
		).toBeVisible();

		await expect(
			page
				.locator('.left-aligned-step-button')
				.filter({ hasText: 'Launch/Promotion Dates' }),
		).toBeVisible();
		await expect(
			page
				.locator('.left-aligned-step-button')
				.filter({ hasText: 'Targeting' }),
		).toBeVisible();
		await expect(
			page
				.locator('.left-aligned-step-button')
				.filter({ hasText: 'Tag Setup' }),
		).toBeVisible();
	});

	test('clicking a step nav button navigates to that step', async ({
		page,
	}) => {
		await page.goto(CREATE_URL);
		await completeIntroStep(page);
		await completeNameStep(page, draftName);

		// Wait for the production details step to confirm the wizard has advanced.
		await expect(
			page.getByRole('heading', { name: /Production details/ }),
		).toBeVisible();

		// Skip from Production Details to Targeting.
		await page
			.locator('.left-aligned-step-button')
			.filter({ hasText: 'Targeting' })
			.click();

		await expect(
			page.getByRole('heading', { name: /Targeting/ }),
		).toBeVisible();
	});
});
