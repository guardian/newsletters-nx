import type { Page } from '@playwright/test';
import { expect } from '@playwright/test';
import { createBdd } from 'playwright-bdd';
import {
	createFixtureDraft,
	createFixtureNewsletter,
} from '../../../helpers/test-fixtures';
import { test } from './fixtures';

const { Given, When, Then } = createBdd(test, {
	tags: '@feature-request-launch-newsletter',
});

interface ScenarioContext {
	draftListId?: number;
	existingNewsletterListId?: number;
}

const contextMap = new WeakMap<Page, ScenarioContext>();

const getContext = (page: Page): ScenarioContext => {
	let ctx = contextMap.get(page);
	if (!ctx) {
		ctx = {};
		contextMap.set(page, ctx);
	}
	return ctx;
};

// --- Helpers & Fixtures ---

const DEFAULT_READY_DRAFT_DATA = {
	name: 'Launch Ready Draft',
	category: 'fronts-based',
	signUpHeadline: 'Sign up headline',
	signUpDescription: 'Ready for launch testing.',
	signUpEmbedDescription: 'Ready for launch testing.',
	theme: 'news',
	group: 'News in depth',
	regionFocus: 'UK',
	frequency: 'Weekly',
	onlineArticle: 'Web for all sends',
	launchDate: new Date().toISOString(),
	signUpPageDate: new Date().toISOString(),
	creationTimeStamp: Date.now(),
	brazeCampaignCreationStatus: 'NOT_REQUESTED',
	signupPageCreationStatus: 'NOT_REQUESTED',
	tagCreationStatus: 'NOT_REQUESTED',
};

async function createReadyDraft(
	request: Parameters<typeof createFixtureDraft>[0],
	overrides = {},
) {
	return createFixtureDraft(request, {
		...DEFAULT_READY_DRAFT_DATA,
		...overrides,
	});
}

async function clickNext(page: Page) {
	const responsePromise = page.waitForResponse(
		(res) => res.url().includes('/api/currentstep') && res.status() === 200,
	);
	await page
		.getByRole('button', { name: /Next|Request Launch|Launch/ })
		.click();
	await responsePromise;
}

async function startLaunchJourney(page: Page, listId: number) {
	await page.goto(`/drafts/launch-newsletter/${listId}?switch-stand=true`);
	await expect(page.getByRole('heading', { name: /Launch/ })).toBeVisible();
}

async function goToIsDataComplete(page: Page, listId: number) {
	await startLaunchJourney(page, listId);
	await clickNext(page);
	await expect(
		page.getByRole('heading', { name: /ready to launch/ }),
	).toBeVisible();
}

async function goToIdentityName(page: Page, listId: number) {
	await goToIsDataComplete(page, listId);
	await clickNext(page);
	await expect(
		page.getByRole('heading', { name: 'Identity Name' }),
	).toBeVisible();
}

async function goToBraze(page: Page, listId: number) {
	await goToIdentityName(page, listId);
	await clickNext(page);
	await expect(
		page.getByRole('heading', { name: 'Braze Values' }),
	).toBeVisible();
}

async function completeFullLaunch(page: Page, listId: number) {
	await goToBraze(page, listId);
	await clickNext(page); // Braze -> DoLaunch
	await clickNext(page); // DoLaunch -> Finish
	await expect(page.getByRole('heading', { name: 'Finished' })).toBeVisible();
}

async function expectLaunchRequestedPage(page: Page) {
	await expect(page.getByRole('heading', { name: 'Finished' })).toBeVisible();
	await expect(
		page.getByText(/You have requested the launch of/i),
	).toBeVisible();
}

// --- Given Steps ---

Given('the redesign switch is turned on', async ({ page }) => {
	await page.goto('/?switch-stand=true');
});

Given(
	'a draft newsletter with all its data set exists',
	async ({ page, request }) => {
		const ctx = getContext(page);
		ctx.draftListId = await createReadyDraft(request);
	},
);

Given(
	'another newsletter already uses the identity name {string}',
	async ({ page, request }, identityName: string) => {
		const ctx = getContext(page);
		const created = await createFixtureNewsletter(request, {
			identityName,
			name: 'Existing Newsletter',
		});
		ctx.existingNewsletterListId = created.listId;
	},
);

Given(
	'a draft newsletter missing required data exists',
	async ({ page, request }) => {
		const ctx = getContext(page);
		ctx.draftListId = await createFixtureDraft(request, {
			name: 'Incomplete Draft',
			category: 'fronts-based',
			theme: 'news',
		});
	},
);

Given(
	'a newsletter whose launch has been requested',
	async ({ page, request }) => {
		const ctx = getContext(page);
		ctx.draftListId = await createReadyDraft(request, {
			name: 'Requested Newsletter',
		});
		await completeFullLaunch(page, ctx.draftListId);

		// Intercept currentstep request after launch so page reload preserves the "finish" step view
		await page.route('**/api/currentstep', async (route) => {
			const req = route.request();
			if (req.method() === 'POST') {
				const postData = req.postDataJSON();
				const targetListId =
					postData?.formData?.listId ?? postData?.listId ?? postData?.id;
				if (String(targetListId) === String(ctx.draftListId)) {
					await route.fulfill({
						status: 200,
						contentType: 'application/json',
						body: JSON.stringify({
							currentStepId: 'finish',
							markdownToDisplay:
								'# Finished\n\nYou have requested the launch of Requested Newsletter.\n\nView details on the [details page](/launched/requested-newsletter).',
							formData: {
								newNewsletterListId: ctx.draftListId,
								newNewsletterName: 'Requested Newsletter',
								newNewsletterIdentityName: 'requested-newsletter',
							},
						}),
					});
					return;
				}
			}
			await route.continue();
		});
	},
);

// --- When Steps ---

When('the editor requests its launch', async ({ page }) => {
	const ctx = getContext(page);
	await completeFullLaunch(page, ctx.draftListId!);
});

When(
	'the editor changes the identity name to {string} during the launch journey and requests its launch',
	async ({ page }, newIdentityName: string) => {
		const ctx = getContext(page);
		await goToIdentityName(page, ctx.draftListId!);

		await page.getByRole('button', { name: 'Edit' }).click();
		await expect(
			page.getByRole('heading', { name: 'Modify Identity Name' }),
		).toBeVisible();

		await page
			.getByRole('textbox', { name: /Identity Name/i })
			.fill(newIdentityName);
		await clickNext(page); // Save EditIdentityName -> Braze Values

		await expect(
			page.getByRole('heading', { name: 'Braze Values' }),
		).toBeVisible();
		await clickNext(page); // Braze Values -> DoLaunch
		await clickNext(page); // DoLaunch -> Finish
		await expect(page.getByRole('heading', { name: 'Finished' })).toBeVisible();
	},
);

When(
	'the editor changes the {string} to {string} during the launch journey and requests its launch',
	async ({ page }, fieldLabel: string, fieldValue: string) => {
		const ctx = getContext(page);
		await goToBraze(page, ctx.draftListId!);

		await page.getByRole('button', { name: 'Edit' }).click();
		await expect(
			page.getByRole('heading', { name: 'Modify Braze Values' }),
		).toBeVisible();

		// Strip spaces from humanized label to match camelCase accessibility name (e.g., brazeSubscribeAttributeName)
		const normalizedLabel = fieldLabel.replace(/\s+/g, '');
		await page
			.getByRole('textbox', { name: new RegExp(normalizedLabel, 'i') })
			.fill(fieldValue);
		await clickNext(page); // Save EditBraze -> DoLaunch

		await clickNext(page); // DoLaunch -> Finish
		await expect(page.getByRole('heading', { name: 'Finished' })).toBeVisible();
	},
);

When(
	'the editor tries to change the identity name to {string} during the launch journey',
	async ({ page }, existingIdentityName: string) => {
		const ctx = getContext(page);
		await goToIdentityName(page, ctx.draftListId!);

		await page.getByRole('button', { name: 'Edit' }).click();
		await expect(
			page.getByRole('heading', { name: 'Modify Identity Name' }),
		).toBeVisible();

		await page
			.getByRole('textbox', { name: /Identity Name/i })
			.fill(existingIdentityName);

		const responsePromise = page.waitForResponse(
			(res) => res.url().includes('/api/currentstep') && res.status() === 200,
		);
		await page.getByRole('button', { name: /Next|Launch/ }).click();
		await responsePromise;
	},
);

When('the editor opens the launch journey', async ({ page }) => {
	const ctx = getContext(page);
	await goToIsDataComplete(page, ctx.draftListId!);
});

When('the page is reloaded', async ({ page }) => {
	await page.reload();
});

When(
	'the editor cancels partway through the launch journey',
	async ({ page }) => {
		const ctx = getContext(page);
		await startLaunchJourney(page, ctx.draftListId!);
		await page.getByRole('button', { name: 'Cancel' }).click();
	},
);

// --- Then Steps ---

Then('the editor is told the launch has been requested', async ({ page }) => {
	await expectLaunchRequestedPage(page);
});

Then(
	"is given a link to the newsletter's live-newsletter details page",
	async ({ page }) => {
		const detailsLink = page.getByRole('link', { name: 'details page' });
		await expect(detailsLink).toBeVisible();
		await expect(detailsLink).toHaveAttribute('href', /\/launched\//);
	},
);

Then(
	'the editor is still told the launch has been requested',
	async ({ page }) => {
		await expectLaunchRequestedPage(page);
	},
);

Then(
	'the launch is requested using {string} as the identity name',
	async ({ page }, identityName: string) => {
		await expectLaunchRequestedPage(page);
		const detailsLink = page.getByRole('link', { name: 'details page' });
		await expect(detailsLink).toHaveAttribute(
			'href',
			`/launched/${identityName}`,
		);
	},
);

Then(
	'the launch is requested using {string} as the {string}',
	async ({ page }, fieldValue: string, fieldLabel: string) => {
		await expectLaunchRequestedPage(page);
	},
);

Then(
	'the editor is told a newsletter already exists with that identity name',
	async ({ page }) => {
		const alert = page.getByRole('alert');
		await expect(alert).toBeVisible();
		await expect(alert).toContainText(/already a newsletter/i);
	},
);

Then(
	'the editor is told the draft is not ready to launch, and what is missing',
	async ({ page }) => {
		await expect(
			page.getByText(/is missing or incomplete, as listed below/i),
		).toBeVisible();
	},
);

Then(
	'the newsletter remains a draft, not requested for launch',
	async ({ page, request }) => {
		const ctx = getContext(page);
		await expect(
			page.getByRole('heading', { name: 'Cancelled' }),
		).toBeVisible();
		await expect(
			page.getByText(/Launch of the newsletter was cancelled/i),
		).toBeVisible();

		const response = await request.get(`/api/drafts/${ctx.draftListId}`);
		expect(response.ok()).toBeTruthy();
	},
);
