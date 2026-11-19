import type { DraftNewsletterData } from '@newsletters-nx/newsletters-data-client';
import type { Page } from '@playwright/test';
import { expect } from '@playwright/test';
import {
	getDraftNewsletter,
	getDraftNewsletterResponse,
} from '../../../helpers/draft-newsletter';
import { createFixtureDraft } from '../../../helpers/test-fixtures';
import { panelByName } from '../helpers/newsletter-detail-page';
import type { NamedNewsletterRef } from './fixtures';
import { Given, Then, When } from './fixtures';

const draftId = (ref: NamedNewsletterRef | undefined): number => {
	if (ref?.kind !== 'draft') {
		throw new Error('Expected a draft created by this scenario');
	}
	return ref.listId;
};

const draftActions = (page: Page) => ({
	continueSetup: page.getByRole('link', {
		name: 'Continue set up',
		exact: true,
	}),
	editDetails: page.getByRole('link', { name: 'Edit details', exact: true }),
	requestLaunch: page.getByRole('link', {
		name: 'Request to launch',
		exact: true,
	}),
	setupRendering: page.getByRole('link', {
		name: 'Set up article rendering',
		exact: true,
	}),
	editRendering: page.getByRole('link', {
		name: 'Edit article rendering',
		exact: true,
	}),
	deleteDraft: page.getByRole('button', { name: 'Delete draft', exact: true }),
});

const incompleteDraft = (name: string): DraftNewsletterData => ({
	name,
	frequency: 'Weekly',
	category: 'article-based',
});

Given(
	'an incomplete article-based draft {string} with no rendering options',
	async ({ request, namedNewsletters }, name: string) => {
		const listId = await createFixtureDraft(request, incompleteDraft(name));
		namedNewsletters.refsByName[name] = { kind: 'draft', listId };
	},
);

Given(
	'an article-based draft {string} with weekly frequency',
	async ({ request, namedNewsletters }, name: string) => {
		const listId = await createFixtureDraft(request, incompleteDraft(name));
		namedNewsletters.refsByName[name] = { kind: 'draft', listId };
	},
);

Given(
	'an article-based draft {string} with all required setup complete and no rendering options',
	async ({ request, namedNewsletters }, name: string) => {
		const draft: DraftNewsletterData = {
			...incompleteDraft(name),
			onlineArticle: 'Email only',
			launchDate: new Date('2027-01-15'),
			signUpPageDate: new Date('2027-01-01'),
			privateUntilLaunch: false,
			regionFocus: 'UK',
			theme: 'news',
			group: 'News in depth',
			signUpHeadline: 'Your weekly briefing',
			signUpDescription: 'The news that matters, every week.',
			signUpEmbedDescription: 'Sign up for the weekly briefing.',
			creationTimeStamp: Date.now(),
			brazeCampaignCreationStatus: 'NOT_REQUESTED',
			signupPageCreationStatus: 'NOT_REQUESTED',
			tagCreationStatus: 'NOT_REQUESTED',
		};
		const listId = await createFixtureDraft(request, draft);
		namedNewsletters.refsByName[name] = { kind: 'draft', listId };
	},
);

Given(
	'an incomplete article-based draft {string} with rendering options',
	async ({ request, namedNewsletters }, name: string) => {
		const draft: DraftNewsletterData = {
			...incompleteDraft(name),
			renderingOptions: { displayDate: true },
		};
		const listId = await createFixtureDraft(request, draft);
		namedNewsletters.refsByName[name] = { kind: 'draft', listId };
	},
);

Given(
	'an incomplete fronts-based draft {string} with rendering options',
	async ({ request, namedNewsletters }, name: string) => {
		const draft: DraftNewsletterData = {
			...incompleteDraft(name),
			category: 'fronts-based',
			renderingOptions: { displayDate: true },
		};
		const listId = await createFixtureDraft(request, draft);
		namedNewsletters.refsByName[name] = { kind: 'draft', listId };
	},
);

When(
	'the editor opens the draft page for {string}',
	async ({ page, namedNewsletters }, name: string) => {
		const permissions = page.waitForResponse('**/api/user/permissions');
		await page.goto(`/drafts/${draftId(namedNewsletters.refsByName[name])}`);
		await permissions;
		await expect(
			page.getByRole('heading', { level: 2, name, exact: true }),
		).toBeVisible();
		await expect(page.getByRole('main')).toHaveCount(1);
	},
);

Then(
	'the draft page shows {int} of 5 required steps complete',
	async ({ page }, completed: number) => {
		const progress = page.getByRole('progressbar');
		await expect(progress).toHaveAttribute('aria-valuenow', String(completed));
		await expect(progress).toHaveAttribute('aria-valuemax', '5');
		await expect(progress).toContainText(
			`${completed} of 5 required steps complete`,
		);
	},
);

Then('the draft details are read-only', async ({ page }) => {
	for (const name of [
		'Attributes',
		'Launch',
		'Images',
		'Copy',
		'Sign-up page and tags',
		'Integrations',
	]) {
		const panel = panelByName(page, name);
		await expect(panel).toBeVisible();
		await expect(
			panel.getByRole('button', { name: 'Edit', exact: true }),
		).toHaveCount(0);
		await expect(panel.locator('input, textarea, select')).toHaveCount(0);
	}
	await expect(panelByName(page, 'Technical output')).toHaveCount(0);
});

When(
	'the editor continues setup for {string}',
	async ({ page, namedNewsletters }, name: string) => {
		const link = draftActions(page).continueSetup;
		await expect(link).toHaveAttribute(
			'href',
			`/drafts/newsletter-data/${draftId(namedNewsletters.refsByName[name])}`,
		);
		await link.click();
	},
);

Then(
	'the setup wizard for {string} is shown',
	async ({ page, namedNewsletters }, name: string) => {
		await expect(page).toHaveURL(
			`/drafts/newsletter-data/${draftId(namedNewsletters.refsByName[name])}`,
		);
		await expect(
			page.getByRole('button', { name: 'Name & frequency' }),
		).toBeVisible();
	},
);

Then(
	'the draft page offers edit, launch and optional rendering links for {string}',
	async ({ page, namedNewsletters }, name: string) => {
		const id = draftId(namedNewsletters.refsByName[name]);
		const actions = draftActions(page);
		await expect(actions.editDetails).toHaveAttribute(
			'href',
			`/drafts/newsletter-data/${id}`,
		);
		await expect(actions.requestLaunch).toHaveAttribute(
			'href',
			`/drafts/launch-newsletter/${id}`,
		);
		await expect(actions.setupRendering).toHaveAttribute(
			'href',
			`/drafts/newsletter-data-rendering/${id}`,
		);
		await expect(
			page.getByRole('region', { name: 'Optional set-up' }),
		).toContainText('You can launch without this.');
	},
);

Then(
	'the draft page offers to edit article rendering for {string}',
	async ({ page, namedNewsletters }, name: string) => {
		const id = draftId(namedNewsletters.refsByName[name]);
		const actions = draftActions(page);
		await expect(actions.editRendering).toHaveAttribute(
			'href',
			`/drafts/newsletter-data-rendering/${id}`,
		);
		await expect(actions.setupRendering).toHaveCount(0);
	},
);

Then('the draft page has no article rendering options', async ({ page }) => {
	await expect(
		page.getByRole('region', { name: 'Optional set-up' }),
	).toHaveCount(0);
	const actions = draftActions(page);
	await expect(actions.setupRendering).toHaveCount(0);
	await expect(actions.editRendering).toHaveCount(0);
});

When(
	'the editor requests launch for {string}',
	async ({ page, namedNewsletters }, name: string) => {
		await draftActions(page).requestLaunch.click();
		await expect(page).toHaveURL(
			`/drafts/launch-newsletter/${draftId(namedNewsletters.refsByName[name])}`,
		);
		await expect(
			page.getByRole('heading', { name: `Launch ${name}`, exact: true }),
		).toBeVisible();
		await page.getByRole('button', { name: 'Next', exact: true }).click();
	},
);

Then(
	'launch validation accepts {string} without rendering options',
	async ({ page }, name: string) => {
		await expect(
			page.getByText(
				`Yes! The draft for ${name} has all the necessary information set and is ready to launch.`,
			),
		).toBeVisible();
	},
);

When('the editor cancels deleting the draft', async ({ page }) => {
	await draftActions(page).deleteDraft.click();
	await page
		.getByRole('dialog')
		.getByRole('button', { name: 'Cancel', exact: true })
		.click();
	await expect(page.getByRole('dialog')).toHaveCount(0);
});

Then(
	'the draft {string} still exists',
	async ({ page, request, namedNewsletters }, name: string) => {
		const id = draftId(namedNewsletters.refsByName[name]);
		await expect(page).toHaveURL(`/drafts/${id}`);
		expect(await getDraftNewsletter(request, id)).toMatchObject({ name });
	},
);

When(
	'the editor confirms deletion of {string}',
	async ({ page, namedNewsletters }, name: string) => {
		const id = draftId(namedNewsletters.refsByName[name]);
		await draftActions(page).deleteDraft.click();
		const deleted = page.waitForResponse(
			(response) =>
				response.url().endsWith(`/api/drafts/${id}`) &&
				response.request().method() === 'DELETE',
		);
		await page
			.getByRole('dialog')
			.getByRole('button', { name: 'Confirm delete', exact: true })
			.click();
		expect((await deleted).ok()).toBe(true);
	},
);

Then(
	'the draft {string} is deleted with a confirmation toast',
	async ({ page, request, namedNewsletters }, name: string) => {
		const id = draftId(namedNewsletters.refsByName[name]);
		await expect(
			page.getByText('Draft deleted', { exact: true }),
		).toBeVisible();
		await expect(
			page
				.getByRole('grid', { name: 'All newsletters' })
				.locator(`tr[data-href="/drafts/${id}"]`),
		).toHaveCount(0);
		const response = await getDraftNewsletterResponse(request, id);
		expect(response.status()).toBe(404);
	},
);

Then(
	'the draft page has no setup, launch, rendering or delete actions',
	async ({ page }) => {
		for (const action of Object.values(draftActions(page))) {
			await expect(action).toHaveCount(0);
		}
	},
);
