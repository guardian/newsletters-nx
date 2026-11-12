import type { DraftNewsletterData } from '@newsletters-nx/newsletters-data-client';
import { expect } from '@playwright/test';
import { createFixtureDraft } from '../../../helpers/test-fixtures';
import type { NamedNewsletterRef } from './fixtures';
import { Given, Then, When } from './fixtures';

const API_BASE = process.env['API_URL'] ?? 'http://localhost:3000';

const draftId = (ref: NamedNewsletterRef | undefined): number => {
	if (ref?.kind !== 'draft') {
		throw new Error('Expected a draft created by this scenario');
	}
	return ref.listId;
};

Given(
	'an article-based draft {string} with {int} required setup steps complete and no rendering options',
	async ({ request, namedNewsletters }, name: string, completed: number) => {
		if (completed !== 1 && completed !== 5) {
			throw new Error('This fixture supports one or five completed steps');
		}
		const draft: DraftNewsletterData = {
			name,
			frequency: 'Weekly',
			category: 'article-based',
			...(completed === 5
				? ({
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
					} as const)
				: {}),
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

Then('the draft header badge is {string}', async ({ page }, label: string) => {
	const header = page
		.getByRole('main')
		.locator('header')
		.filter({
			has: page.getByRole('heading', { level: 2 }),
		});
	await expect(header.getByText(label, { exact: true })).toBeVisible();
});

Then('the draft details are read-only', async ({ page }) => {
	for (const name of [
		'Attributes',
		'Images',
		'Copy',
		'Sign-up page and tags',
		'Integrations',
		'Technical output',
	]) {
		const panel = page.locator('section').filter({
			has: page.getByRole('heading', { level: 3, name, exact: true }),
		});
		await expect(panel).toBeVisible();
		await expect(
			panel.getByRole('button', { name: 'Edit', exact: true }),
		).toHaveCount(0);
		await expect(panel.locator('input, textarea, select')).toHaveCount(0);
	}
	await expect(
		page
			.getByRole('group', { name: 'Frequency', exact: true })
			.getByRole('definition'),
	).toHaveText('Weekly');
});

When(
	'the editor continues setup for {string}',
	async ({ page, namedNewsletters }, name: string) => {
		const link = page.getByRole('link', {
			name: 'Continue set up',
			exact: true,
		});
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
			new RegExp(
				`/drafts/newsletter-data/${draftId(namedNewsletters.refsByName[name])}$`,
			),
		);
		await expect(
			page.getByRole('button', { name: 'Name & frequency' }),
		).toBeVisible();
	},
);

Then(
	'the draft page offers edit, launch and optional rendering links for {string}',
	async ({ page, request, namedNewsletters }, name: string) => {
		const id = draftId(namedNewsletters.refsByName[name]);
		await expect(
			page.getByRole('link', { name: 'Edit details', exact: true }),
		).toHaveAttribute('href', `/drafts/newsletter-data/${id}`);
		await expect(
			page.getByRole('link', { name: 'Request to launch', exact: true }),
		).toHaveAttribute('href', `/drafts/launch-newsletter/${id}`);
		const optional = page.getByRole('region', { name: 'Optional set-up' });
		await expect(
			optional.getByRole('link', {
				name: 'Set up article rendering',
				exact: true,
			}),
		).toHaveAttribute('href', `/drafts/newsletter-data-rendering/${id}`);
		await expect(optional).toContainText('You can launch without this.');
		const response = await request.get(`${API_BASE}/api/drafts/${id}`);
		expect(response.ok()).toBe(true);
		const payload = (await response.json()) as {
			ok: boolean;
			data: DraftNewsletterData;
		};
		expect(payload.ok).toBe(true);
		expect(payload.data.renderingOptions).toBeUndefined();
	},
);

When(
	'the editor requests launch for {string}',
	async ({ page, namedNewsletters }, name: string) => {
		await page
			.getByRole('link', { name: 'Request to launch', exact: true })
			.click();
		await expect(page).toHaveURL(
			new RegExp(
				`/drafts/launch-newsletter/${draftId(namedNewsletters.refsByName[name])}$`,
			),
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
		// Stop before launch: no external services or live newsletters are changed.
	},
);

When('the editor cancels deleting the draft', async ({ page }) => {
	await page.getByRole('button', { name: 'Delete draft', exact: true }).click();
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
		await expect(page).toHaveURL(new RegExp(`/drafts/${id}$`));
		const response = await request.get(`${API_BASE}/api/drafts/${id}`);
		expect(response.ok()).toBe(true);
		expect(await response.json()).toMatchObject({ ok: true, data: { name } });
	},
);

When(
	'the editor confirms deletion of {string}',
	async ({ page, namedNewsletters }, name: string) => {
		const id = draftId(namedNewsletters.refsByName[name]);
		await page
			.getByRole('button', { name: 'Delete draft', exact: true })
			.click();
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
	'the draft {string} is deleted and the editor returns to All newsletters',
	async ({ page, request, namedNewsletters }, name: string) => {
		const id = draftId(namedNewsletters.refsByName[name]);
		await expect(page).toHaveURL(/\/all$/);
		await expect(
			page.getByText('Draft deleted', { exact: true }),
		).toBeVisible();
		const grid = page.getByRole('grid', { name: 'All newsletters' });
		await expect(grid).toBeVisible();
		await expect(grid.locator(`tr[data-href="/drafts/${id}"]`)).toHaveCount(0);
		const response = await request.get(`${API_BASE}/api/drafts/${id}`);
		expect(response.status()).toBe(404);
	},
);

Then(
	'the draft page has no setup, launch, rendering or delete actions',
	async ({ page }) => {
		await expect(
			page.getByRole('region', { name: 'Draft set-up' }).getByRole('link'),
		).toHaveCount(0);
		await expect(
			page.getByRole('region', { name: 'Optional set-up' }).getByRole('link'),
		).toHaveCount(0);
		await expect(
			page.getByRole('button', { name: 'Delete draft', exact: true }),
		).toHaveCount(0);
	},
);
