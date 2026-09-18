import type { Locator, Page } from '@playwright/test';
import { expect } from '@playwright/test';
import type { DataTable } from 'playwright-bdd';
import {
	createFixtureDraft,
	createFixtureNewsletter,
} from '../../../helpers/test-fixtures';
import { Given, Then } from './fixtures';

/**
 * Rows aren't real `<a>` elements (`TableRow` intercepts clicks/keypresses
 * itself, see `AllNewslettersTable.tsx`), but react-aria puts each row's
 * navigation target in `data-href` -- a stable locator that doesn't depend on
 * a row's visible text.
 */
const rowByHref = (page: Page, href: string): Locator =>
	page.locator(`tr[data-href="${href}"]`);

type NamedNewsletterRef =
	| { kind: 'draft'; listId: number }
	| { kind: 'launched'; identityName: string };

interface NamedNewsletters {
	refsByName: Record<string, NamedNewsletterRef>;
}

// Drafts are addressed by `listId`, launched newsletters by `identityName`
// (see `all-newsletters-rows.ts`'s `href` construction) -- so the row lookup
// must branch on `kind` rather than treating both the same way.
const hrefFor = (ref: NamedNewsletterRef): string =>
	ref.kind === 'draft' ? `/drafts/${ref.listId}` : `/launched/${ref.identityName}`;

const namedRow = (
	page: Page,
	namedNewsletters: NamedNewsletters,
	name: string,
): Locator => {
	const ref = namedNewsletters.refsByName[name];
	if (ref === undefined) {
		throw new Error(
			`No newsletter named "${name}" was created by this scenario. Created: ${Object.keys(namedNewsletters.refsByName).join(', ') || '(none)'}`,
		);
	}
	return rowByHref(page, hrefFor(ref));
};

type Pillar = 'news' | 'opinion' | 'culture' | 'sport' | 'lifestyle' | 'features';
type Category =
	| 'article-based'
	| 'fronts-based'
	| 'manual-send'
	| 'article-based-legacy'
	| 'other';

/**
 * Scenarios create their newsletters as drafts by default: a draft carries
 * the same `theme`/`category` fields as a launched newsletter and maps
 * through the same `pillarCategoryLabel` logic (see `all-newsletters-rows.ts`),
 * so the row content under test is identical, and inserting one is a single
 * fixture-route call (see `helpers/test-fixtures.ts`) rather than a multi-step
 * wizard walk. The feature file therefore says "newsletter" rather than
 * "draft" wherever the distinction doesn't matter, reserving "launched
 * newsletter" for scenarios that specifically need one (a real status, or a
 * date under the editor's control).
 */
Given(
	'a newsletter {string} with pillar {string} and category {string}',
	async (
		{ request, namedNewsletters },
		name: string,
		pillar: string,
		category: string,
	) => {
		const listId = await createFixtureDraft(request, {
			name,
			theme: pillar.toLowerCase() as Pillar,
			category: category as Category,
		});
		namedNewsletters.refsByName[name] = { kind: 'draft', listId };
	},
);

Given(
	'a newsletter {string} with no pillar or category',
	async ({ request, namedNewsletters }, name: string) => {
		const listId = await createFixtureDraft(request, { name });
		namedNewsletters.refsByName[name] = { kind: 'draft', listId };
	},
);

Given(
	'a newsletter {string} with no thumbnail',
	async ({ request, namedNewsletters }, name: string) => {
		// A fixture draft has no illustration fields unless one is given.
		const listId = await createFixtureDraft(request, { name });
		namedNewsletters.refsByName[name] = { kind: 'draft', listId };
	},
);

Given(
	'these newsletters exist:',
	async ({ request, namedNewsletters }, table: DataTable) => {
		for (const row of table.hashes()) {
			const name = row['newsletter'] ?? '';
			const listId = await createFixtureDraft(request, {
				name,
				theme: (row['pillar'] ?? '').toLowerCase() as Pillar,
				category: (row['category'] ?? '') as Category,
			});
			namedNewsletters.refsByName[name] = { kind: 'draft', listId };
		}
	},
);

Given(
	'these newsletters were updated in this order:',
	async ({ request, namedNewsletters }, table: DataTable) => {
		const rows = table.hashes();
		// Explicit, strictly increasing timestamps (one second apart) rather
		// than relying on wall-clock time between requests: fixture inserts are
		// fast enough that two calls could otherwise land in the same
		// millisecond and tie. The table reads oldest-first, so the last row
		// gets the newest timestamp.
		const base = Date.now() - rows.length * 1000;
		for (const [index, row] of rows.entries()) {
			const name = row['newsletter'] ?? '';
			const listId = await createFixtureDraft(request, {
				name,
				theme: 'news',
				category: 'other',
				meta: { updatedTimestamp: base + index * 1000 },
			});
			namedNewsletters.refsByName[name] = { kind: 'draft', listId };
		}
	},
);

Given(
	'a launched newsletter {string} with status {string}',
	async (
		{ request, namedNewsletters },
		name: string,
		status: 'paused' | 'cancelled' | 'live' | 'pending',
	) => {
		const { identityName } = await createFixtureNewsletter(request, {
			name,
			status,
		});
		namedNewsletters.refsByName[name] = { kind: 'launched', identityName };
	},
);

Given(
	'a launched newsletter {string} with a thumbnail',
	async ({ request, namedNewsletters }, name: string) => {
		const { identityName } = await createFixtureNewsletter(request, {
			name,
			illustrationCircle: 'https://example.com/thumbnail.png',
		});
		namedNewsletters.refsByName[name] = { kind: 'launched', identityName };
	},
);

Given(
	'a launched newsletter {string} last updated a long time ago',
	async ({ request, namedNewsletters }, name: string) => {
		const { identityName } = await createFixtureNewsletter(request, {
			name,
			meta: { updatedTimestamp: Date.UTC(2015, 0, 1) },
		});
		namedNewsletters.refsByName[name] = { kind: 'launched', identityName };
	},
);

Given('the editor is using a mobile viewport', async ({ page }) => {
	// Stand's `md` breakpoint (where the table switches to its 3-column
	// layout) is 830px, so this stays in the single-column mobile layout.
	await page.setViewportSize({ width: 375, height: 812 });
});

Then(
	'the {string} row shows the title {string}',
	async ({ page, namedNewsletters }, name: string, title: string) => {
		await expect(
			namedRow(page, namedNewsletters, name).getByText(title),
		).toBeVisible();
	},
);

Then(
	'the {string} row shows the label {string}',
	async ({ page, namedNewsletters }, name: string, label: string) => {
		await expect(
			namedRow(page, namedNewsletters, name).getByText(label),
		).toBeVisible();
	},
);

Then(
	'the {string} row shows a last updated date',
	async ({ page, namedNewsletters }, name: string) => {
		// `formatLastUpdated` renders a real date via `toDateString` and the
		// literal "Unknown" when none is known, so matching the date shape
		// proves a genuine timestamp reached the row without pinning the
		// assertion to one timezone's rendering of it.
		await expect(
			namedRow(page, namedNewsletters, name).getByText(
				/[A-Z][a-z]{2} [A-Z][a-z]{2} \d{2} \d{4}/,
			),
		).toBeVisible();
	},
);

Then(
	'the {string} row shows no pillar and category label',
	async ({ page, namedNewsletters }, name: string) => {
		// Every label `formatPillarCategoryLabel` builds contains "|", and it
		// returns undefined when neither field is set, so the row should carry
		// no such text at all.
		await expect(
			namedRow(page, namedNewsletters, name).getByText('|'),
		).toHaveCount(0);
	},
);

Then(
	'the rows show these labels:',
	async ({ page, namedNewsletters }, table: DataTable) => {
		for (const row of table.hashes()) {
			await expect(
				namedRow(page, namedNewsletters, row['newsletter'] ?? '').getByText(
					row['label'] ?? '',
				),
			).toBeVisible();
		}
	},
);

Then(
	'the {string} row shows a draft progress badge',
	async ({ page, namedNewsletters }, name: string) => {
		// Draft badges show a completeness percentage rather than a fixed
		// label (see `NewsletterStatusBadge.spec.tsx`), so match its shape
		// rather than one exact percentage.
		await expect(
			namedRow(page, namedNewsletters, name).getByText(/^Draft • \d+%$/),
		).toBeVisible();
	},
);

Then(
	'the {string} row shows the status badge {string}',
	async ({ page, namedNewsletters }, name: string, status: string) => {
		await expect(
			namedRow(page, namedNewsletters, name).getByText(status),
		).toBeVisible();
	},
);

Then(
	'the {string} row shows its thumbnail with meaningful alt text',
	async ({ page, namedNewsletters }, name: string) => {
		await expect(
			namedRow(page, namedNewsletters, name).getByRole('img', {
				name: `${name} thumbnail`,
			}),
		).toBeVisible();
	},
);

Then(
	'the {string} row shows a fallback image with meaningful alt text',
	async ({ page, namedNewsletters }, name: string) => {
		const row = namedRow(page, namedNewsletters, name);
		await expect(row.getByText('No image')).toBeVisible();
		await expect(
			row.getByRole('img', { name: `No thumbnail available for ${name}` }),
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
	async ({ page, namedNewsletters }, table: DataTable) => {
		const names = table.hashes().map((row) => row['newsletter'] ?? '');
		const positions = [];
		for (const name of names) {
			positions.push(
				await rowPosition(namedRow(page, namedNewsletters, name)),
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
	'the {string} row appears above the {string} row',
	async ({ page, namedNewsletters }, aboveName: string, belowName: string) => {
		const aboveY = await rowPosition(
			namedRow(page, namedNewsletters, aboveName),
		);
		const belowY = await rowPosition(
			namedRow(page, namedNewsletters, belowName),
		);

		expect(aboveY).toBeLessThan(belowY);
	},
);
