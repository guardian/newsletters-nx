import type { RegionFocus } from '@newsletters-nx/newsletters-data-client';
import { workflowStatusEnumSchema } from '@newsletters-nx/newsletters-data-client';
import type { APIRequestContext, Locator, Page } from '@playwright/test';
import { expect } from '@playwright/test';
import type { DataTable } from 'playwright-bdd';
import { createFixtureNewsletter } from '../../../helpers/test-fixtures';
import type { NamedNewsletterRef } from './fixtures';
import { Given, Then, When } from './fixtures';

type Status = 'paused' | 'cancelled' | 'live' | 'pending';
type NamedNewsletters = { refsByName: Record<string, NamedNewsletterRef> };
type FixtureOverrides = Parameters<typeof createFixtureNewsletter>[1];

const GRAPHIC_URL = 'https://uploads.guim.co.uk/2025/06/30/Business_5-3.jpg';
const SQUARE_URL =
	'https://uploads.guim.co.uk/2025/05/15/Matters_of_opinion_11.jpg';
const BANNER_URL = 'https://uploads.guim.co.uk/2025/06/30/Business.jpg';
const BANNER_MOBILE_URL =
	'https://uploads.guim.co.uk/2024/08/14/BreakingNewsAustralia_Red_2_email-header.png';

// The page header is the only <header> in <main> with an h2 (panel headers
// use h3). It isn't a `banner` because a <header> nested in <main> has no
// implicit landmark role, hence the element selector.
const pageHeader = (page: Page): Locator =>
	page
		.getByRole('main')
		.locator('header')
		.filter({ has: page.getByRole('heading', { level: 2 }) });

const createLaunched = async (
	request: APIRequestContext,
	namedNewsletters: NamedNewsletters,
	name: string,
	overrides: FixtureOverrides = {},
): Promise<string> => {
	const { identityName, listId } = await createFixtureNewsletter(request, {
		name,
		...overrides,
	});
	namedNewsletters.refsByName[name] = {
		kind: 'launched',
		identityName,
		listId,
	};
	return identityName;
};

const identityNameFor = (
	namedNewsletters: NamedNewsletters,
	name: string,
): string => {
	const ref = namedNewsletters.refsByName[name];
	if (ref?.kind !== 'launched') {
		throw new Error(`No launched newsletter named "${name}" in this scenario`);
	}
	return ref.identityName;
};

Given(
	'a launched newsletter {string} with these details:',
	async ({ request, namedNewsletters }, name: string, table: DataTable) => {
		const overrides: FixtureOverrides = {};
		for (const { field, value } of table.hashes()) {
			if (field === undefined || value === undefined) {
				throw new Error(
					'Newsletter details table must have "field" and "value" columns',
				);
			}
			switch (field) {
				case 'headline':
					overrides.signUpHeadline = value;
					break;
				case 'sign-up description':
					overrides.signUpDescription = value;
					break;
				case 'embed description':
					overrides.signUpEmbedDescription = value;
					break;
				case 'success message':
					overrides.mailSuccessDescription = value;
					break;
				case 'highlight card message':
					overrides.highlightCardTitle = value;
					break;
				case 'sign-up page creation status':
					overrides.signupPageCreationStatus =
						workflowStatusEnumSchema.parse(value);
					break;
				case 'tag creation status':
					overrides.tagCreationStatus = workflowStatusEnumSchema.parse(value);
					break;
				case 'sign-up page path':
					overrides.signupPage = value;
					break;
				case 'series tag':
					overrides.seriesTag = value;
					break;
				case 'tag description':
					overrides.seriesTagDescription = value;
					break;
				case 'campaign tag':
					overrides.composerTag = value;
					break;
				case 'campaign description':
					overrides.composerCampaignTag = value;
					break;
				default:
					throw new Error(`Unknown newsletter detail field: "${field}"`);
			}
		}
		await createLaunched(request, namedNewsletters, name, overrides);
	},
);

Given(
	'a launched newsletter {string} with identity name {string}',
	async ({ request, namedNewsletters }, name: string, identityName: string) => {
		await createLaunched(request, namedNewsletters, name, { identityName });
	},
);

Given(
	'a launched newsletter {string} with status {string} and region focus {string}',
	async (
		{ request, namedNewsletters },
		name: string,
		status: Status,
		region: string,
	) => {
		await createLaunched(request, namedNewsletters, name, {
			status,
			regionFocus: region as RegionFocus,
		});
	},
);

Given(
	'a launched newsletter {string} with no region focus',
	async ({ request, namedNewsletters }, name: string) => {
		// Undefined is dropped when the request is serialised, which overrides
		// the fixture's default region.
		await createLaunched(request, namedNewsletters, name, {
			regionFocus: undefined,
		});
	},
);

Given(
	'a launched newsletter {string} with a card graphic',
	async ({ request, namedNewsletters }, name: string) => {
		await createLaunched(request, namedNewsletters, name, {
			illustrationCard: GRAPHIC_URL,
		});
	},
);

Given(
	'a launched newsletter {string} with no card graphic',
	async ({ request, namedNewsletters }, name: string) => {
		await createLaunched(request, namedNewsletters, name);
	},
);

Given(
	'a launched newsletter {string} with all four images',
	async ({ request, namedNewsletters }, name: string) => {
		await createLaunched(request, namedNewsletters, name, {
			illustrationCard: GRAPHIC_URL,
			illustrationSquare: SQUARE_URL,
			renderingOptions: {
				mainBannerUrl: BANNER_URL,
				mainBannerMobileUrl: BANNER_MOBILE_URL,
			},
		});
	},
);
Given('the editor is using a small viewport', async ({ page }) => {
	// Between the mobile (<=393px) and stacked (<=600px) breakpoints.
	await page.setViewportSize({ width: 500, height: 800 });
});

When('the editor goes to {string}', async ({ page }, path: string) => {
	await page.goto(path);
});

When(
	'the editor opens the detail page for {string}',
	async ({ page, namedNewsletters }, name: string) => {
		await page.goto(`/newsletters/${identityNameFor(namedNewsletters, name)}`);
	},
);

When(
	'the editor opens the detail page for a launched newsletter',
	async ({ page, request, namedNewsletters }) => {
		// With a graphic, so that hiding it on mobile is observable.
		const identityName = await createLaunched(
			request,
			namedNewsletters,
			'Afternoon update',
			{ illustrationCard: GRAPHIC_URL },
		);
		await page.goto(`/newsletters/${identityName}`);
	},
);

When('the editor selects "Back to all newsletters"', async ({ page }) => {
	await page.getByRole('link', { name: 'Back to all newsletters' }).click();
});

Then(
	'the detail page for {string} is shown',
	async ({ page }, name: string) => {
		await expect(page).toHaveURL(/\/newsletters\/[^/]+\/details$/);
		await expect(page.getByRole('heading', { level: 2, name })).toBeVisible();
	},
);

Then('the editor sees the not found page', async ({ page }) => {
	await expect(page.getByText('NOT FOUND!')).toBeVisible();
});

Then('the header shows the title {string}', async ({ page }, title: string) => {
	await expect(pageHeader(page).getByRole('heading', { level: 2 })).toHaveText(
		title,
	);
});

Then('the header shows the label {string}', async ({ page }, label: string) => {
	await expect(
		pageHeader(page).getByText(label, { exact: true }),
	).toBeVisible();
});

Then(
	'the header shows a {string} status badge',
	async ({ page }, status: string) => {
		await expect(
			pageHeader(page).getByText(status, { exact: true }),
		).toBeVisible();
	},
);

Then('the header shows the card graphic', async ({ page }) => {
	await expect(pageHeader(page).locator('img')).toBeVisible();
});

Then('the header shows {string}', async ({ page }, text: string) => {
	await expect(pageHeader(page).getByText(text, { exact: true })).toBeVisible();
});

Then('the header shows the title above the graphic', async ({ page }) => {
	const header = pageHeader(page);
	const title = await header.getByRole('heading', { level: 2 }).boundingBox();
	const graphic = await header.locator('img').boundingBox();
	if (!title || !graphic) {
		throw new Error('Expected the title and the graphic to be rendered');
	}
	expect(title.y + title.height).toBeLessThanOrEqual(graphic.y);
});

Then('the header does not show the card graphic', async ({ page }) => {
	await expect(pageHeader(page).locator('img')).toBeHidden();
});
Given(
	'a launched newsletter {string}',
	async ({ request, namedNewsletters }, name: string) => {
		await createLaunched(request, namedNewsletters, name);
	},
);
When('the editor selects the {string} tab', async ({ page }, tab: string) => {
	await page.getByRole('tab', { name: tab }).click();
});
Then('the {string} tab is selected', async ({ page }, tab: string) => {
	await expect(page.getByRole('tab', { name: tab })).toHaveAttribute(
		'aria-selected',
		'true',
	);
});
Then(
	'the existing preview for {string} is shown',
	async ({ page, namedNewsletters }, name: string) => {
		await expect(page).toHaveURL(
			new RegExp(
				`/launched/preview/${identityNameFor(namedNewsletters, name)}$`,
			),
		);
	},
);

Then(
	'the {string} panel shows:',
	async ({ page }, panelName: string, table: DataTable) => {
		const panel = page.locator('section', {
			has: page.getByRole('heading', {
				level: 3,
				name: panelName,
				exact: true,
			}),
		});
		for (const { label, value } of table.hashes()) {
			if (label === undefined || value === undefined) {
				throw new Error('Panel table must have "label" and "value" columns');
			}
			// Find the row whose label (term) matches, then check its value.
			const row = panel.locator('dl > div').filter({
				has: page.getByText(label, { exact: true }).and(page.getByRole('term')),
			});
			await expect(row.getByRole('definition')).toHaveText(value);
		}
	},
);

Then(
	'the {string} panel shows a thumbnail for {string}',
	async ({ page }, panelName: string, label: string) => {
		const panel = page.locator('section', {
			has: page.getByRole('heading', {
				level: 3,
				name: panelName,
				exact: true,
			}),
		});
		const row = panel.locator('dl > div').filter({
			has: page.getByText(label, { exact: true }).and(page.getByRole('term')),
		});
		await expect(row.locator('img')).toBeVisible();
	},
);

Then(
	'the {string} panel shows the images in order',
	async ({ page }, panelName: string) => {
		const panel = page.locator('section', {
			has: page.getByRole('heading', {
				level: 3,
				name: panelName,
				exact: true,
			}),
		});
		await expect(panel.getByRole('term')).toHaveText([
			'Main banner graphic',
			'Main banner graphic (mobile)',
			'Newsletter graphic (5:3)',
			'Newsletter square (1:1)',
		]);
		await expect(panel.getByRole('definition')).toHaveText([
			BANNER_URL,
			BANNER_MOBILE_URL,
			GRAPHIC_URL,
			SQUARE_URL,
		]);
	},
);
