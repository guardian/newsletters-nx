import type { Locator, Page } from '@playwright/test';
import { expect } from '@playwright/test';
import { createFixtureDraft } from '../../../helpers/test-fixtures';
import { Given, Then, When } from './fixtures';

// Enough rows that the list is taller than the 1280x720 test viewport
// whatever else the environment already holds, so there is something to
// scroll in the first place.
const ROWS_TO_FILL_THE_SCREEN = 15;

const allNewslettersTable = (page: Page): Locator =>
	page.getByRole('grid', { name: 'All newsletters' });

const columnHeadings = (page: Page): Locator =>
	allNewslettersTable(page).locator('thead');

const lastRow = (page: Page): Locator =>
	allNewslettersTable(page).locator('tbody tr').last();

Given(
	'the All Newsletters list is longer than the screen',
	async ({ request, namedNewsletters }) => {
		for (let index = 0; index < ROWS_TO_FILL_THE_SCREEN; index++) {
			const name = `Scrolling E2E ${Date.now()}-${index}`;
			const listId = await createFixtureDraft(request, {
				name,
				theme: 'news',
				category: 'other',
			});
			namedNewsletters.refsByName[name] = { kind: 'draft', listId };
		}
	},
);

// Position of the column headings, captured before scrolling so the "have
// not moved" assertion has something to compare against.
let headingsTopBeforeScroll: number;

const headingsTop = (page: Page): Promise<number> =>
	columnHeadings(page).evaluate((el) =>
		Math.round(el.getBoundingClientRect().top),
	);

Then('the last newsletter is not yet in view', async ({ page }) => {
	await expect(lastRow(page)).not.toBeInViewport();
});

When('the editor scrolls down the All Newsletters list', async ({ page }) => {
	headingsTopBeforeScroll = await headingsTop(page);

	// A real editor scrolls with the mouse wheel over the list, not by
	// jumping the scroll position programmatically.
	await allNewslettersTable(page).hover();
	await page.mouse.wheel(0, 2000);
});

Then('the last newsletter comes into view', async ({ page }) => {
	await expect(lastRow(page)).toBeInViewport();
});

Then('the column headings have not moved', async ({ page }) => {
	await expect(columnHeadings(page)).toBeInViewport();
	expect(await headingsTop(page)).toBe(headingsTopBeforeScroll);
});

Then('the column headings are still clear of the top bar', async ({ page }) => {
	// The Stand top bar pins to the top of the viewport; the headings must
	// stay below it so it never covers them.
	const topBarBottom = await page
		.locator('nav')
		.evaluate((el) => Math.round(el.getBoundingClientRect().bottom));
	expect(await headingsTop(page)).toBeGreaterThanOrEqual(topBarBottom);
});
