import type { APIRequestContext, Locator, Page } from '@playwright/test';
import { expect } from '@playwright/test';
import type { DataTable } from 'playwright-bdd';
import {
	createDraftNewsletter,
	updateDraftNewsletter,
} from '../../../helpers/draft-newsletter';
import { Given, Then } from './fixtures';

/**
 * Rows aren't real `<a>` elements (`TableRow` intercepts clicks/keypresses
 * itself, see `AllNewslettersTable.tsx`), but react-aria puts each row's
 * navigation target in `data-href` -- a stable locator that doesn't depend on
 * a row's visible text.
 */
const rowByHref = (page: Page, href: string): Locator =>
	page.locator(`tr[data-href="${href}"]`);

/**
 * The one launched newsletter the API seeds
 * (`apps/newsletters-api/static/newsletters.seed.json`). Launched newsletters
 * can only otherwise be produced by promoting a draft through the full launch
 * wizard, so scenarios that need one use this. Its harness name is kept here
 * rather than in the feature file, which refers to it only as "the launched
 * newsletter that is already published".
 */
const SEED = {
	href: '/launched/playwright-launched-seed',
	name: 'Playwright Launched Seed',
	status: 'Paused',
};

/**
 * Scenarios create their newsletters as drafts: a draft carries the same
 * `theme`/`category` fields as a launched newsletter and maps through the
 * same `pillarCategoryLabel` logic (see `all-newsletters-rows.ts`), so the
 * row content under test is identical. The feature file therefore says
 * "newsletter" rather than "draft" wherever the distinction doesn't matter.
 */
const createNamedNewsletter = async (
	request: APIRequestContext,
	namedNewsletters: { listIdsByName: Record<string, number> },
	name: string,
	fields?: { pillar: string; category: string },
): Promise<number> => {
	// The API name is suffixed for uniqueness across parallel workers and
	// re-runs; scenarios refer to newsletters by their table name only, and
	// rows are located by listId, so the suffix stays invisible to them.
	const listId = await createDraftNewsletter(
		request,
		`${name} ${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
	);
	namedNewsletters.listIdsByName[name] = listId;

	if (fields) {
		// Wizard steps must be submitted in the wizard's own order:
		// productionDetails before targeting. Both key their forward button
		// as "finish", not "next" (see `updateDraftNewsletter`'s docstring).
		await updateDraftNewsletter(
			request,
			listId,
			'productionDetails',
			{
				category: fields.category as
					| 'article-based'
					| 'fronts-based'
					| 'manual-send'
					| 'article-based-legacy'
					| 'other',
				frequency: 'Weekly',
				onlineArticle: 'Web for all sends',
			},
			'finish',
		);
		await updateDraftNewsletter(
			request,
			listId,
			'targeting',
			{
				theme: fields.pillar.toLowerCase() as
					| 'news'
					| 'opinion'
					| 'culture'
					| 'sport'
					| 'lifestyle'
					| 'features',
				group: 'Features',
				regionFocus: 'UK',
			},
			'finish',
		);
	}

	return listId;
};

const namedRow = (
	page: Page,
	namedNewsletters: { listIdsByName: Record<string, number> },
	name: string,
): Locator => {
	const listId = namedNewsletters.listIdsByName[name];
	if (listId === undefined) {
		throw new Error(
			`No newsletter named "${name}" was created by this scenario. Created: ${Object.keys(namedNewsletters.listIdsByName).join(', ') || '(none)'}`,
		);
	}
	return rowByHref(page, `/drafts/${listId}`);
};

Given(
	'a newsletter {string} with pillar {string} and category {string}',
	async (
		{ request, namedDraftNewsletters },
		name: string,
		pillar: string,
		category: string,
	) => {
		await createNamedNewsletter(request, namedDraftNewsletters, name, {
			pillar,
			category,
		});
	},
);

Given(
	'a newsletter {string} with no pillar or category',
	async ({ request, namedDraftNewsletters }, name: string) => {
		// A freshly created draft has neither field set yet.
		await createNamedNewsletter(request, namedDraftNewsletters, name);
	},
);

Given(
	'a newsletter {string} with no thumbnail',
	async ({ request, namedDraftNewsletters }, name: string) => {
		// Illustrations are only added later in the wizard, so a new draft has
		// none of the three illustration fields `toThumbnailUrl` falls back to.
		await createNamedNewsletter(request, namedDraftNewsletters, name);
	},
);

Given(
	'these newsletters exist:',
	async ({ request, namedDraftNewsletters }, table: DataTable) => {
		for (const row of table.hashes()) {
			await createNamedNewsletter(
				request,
				namedDraftNewsletters,
				row['newsletter'] ?? '',
				{ pillar: row['pillar'] ?? '', category: row['category'] ?? '' },
			);
		}
	},
);

Given(
	'these newsletters were updated in this order:',
	async ({ request, namedDraftNewsletters }, table: DataTable) => {
		// Created and then updated strictly in sequence, so each one's
		// `meta.updatedTimestamp` is later than the previous one's. The table
		// therefore reads oldest-first.
		for (const row of table.hashes()) {
			await createNamedNewsletter(
				request,
				namedDraftNewsletters,
				row['newsletter'] ?? '',
				{ pillar: 'News', category: 'other' },
			);
		}
	},
);

Given('the launched newsletter that is already published', () => {
	// Seeded by the API at startup; nothing to set up.
});

Then(
	'the {string} row shows the title {string}',
	async ({ page, namedDraftNewsletters }, name: string, title: string) => {
		await expect(
			namedRow(page, namedDraftNewsletters, name).getByText(title),
		).toBeVisible();
	},
);

Then(
	'the {string} row shows the label {string}',
	async ({ page, namedDraftNewsletters }, name: string, label: string) => {
		await expect(
			namedRow(page, namedDraftNewsletters, name).getByText(label),
		).toBeVisible();
	},
);

Then(
	'the {string} row shows a last updated date',
	async ({ page, namedDraftNewsletters }, name: string) => {
		// `formatLastUpdated` renders a real date via `toDateString` and the
		// literal "Unknown" when none is known, so matching the date shape
		// proves a genuine timestamp reached the row without pinning the
		// assertion to one timezone's rendering of it. Deliberately
		// unanchored: the cell also carries a visually-hidden "Last updated"
		// compact label alongside the date.
		await expect(
			namedRow(page, namedDraftNewsletters, name).getByText(
				/[A-Z][a-z]{2} [A-Z][a-z]{2} \d{2} \d{4}/,
			),
		).toBeVisible();
	},
);

Then(
	'the {string} row shows no pillar and category label',
	async ({ page, namedDraftNewsletters }, name: string) => {
		// Every label `formatPillarCategoryLabel` builds contains "|", and it
		// returns undefined when neither field is set, so the row should carry
		// no such text at all.
		await expect(
			namedRow(page, namedDraftNewsletters, name).getByText('|'),
		).toHaveCount(0);
	},
);

Then(
	'the rows show these labels:',
	async ({ page, namedDraftNewsletters }, table: DataTable) => {
		for (const row of table.hashes()) {
			await expect(
				namedRow(
					page,
					namedDraftNewsletters,
					row['newsletter'] ?? '',
				).getByText(row['label'] ?? ''),
			).toBeVisible();
		}
	},
);

Then(
	'the {string} row shows a draft progress badge',
	async ({ page, namedDraftNewsletters }, name: string) => {
		// Draft badges show a completeness percentage rather than a fixed
		// label (see `NewsletterStatusBadge.spec.tsx`), so match its shape
		// rather than one exact percentage.
		await expect(
			namedRow(page, namedDraftNewsletters, name).getByText(/^Draft • \d+%$/),
		).toBeVisible();
	},
);

Then(
	"the launched newsletter's row shows the status badge {string}",
	async ({ page }, status: string) => {
		await expect(rowByHref(page, SEED.href).getByText(status)).toBeVisible();
	},
);

Then(
	"the launched newsletter's row shows its thumbnail with meaningful alt text",
	async ({ page }) => {
		await expect(
			rowByHref(page, SEED.href).getByRole('img', {
				name: `${SEED.name} thumbnail`,
			}),
		).toBeVisible();
	},
);

Then(
	'the {string} row shows a fallback image with meaningful alt text',
	async ({ page, namedDraftNewsletters }, name: string) => {
		const row = namedRow(page, namedDraftNewsletters, name);
		await expect(row.getByText('No image')).toBeVisible();
		// The fallback's accessible name is built from the newsletter's real
		// (uniqueness-suffixed) API name, so match the stable prefix rather
		// than the name the scenario used.
		await expect(
			row.getByRole('img', { name: /^No thumbnail available for / }),
		).toBeVisible();
	},
);

/**
 * Compares only the named rows' positions relative to each other, ignoring
 * any other newsletter that happens to sit between them. Scenarios run in
 * parallel against a shared API, so rows created by other scenarios can
 * legitimately appear in the same list.
 */
const rowPosition = async (row: Locator): Promise<number> => {
	await expect(row).toBeVisible();
	const box = await row.boundingBox();
	if (!box) {
		throw new Error('Expected the row to have a bounding box');
	}
	return box.y;
};

Then(
	'the rows appear in this order:',
	async ({ page, namedDraftNewsletters }, table: DataTable) => {
		const names = table.hashes().map((row) => row['newsletter'] ?? '');
		const positions = [];
		for (const name of names) {
			positions.push(
				await rowPosition(namedRow(page, namedDraftNewsletters, name)),
			);
		}

		for (let index = 1; index < positions.length; index++) {
			expect(
				positions[index],
				`"${names[index]}" should appear below "${names[index - 1]}"`,
			).toBeGreaterThan(positions[index - 1] ?? 0);
		}
	},
);

Then(
	"the {string} row appears above the launched newsletter's row",
	async ({ page, namedDraftNewsletters }, name: string) => {
		const newsletterY = await rowPosition(
			namedRow(page, namedDraftNewsletters, name),
		);
		const seedY = await rowPosition(rowByHref(page, SEED.href));

		expect(newsletterY).toBeLessThan(seedY);
	},
);
