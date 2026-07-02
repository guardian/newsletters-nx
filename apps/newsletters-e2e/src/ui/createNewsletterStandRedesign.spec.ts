import { expect, type Page, test } from '@playwright/test';
import { cleanupStaleTestDrafts } from '../../helpers/draft-newsletter';

const DRAFT_NAME_PREFIX = 'Playwright Create Test';
const CREATE_URL = '/drafts/newsletter-data?switch-stand=true';

async function completeIntroStep(page: Page) {
	const startButton = page.getByRole('button', { name: 'Continue' });
	await expect(startButton).toBeVisible();
	await startButton.click();
}

async function completeNameFrequencyStep(
	page: Page,
	name: string,
	frequency: string,
) {
	await expect(
		page.getByRole('heading', { name: 'Name and frequency' }),
	).toBeVisible();
	const nameInput = page.getByLabel('Name the newsletter');
	await expect(nameInput).toBeVisible();
	await nameInput.fill(name);

	const frequencyRadioGroup = page.getByLabel('Set the frequency');
	await expect(frequencyRadioGroup).toBeVisible();
	await frequencyRadioGroup.getByText(frequency).click();

	await page.getByRole('button', { name: 'Save and continue' }).click();
}

async function completeProductionDetailsStep(
	page: Page,
	category: 'article-based' | 'fronts-based' | 'manual-send' | 'other',
) {
	await expect(
		page.getByRole('heading', { name: 'Production details' }),
	).toBeVisible();

	const categoryGroup = page.getByLabel('Type of newsletter');
	await expect(categoryGroup).toBeVisible();
	await expect(categoryGroup.getByText('article-based')).toBeVisible();
	await expect(categoryGroup.getByText('fronts-based')).toBeVisible();
	await expect(categoryGroup.getByText('manual-send')).toBeVisible();
	await expect(categoryGroup.getByText('other')).toBeVisible();

	await categoryGroup.getByText(category).click();

	const articleLocationGroup = page.getByLabel('Location of newsletter');
	await expect(articleLocationGroup).toBeVisible();
	await expect(articleLocationGroup.getByText('Email only')).toBeVisible();
	await expect(
		articleLocationGroup.getByText('Web for first send only'),
	).toBeVisible();
	await expect(
		articleLocationGroup.getByText('Web for all sends'),
	).toBeVisible();

	await articleLocationGroup.getByText('Email only').click();

	await page.getByRole('button', { name: 'Save and continue' }).click();
}

async function completeDatesStep(page: Page) {
	await expect(
		page.getByRole('heading', { name: 'Launch / Promotion details' }),
	).toBeVisible();

	const launchDateInput = page
		.getByRole('group', { name: 'Launch date' })
		.first();
	const signUpDateInput = page
		.getByRole('group', { name: 'Sign up page date' })
		.first();

	await expect(launchDateInput).toBeVisible();
	await expect(signUpDateInput).toBeVisible();
	await expect(
		page.getByRole('checkbox', { name: 'Needs to be private until launch?' }),
	).toBeVisible();

	const futureDate = '03062122';
	await launchDateInput.getByRole('spinbutton').first().click();
	await launchDateInput.pressSequentially(futureDate);
	await signUpDateInput.getByRole('spinbutton').first().click();
	await signUpDateInput.pressSequentially(futureDate);

	await page.getByRole('button', { name: 'Save and continue' }).click();
}

async function completeTargetingStep(page: Page) {
	await expect(page.getByRole('heading', { name: 'Targeting' })).toBeVisible();

	const regionFocusGroup = page.getByLabel('Region focus');
	await expect(regionFocusGroup).toBeVisible();
	await expect(regionFocusGroup.getByText('UK', { exact: true })).toBeVisible();
	await expect(regionFocusGroup.getByText('AU', { exact: true })).toBeVisible();
	await expect(regionFocusGroup.getByText('US', { exact: true })).toBeVisible();
	await expect(
		regionFocusGroup.getByText('INT', { exact: true }),
	).toBeVisible();
	await expect(
		regionFocusGroup.getByText('EUR', { exact: true }),
	).toBeVisible();

	await regionFocusGroup.getByText('UK').click();

	const pillarSelect = page.getByLabel('Pillar');
	await expect(pillarSelect).toBeVisible();
	await pillarSelect.click();
	await page.getByRole('option', { name: 'news' }).click();

	const groupSelect = page.getByLabel('Group for MMA page');
	await expect(groupSelect).toBeVisible();
	await groupSelect.click();
	await page.getByRole('option', { name: 'News in depth' }).click();

	await page.getByRole('button', { name: 'Save and continue' }).click();
}

async function completeTagsStep(page: Page) {
	await expect(
		page.getByRole('heading', { name: 'Propose the tags for the newsletter' }),
	).toBeVisible();

	await expect(page.getByLabel('Add the series tag').first()).toBeVisible();
	await expect(
		page.getByLabel('Add the Series tag description').first(),
	).toBeVisible();
	await expect(page.getByLabel('Campaign tag').first()).toBeVisible();
	await expect(page.getByLabel('Campaign description').first()).toBeVisible();

	await page.getByRole('button', { name: 'Save and continue' }).click();
}

async function completePromotionContentStep(page: Page, name: string) {
	await expect(
		page.getByRole('heading', { name: `Sign up page for ${name}.` }),
	).toBeVisible();

	await expect(page.getByLabel('Headline')).toBeVisible();
	await expect(page.getByLabel(/^Description/)).toBeVisible();
	await expect(page.getByLabel('Embed description')).toBeVisible();
	await expect(page.getByLabel('Success message')).toBeVisible();
	await expect(page.getByLabel('Highlight card message')).toBeVisible();
	await expect(
		page.getByLabel('URL of image the newsleter graphic/logo (5:3 format)'),
	).toBeVisible();
	await expect(
		page.getByLabel('URL of image the newsleter graphic/logo (1:1 format)'),
	).toBeVisible();

	await page.getByLabel('Headline').fill(`${name} newsletter`);
	await page.getByLabel(/^Description/).fill(`Sign up for ${name}.`);
	await page
		.getByLabel('Embed description')
		.fill(`Embed description for ${name}.`);
	await page
		.getByLabel('Highlight card message')
		.fill(`Highlight card for ${name}`);

	await page.getByRole('button', { name: 'Save and continue' }).click();
}

async function completeReviewPage(page: Page) {
	await expect(
		page.getByRole('heading', { name: 'Review newsletter setup' }),
	).toBeVisible();

	await page.getByRole('button', { name: 'Continue to launch review' }).click();
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
		await completeNameFrequencyStep(page, draftName, 'Weekly');
		await completeProductionDetailsStep(page, 'article-based');
		await completeDatesStep(page);
		await completeTargetingStep(page);
		await completeTagsStep(page);
		await completePromotionContentStep(page, draftName);
		await completeReviewPage(page);

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
		await completeNameFrequencyStep(page, draftName, 'Weekly');
		await completeProductionDetailsStep(page, 'fronts-based');
		await completeDatesStep(page);
		await completeTargetingStep(page);
		await completeTagsStep(page);
		await completePromotionContentStep(page, draftName);
		await completeReviewPage(page);

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
		await page.getByRole('button', { name: 'Save and continue' }).click();

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
		await completeNameFrequencyStep(page, draftName, 'Weekly');

		// Wait for the production details step to confirm the wizard has advanced.
		await expect(
			page.getByRole('heading', { name: /Production details/ }),
		).toBeVisible();

		// get the nav
		const sideNav = page.getByLabel('Newsletter creation steps');
		await expect(sideNav).toBeVisible();

		await expect(sideNav.getByText('Launch/Promotion Dates')).toBeVisible();
		await expect(sideNav.getByText('Targeting')).toBeVisible();
		await expect(sideNav.getByText('Tag Setting')).toBeVisible();
	});

	test('clicking a step nav button navigates to that step', async ({
		page,
	}) => {
		await page.goto(CREATE_URL);
		await completeIntroStep(page);
		await completeNameFrequencyStep(page, draftName, 'Weekly');

		// Wait for the production details step to confirm the wizard has advanced.
		await expect(
			page.getByRole('heading', { name: /Production details/ }),
		).toBeVisible();

		// get the nav
		const sideNav = page.getByLabel('Newsletter creation steps');
		await expect(sideNav).toBeVisible();

		// Skip from Production Details to Targeting.
		await sideNav.getByText('Targeting').click();

		await expect(
			page.getByRole('heading', { name: /Targeting/ }),
		).toBeVisible();
	});
});
