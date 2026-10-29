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
type PanelRow = { label: string; value: string };

const GRAPHIC_URL = 'https://uploads.guim.co.uk/2025/06/30/Business_5-3.jpg';
const SQUARE_URL =
	'https://uploads.guim.co.uk/2025/05/15/Matters_of_opinion_11.jpg';
const BANNER_URL = 'https://uploads.guim.co.uk/2025/06/30/Business.jpg';
const BANNER_MOBILE_URL =
	'https://uploads.guim.co.uk/2024/08/14/BreakingNewsAustralia_Red_2_email-header.png';
const DEFAULT_RENDERING_OPTION_FLAGS = {
	displayDate: false,
	displayStandfirst: false,
	displayImageCaptions: false,
};

// The page header is the only <header> in <main> with an h2 (panel headers
// use h3). It isn't a `banner` because a <header> nested in <main> has no
// implicit landmark role, hence the element selector.
const pageHeader = (page: Page): Locator =>
	page
		.getByRole('main')
		.locator('header')
		.filter({ has: page.getByRole('heading', { level: 2 }) });

const panelByName = (page: Page, panelName: string): Locator =>
	page.locator('section', {
		has: page.getByRole('heading', {
			level: 3,
			name: panelName,
			exact: true,
		}),
	});

const definitionForLabel = (panel: Locator, label: string): Locator =>
	panel
		.getByRole('group', { name: label, exact: true })
		.getByRole('definition');

const expectPanelRowsInOrder = async (
	panel: Locator,
	rows: PanelRow[],
): Promise<void> => {
	await expect(panel.getByRole('term')).toHaveText(
		rows.map(({ label }) => label),
	);
	for (const { label, value } of rows) {
		await expect(definitionForLabel(panel, label)).toHaveText(value);
	}
};

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
				case 'braze campaign creation status':
					overrides.brazeCampaignCreationStatus =
						workflowStatusEnumSchema.parse(value);
					break;
				case 'brazeNewsletterName':
					overrides.brazeNewsletterName = value;
					break;
				case 'brazeSubscribeAttributeName':
					overrides.brazeSubscribeAttributeName = value;
					break;
				case 'brazeSubscribeEventNamePrefix':
					overrides.brazeSubscribeEventNamePrefix = value;
					break;
				case 'brazeSubscribeAttributeNameAlternate':
					overrides.brazeSubscribeAttributeNameAlternate = [value];
					break;
				case 'campaign name':
					overrides.campaignName = value;
					break;
				case 'campaign code':
					overrides.campaignCode = value;
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
				...DEFAULT_RENDERING_OPTION_FLAGS,
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
		const panel = panelByName(page, panelName);
		for (const { label, value } of table.hashes()) {
			if (label === undefined || value === undefined) {
				throw new Error('Panel table must have "label" and "value" columns');
			}
			await expect(definitionForLabel(panel, label)).toContainText(value);
		}
	},
);

Then(
	'the read-only Copy fields align with the Attributes fields',
	async ({ page }) => {
		const attributes = panelByName(page, 'Attributes');
		const copy = panelByName(page, 'Copy');
		const attributeTerm = await attributes.locator('dt').first().boundingBox();
		const attributeValue = await attributes.locator('dd').first().boundingBox();
		if (!attributeTerm || !attributeValue) {
			throw new Error('Expected Attributes fields to be rendered');
		}
		for (const row of await copy.locator('dl > div').all()) {
			const term = await row.locator('dt').boundingBox();
			const value = await row.locator('dd').boundingBox();
			if (!term || !value) {
				throw new Error('Expected Copy label and value to be rendered');
			}
			expect(term.x).toBeCloseTo(attributeTerm.x, 0);
			expect(value.x).toBeCloseTo(attributeValue.x, 0);
			expect(value.y).toBeCloseTo(term.y, 0);
		}
	},
);

When('the editor edits the Copy panel', async ({ page }) => {
	await panelByName(page, 'Copy')
		.getByRole('button', { name: 'Edit', exact: true })
		.click();
});

When('the editor fills in Copy:', async ({ page }, table: DataTable) => {
	for (const { label, value } of table.hashes()) {
		if (label === undefined || value === undefined) {
			throw new Error('Copy table must have "label" and "value" columns');
		}
		await panelByName(page, 'Copy')
			.getByRole('textbox', { name: label, exact: true })
			.fill(value);
	}
});

When('the editor submits Copy', async ({ page }) => {
	await panelByName(page, 'Copy')
		.getByRole('button', { name: 'Save changes', exact: true })
		.click();
});

When('the editor saves Copy', async ({ page }) => {
	const panel = panelByName(page, 'Copy');
	await panel
		.getByRole('button', { name: 'Save changes', exact: true })
		.click();
	await expect(
		panel.getByRole('button', { name: 'Edit', exact: true }),
	).toBeVisible();
});

When('the editor saves Copy using Enter', async ({ page }) => {
	const panel = panelByName(page, 'Copy');
	await panel
		.getByRole('textbox', { name: 'Headline', exact: true })
		.press('Enter');
	await expect(
		panel.getByRole('button', { name: 'Edit', exact: true }),
	).toBeVisible();
});

When('the editor cancels Copy editing', async ({ page }) => {
	await panelByName(page, 'Copy')
		.getByRole('button', { name: 'Cancel', exact: true })
		.click();
});

When('the editor reloads the newsletter detail page', async ({ page }) => {
	await page.reload();
});

When('the next Copy save fails', async ({ page }) => {
	await page.route(
		'**/api/newsletters/*',
		async (route) => {
			if (route.request().method() !== 'PATCH') {
				await route.fallback();
				return;
			}
			await route.fulfill({
				status: 500,
				json: { ok: false, message: 'Unable to save Copy' },
			});
		},
		{ times: 1 },
	);
});

Then(
	'Copy remains editable with headline {string} and a save error',
	async ({ page }, headline: string) => {
		const panel = panelByName(page, 'Copy');
		await expect(panel.getByRole('alert')).toHaveText('Unable to save Copy');
		await expect(
			panel.getByRole('textbox', { name: 'Headline', exact: true }),
		).toHaveValue(headline);
		await expect(panel.getByText('Editing', { exact: true })).toBeVisible();
	},
);

Then(
	'the {string} panel shows a thumbnail for {string}',
	async ({ page }, panelName: string, label: string) => {
		const panel = panelByName(page, panelName);
		// The image is decorative (alt=""), so it has no 'img' role
		await expect(definitionForLabel(panel, label).locator('img')).toBeVisible();
	},
);

Then(
	'the {string} panel lists these images in order:',
	async ({ page }, panelName: string, table: DataTable) => {
		const panel = panelByName(page, panelName);
		const urlsByLabel: Record<string, string> = {
			'Main banner graphic': BANNER_URL,
			'Main banner graphic (mobile)': BANNER_MOBILE_URL,
			'Newsletter graphic (5:3)': GRAPHIC_URL,
			'Newsletter square (1:1)': SQUARE_URL,
		};
		const expectedRows: PanelRow[] = table.hashes().map(({ label }) => {
			const value = label && urlsByLabel[label];
			if (!value) {
				throw new Error(`Unknown image label: ${label}`);
			}
			return { label: label, value };
		});

		await expectPanelRowsInOrder(panel, expectedRows);
	},
);

Then(
	'the {string} panel shows under {string}:',
	async ({ page }, panelName: string, groupName: string, table: DataTable) => {
		const panel = page.locator('section', {
			has: page.getByRole('heading', {
				level: 3,
				name: panelName,
				exact: true,
			}),
		});

		const group = panel.getByRole('region', {
			name: groupName,
			exact: true,
		});

		for (const { label, value } of table.hashes()) {
			if (label === undefined || value === undefined) {
				throw new Error('Panel table must have "label" and "value" columns');
			}
			// Find the row whose label (term) matches, then check its value.
			const row = group.locator('div').filter({
				has: page.getByText(label, { exact: true }).and(page.getByRole('term')),
			});
			await expect(row.getByRole('definition')).toHaveText(value);
		}
	},
);

When('the editor edits the Images panel', async ({ page }) => {
	await panelByName(page, 'Images')
		.getByRole('button', { name: 'Edit', exact: true })
		.click();
});

When('the editor fills in Images:', async ({ page }, table: DataTable) => {
	for (const { label, value } of table.hashes()) {
		if (label === undefined || value === undefined) {
			throw new Error('Images table must have "label" and "value" columns');
		}
		await panelByName(page, 'Images')
			.getByRole('textbox', { name: label, exact: true })
			.fill(value);
	}
});

When('the editor saves Images', async ({ page }) => {
	const panel = panelByName(page, 'Images');
	// "Save changes" is disabled until every image has been checked
	await panel
		.getByRole('button', { name: 'Save changes', exact: true })
		.click();
	await expect(
		panel.getByRole('button', { name: 'Edit', exact: true }),
	).toBeVisible();
});

Then(
	'the Images panel shows the error {string}',
	async ({ page }, message: string) => {
		await expect(
			panelByName(page, 'Images').getByText(message, { exact: true }),
		).toBeVisible();
	},
);

Then('the editor cannot save Images', async ({ page }) => {
	await expect(
		panelByName(page, 'Images').getByRole('button', {
			name: 'Save changes',
			exact: true,
		}),
	).toBeDisabled();
});
