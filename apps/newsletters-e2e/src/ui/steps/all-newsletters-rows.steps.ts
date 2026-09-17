import type { Page } from '@playwright/test';
import { expect } from '@playwright/test';
import type { DataTable } from 'playwright-bdd';
import {
	createDraftNewsletter,
	updateDraftNewsletter,
} from '../../../helpers/draft-newsletter';
import { Given, Then } from './fixtures';

/**
 * Rows aren't real `<a>` elements (`TableRow` intercepts clicks/keypresses
 * itself, see `AllNewslettersTable.tsx`), but each one carries its
 * navigation target as `data-href` -- a stable locator that doesn't depend on
 * a row's visible text.
 */
const rowByHref = (page: Page, href: string) =>
	page.locator(`tr[data-href="${href}"]`);

const SEED_ROW_HREF = '/launched/playwright-launched-seed';

/**
 * `apps/newsletters-api/static/newsletters.seed.json`'s
 * `playwright-launched-seed` entry's `meta.updatedTimestamp`, formatted the
 * same way `AllNewslettersTable` does (`formatLastUpdated`'s `toDateString`)
 * so this assertion isn't hardcoded to one timezone's rendering of it.
 */
const SEED_LAST_UPDATED = new Date(1699000000000).toDateString();

Given('the editor is using a mobile viewport', async ({ page }) => {
	// Stand's `md` breakpoint (where the table switches to its 3-column
	// layout) is 830px, so this stays in the single-column mobile layout.
	await page.setViewportSize({ width: 375, height: 812 });
});

/**
 * #768's "supported category labels" scenario assumes a fixture for a
 * custom LAUNCHED newsletter, which doesn't exist (launched newsletters are
 * only created by promoting a draft through the full launch wizard). A
 * plain draft produces the same `pillarCategoryLabel` from the same
 * `theme`/`category` fields (see `draftNewsletterToRow`), so each table row
 * becomes a draft instead. The draft's real API name is suffixed for
 * uniqueness; only the table's `newsletter` column is used to look it back
 * up afterwards, so that's invisible to the scenario.
 */
Given(
	'newsletters exist with these pillar and category values:',
	async ({ request, namedDraftNewsletters }, table: DataTable) => {
		for (const row of table.hashes()) {
			const listId = await createDraftNewsletter(
				request,
				`${row['newsletter']} ${Date.now()}`,
			);
			// Wizard steps must be submitted in the wizard's own order:
			// productionDetails before targeting. Both key their forward button
			// as "finish", not "next" (see `updateDraftNewsletter`'s docstring).
			await updateDraftNewsletter(
				request,
				listId,
				'productionDetails',
				{
					category: row['category'] as
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
					theme: row['pillar']?.toLowerCase() as
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
			namedDraftNewsletters.listIdsByName[row['newsletter'] ?? ''] = listId;
		}
	},
);

Then(
	// "/" is a Cucumber Expression alternation character, so it must be
	// escaped here even though the feature file's plain text doesn't need it.
	'rows show these pillar\\/category labels:',
	async ({ page, namedDraftNewsletters }, table: DataTable) => {
		for (const row of table.hashes()) {
			const listId =
				namedDraftNewsletters.listIdsByName[row['newsletter'] ?? ''];
			const expectedLabel = row['expected label'];
			await expect(
				rowByHref(page, `/drafts/${listId}`).getByText(expectedLabel ?? ''),
			).toBeVisible();
		}
	},
);

Then(
	'the "Playwright Launched Seed" row shows its title, pillar and category label, last updated date, and status badge',
	async ({ page }) => {
		const row = rowByHref(page, SEED_ROW_HREF);
		await expect(row.getByText('Playwright Launched Seed')).toBeVisible();
		await expect(row.getByText('Opinion | Article based')).toBeVisible();
		await expect(row.getByText(SEED_LAST_UPDATED)).toBeVisible();
		await expect(row.getByText('Paused')).toBeVisible();
	},
);

Then(
	'the "Playwright Launched Seed" row shows its thumbnail with meaningful alt text',
	async ({ page }) => {
		const row = rowByHref(page, SEED_ROW_HREF);
		await expect(
			row.getByRole('img', { name: 'Playwright Launched Seed thumbnail' }),
		).toBeVisible();
	},
);

Then(
	'the "Playwright Launched Seed" row shows a visible status badge',
	async ({ page }) => {
		await expect(
			rowByHref(page, SEED_ROW_HREF).getByText('Paused'),
		).toBeVisible();
	},
);

Then(
	"that draft's row shows a visible status badge",
	async ({ page, existingDraftNewsletter }) => {
		const row = rowByHref(page, `/drafts/${existingDraftNewsletter.listId}`);
		// Draft status badges show a completeness percentage rather than a
		// fixed label (see `NewsletterStatusBadge.spec.tsx`), so match the
		// shape of it rather than one exact string.
		await expect(row.getByText(/^Draft • \d+%$/)).toBeVisible();
	},
);

Then(
	"that draft's row shows a fallback image with meaningful alt text",
	async ({ page, existingDraftNewsletter }) => {
		const row = rowByHref(page, `/drafts/${existingDraftNewsletter.listId}`);
		await expect(row.getByText('No image')).toBeVisible();
		await expect(
			row.getByRole('img', { name: /No thumbnail available/ }),
		).toBeVisible();
	},
);

Then(
	'the "Playwright Launched Seed" row shows its last updated date below its pillar and category label',
	async ({ page }) => {
		const row = rowByHref(page, SEED_ROW_HREF);
		const pillarCategoryBox = await row
			.getByText('Opinion | Article based')
			.boundingBox();
		const lastUpdatedBox = await row.getByText(SEED_LAST_UPDATED).boundingBox();
		expect(pillarCategoryBox).not.toBeNull();
		expect(lastUpdatedBox).not.toBeNull();
		expect(lastUpdatedBox?.y ?? 0).toBeGreaterThan(pillarCategoryBox?.y ?? 0);
	},
);
