import type { Page } from '@playwright/test';
import { expect } from '@playwright/test';
import type { EditionId } from '@newsletters-nx/newsletters-data-client';
import { editionNames } from '@newsletters-nx/newsletters-data-client';
import type { DataTable } from 'playwright-bdd';
import { Given, Then, When } from './fixtures';

interface LayoutGroupFixture {
	title: string;
	newsletters: string[];
}

interface NewsletterFixture {
	identityName: string;
	name: string;
	status: string;
	illustrationSquare: string;
}

const mockEditionLayout = async (
	page: Page,
	groups: LayoutGroupFixture[],
	newsletters: NewsletterFixture[],
) => {
	await page.route('**/api/layouts/uk', async (route) => {
		await route.fulfill({ json: { ok: true, data: { groups } } });
	});
	await page.route('**/api/newsletters', async (route) => {
		await route.fulfill({ json: { ok: true, data: newsletters } });
	});
};

const mockNewsletterLayout = async (
	page: Page,
	sectionTitle: string,
	newsletterName: string,
	status: string,
) => {
	const identityName = 'morning-briefing';
	await page.route(
		'https://example.com/morning-briefing.png',
		async (route) => {
			await route.fulfill({
				contentType: 'image/svg+xml',
				body: '<svg xmlns="http://www.w3.org/2000/svg" width="60" height="60"><rect width="60" height="60" fill="#eee" /></svg>',
			});
		},
	);
	await mockEditionLayout(
		page,
		[{ title: sectionTitle, newsletters: [identityName] }],
		[
			{
				identityName,
				name: newsletterName,
				status,
				illustrationSquare: 'https://example.com/morning-briefing.png',
			},
		],
	);
};

const layoutAction = (page: Page, name: string) =>
	page
		.getByRole('button', { name, exact: true })
		.or(page.getByRole('link', { name, exact: true }));

Given(
	'the editor is viewing the layout for edition {string} in read-only mode',
	async ({ page }, edition: string) => {
		await page.route(`**/api/layouts/${edition}`, async (route) => {
			await route.fulfill({ json: { ok: true, data: { groups: [] } } });
		});
		await page.goto(`/layouts/${edition}`);
		await expect(layoutAction(page, 'Edit layout')).toBeVisible();
	},
);

Given(
	'the edition layout contains these sections:',
	async ({ page }, table: DataTable) => {
		const groups = table.hashes().map(({ title }) => ({
			title: title ?? '',
			newsletters: [],
		}));
		await mockEditionLayout(page, groups, []);
	},
);

Given(
	'the {string} section contains the newsletter {string} with status {string}',
	async (
		{ page },
		sectionTitle: string,
		newsletterName: string,
		status: string,
	) => {
		await mockNewsletterLayout(page, sectionTitle, newsletterName, status);
	},
);

When('the edition layout loads', async ({ page }) => {
	await page.goto('/layouts/uk');
	await expect(
		page.getByRole('heading', { level: 2, name: 'United Kingdom' }),
	).toBeVisible();
});

When('the editor chooses to edit the layout', async ({ page }) => {
	await layoutAction(page, 'Edit layout').click();
});

Then(
	'the editor is viewing the edit page at {string}',
	async ({ page }, path: string) => {
		await expect(page).toHaveURL((url) => url.pathname === path);
		const edition = path.split('/').pop()?.toUpperCase();
		await expect(
			page.getByRole('heading', {
				name:
					(edition && editionNames[edition as EditionId]) ??
					`Edit Layout for ${edition}`,
				exact: true,
			}),
		).toBeVisible();
	},
);

Then('the {string} button is visible', async ({ page }, name: string) => {
	await expect(layoutAction(page, name)).toBeVisible();
});

Then('the {string} button is not visible', async ({ page }, name: string) => {
	await expect(layoutAction(page, name)).toBeHidden();
});

Then('the edit history controls are not visible', async ({ page }) => {
	for (const name of ['Undo', 'Redo', 'Reset']) {
		await expect(page.getByRole('button', { name, exact: true })).toBeHidden();
	}
});

Then('a content box is displayed beneath the top section', async ({ page }) => {
	const header = page
		.locator('header')
		.filter({ has: page.getByRole('heading', { name: 'United Kingdom' }) });
	const contentBox = header.locator('xpath=following-sibling::*[1]');

	await expect(contentBox).toBeVisible();
	await expect(contentBox).toContainText(
		'No content available. Click on "Edit layout" to add content.',
	);
});

Then('the content box shows {string}', async ({ page }, text: string) => {
	await expect(page.getByText(text, { exact: true })).toBeVisible();
});

Then(
	'each section is displayed in a bordered box beneath the edition header',
	async ({ page }) => {
		const sections = page.locator('main section');
		const sectionCount = await sections.count();
		expect(sectionCount).toBeGreaterThan(0);
		for (let index = 0; index < sectionCount; index += 1) {
			await expect(sections.nth(index)).toBeVisible();
			await expect(sections.nth(index)).toHaveCSS('border-left-style', 'solid');
		}
	},
);

Then(
	'the section headings appear in this order:',
	async ({ page }, table: DataTable) => {
		const expectedHeadings = table.hashes().map(({ heading }) => heading ?? '');
		const sectionHeadings = await page
			.locator('main section')
			.evaluateAll((sections) =>
				sections.map((section) => {
					const position = section.querySelector('h3')?.textContent ?? '';
					const title = section.querySelector('h4')?.textContent ?? '';
					return `${position} ${title}`;
				}),
			);
		expect(sectionHeadings).toEqual(expectedHeadings);
	},
);

Then(
	'{string} is listed in the {string} section',
	async ({ page }, newsletterName: string, sectionTitle: string) => {
		const section = page.locator('main section').filter({
			has: page.getByRole('heading', { level: 4, name: sectionTitle }),
		});
		await expect(
			section.getByRole('link', { name: newsletterName }),
		).toBeVisible();
	},
);

Then('its newsletter thumbnail is visible', async ({ page }) => {
	const thumbnail = page
		.getByRole('link', { name: 'Morning Briefing' })
		.locator('..')
		.locator('..')
		.locator('img');
	await expect(thumbnail).toBeVisible();
	await expect(thumbnail).toHaveJSProperty('naturalWidth', 60);
});

Then('its title links to {string}', async ({ page }, href: string) => {
	await expect(
		page.getByRole('link', { name: 'Morning Briefing' }),
	).toHaveAttribute('href', href);
});

Then(
	'{string} displays a {string} status pill',
	async ({ page }, newsletterName: string, label: string) => {
		const row = page.getByRole('listitem').filter({
			has: page.getByRole('link', { name: newsletterName }),
		});
		await expect(row.getByText(label, { exact: true })).toBeVisible();
	},
);

Then(
	'a question-mark help control is visible beside the {string} status pill',
	async ({ page }, label: string) => {
		const row = page.getByRole('listitem').filter({
			has: page.getByRole('link', { name: 'Morning Briefing' }),
		});
		await expect(row.getByText(label, { exact: true })).toBeVisible();
		await expect(
			row.getByRole('button', { name: 'Information' }),
		).toBeVisible();
	},
);

When(
	'the editor moves keyboard focus to the status help control',
	async ({ page }) => {
		const row = page.getByRole('listitem').filter({
			has: page.getByRole('link', { name: 'Morning Briefing' }),
		});
		await row.getByRole('button', { name: 'Information' }).focus();
	},
);

When('the editor focuses the status help control', async ({ page }) => {
	const row = page.getByRole('listitem').filter({
		has: page.getByRole('link', { name: 'Morning Briefing' }),
	});
	await row.getByRole('button', { name: 'Information' }).focus();
});

Then('the paused-state tooltip is visible', async ({ page }) => {
	await expect(page.getByRole('tooltip')).toContainText(
		'This newsletter is not yet live - it will not appear until its status is updated.',
	);
});

Then('the status tooltip shows {string}', async ({ page }, message: string) => {
	await expect(page.getByRole('tooltip')).toContainText(message);
});
