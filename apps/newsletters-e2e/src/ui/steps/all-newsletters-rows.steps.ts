import type { Locator, Page } from '@playwright/test';
import { expect } from '@playwright/test';
import type { DataTable } from 'playwright-bdd';
import {
	createFixtureDraft,
	createFixtureNewsletter,
} from '../../../helpers/test-fixtures';
import { Given, Then } from './fixtures';

// `TableRow` intercepts row navigation itself rather than rendering an
// `<a>`, but react-aria puts the target in `data-href`.
const rowByHref = (page: Page, href: string): Locator =>
	page.locator(`tr[data-href="${href}"]`);

type NamedNewsletterRef =
	| { kind: 'draft'; listId: number }
	| { kind: 'launched'; identityName: string };

interface NamedNewsletters {
	refsByName: Record<string, NamedNewsletterRef>;
}

// Drafts are addressed by `listId`, launched newsletters by `identityName`.
const hrefFor = (ref: NamedNewsletterRef): string =>
	ref.kind === 'draft'
		? `/drafts/${ref.listId}`
		: `/launched/${ref.identityName}`;

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

type Pillar =
	| 'news'
	| 'opinion'
	| 'culture'
	| 'sport'
	| 'lifestyle'
	| 'features';
type Category =
	| 'article-based'
	| 'fronts-based'
	| 'manual-send'
	| 'article-based-legacy'
	| 'other';

// Scenarios create newsletters as drafts by default (cheaper than the
// wizard, and drafts map through the same row logic as launched
// newsletters), reserving "launched newsletter" for scenarios that need a
// real status or a controlled date.
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
		// Explicit increasing timestamps, not wall-clock time: fixture inserts
		// can land in the same millisecond otherwise.
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
		// Matches the rendered date shape without pinning to one timezone.
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
		// Every label formatPillarCategoryLabel builds contains "|".
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
		// Draft badges show a percentage, not a fixed label, so match the shape.
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

// Compares only the named rows' relative positions; other scenarios' rows
// may legitimately sit between them.
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
			positions.push(await rowPosition(namedRow(page, namedNewsletters, name)));
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
