import type { EditionId } from '@newsletters-nx/newsletters-data-client';
import type { Locator, Page } from '@playwright/test';
import { expect } from '@playwright/test';
import type { DataTable } from 'playwright-bdd';
import { createFixtureNewsletter } from '../../../helpers/test-fixtures';
import { Given, Then, When } from './fixtures';

const parseList = (list: string) => list.split(',').map((n) => n.trim());

// Reads a table with a column per section, listing its newsletters from top to bottom.
const sectionsIn = (table: DataTable) => {
	const [titles = [], ...rows] = table.raw();
	return titles.map((title, column) => ({
		title,
		names: rows.map((row) => row[column] ?? '').filter(Boolean),
	}));
};

// Locators

const dragHandle = (page: Page, name: string) =>
	page.getByRole('button', { name: `Reorder ${name}`, exact: true });

const dragHandlesIn = (scope: Locator) =>
	scope.getByRole('button', { name: /^Reorder / });

const section = (page: Page, title: string) =>
	page.getByRole('region', { name: title, exact: true });

const rowOf = (page: Page, name: string) =>
	page.getByRole('row').filter({ hasText: name });

const openLayoutEditor = async (page: Page, edition: string) => {
	await page.goto(`/layouts/edit/${edition}`);
	await expect(
		page.getByRole('button', { name: 'Save and publish layout', exact: true }),
	).toBeVisible();
};

// Keyboard drag and drop (react-aria): Enter picks up, ArrowDown moves focus
// through a focusable "Insert ..." button for each gap, Enter drops.

const dropTargets = (page: Page) =>
	page.getByRole('button', { name: /^Insert / });

// The gap just above or below `target`, e.g. "Insert between Alpha and Beta".
const dropTarget = (page: Page, target: string, position: string) =>
	page.getByRole('button', {
		name:
			position === 'above'
				? new RegExp(`^Insert (before ${target}|between .+ and ${target})$`)
				: new RegExp(`^Insert (after ${target}|between ${target} and .+)$`),
	});

// The grid can steal focus back from the handle, so retry until the drag has
// started, without pressing Enter again once it has.
const pickUp = async (page: Page, name: string) => {
	await expect(async () => {
		if ((await dropTargets(page).count()) > 0) {
			return;
		}
		await dragHandle(page, name).focus();
		await expect(dragHandle(page, name)).toBeFocused({ timeout: 250 });
		await page.keyboard.press('Enter');
		await expect(dropTargets(page).first()).toBeAttached({ timeout: 500 });
	}).toPass({ timeout: 5000 });
};

const moveWithKeyboard = async (
	page: Page,
	name: string,
	position: string,
	target: string,
) => {
	await pickUp(page, name);
	const gap = dropTarget(page, target, position);
	// ArrowDown cycles through the gaps in a section, wrapping round at the end;
	// Tab moves on to the next section.
	await expect(async () => {
		const focus = await gap.evaluate((el) => {
			const grid = (e: Element | null) => e?.closest('[role="grid"]');
			if (el === document.activeElement) {
				return 'gap';
			}
			return grid(el) === grid(document.activeElement) ? 'section' : 'other';
		});
		if (focus !== 'gap') {
			await page.keyboard.press(focus === 'section' ? 'ArrowDown' : 'Tab');
		}
		await expect(gap).toBeFocused({ timeout: 250 });
	}).toPass({ timeout: 5000 });
	await page.keyboard.press('Enter');
};

// Mouse drag and drop

const boundingBoxOf = async (locator: Locator) => {
	const box = await locator.boundingBox();
	if (!box) {
		throw new Error(`No bounding box for ${locator.toString()}`);
	}
	return box;
};

/**
 *
 * Get offset from top left corner of page element to the center of its bounding box
 * @param row
 * @returns
 */
const centerOffset = async (element: Locator) => {
	const bbox = await boundingBoxOf(element);
	return { x: bbox.width / 2, y: bbox.height / 2 };
};

/**
 * Get offset from top left corner of a row to a draggable point in the middle
 * @returns
 */
const rowDragStartOffset = async (row: Locator) => {
	const bbox = await boundingBoxOf(row);
	return { x: bbox.width * 0.6, y: bbox.height / 2 };
};

/**
 * Get offset from top left corner of a row to a drag end position.
 *
 * @param row
 * @param position 'above' | 'below' - create an offset for dragging a row above/below this one
 * @returns
 */
const rowDragEndOffset = async (row: Locator, position: string) => {
	const bbox = await boundingBoxOf(row);
	return { x: 0, y: position === 'above' ? 2 : bbox.height - 2 };
};

const dragWithMouse = async (
	page: Page,
	from: {
		locator: Locator;
		offset: { x: number; y: number };
	},
	to: {
		locator: Locator;
		offset: { x: number; y: number };
	},
) => {
	// Needs to be in view to move mouse over it.
	await from.locator.scrollIntoViewIfNeeded();
	const fromBB = await boundingBoxOf(from.locator);

	const dragStart = {
		x: fromBB.x + from.offset.x,
		y: fromBB.y + from.offset.y,
	};

	await page.mouse.move(dragStart.x, dragStart.y);
	await page.mouse.down();
	// A small initial move is needed for the drag to start.
	await page.mouse.move(dragStart.x, dragStart.y + 10, { steps: 5 });

	// Scroll into view so we can drag to it
	await to.locator.scrollIntoViewIfNeeded();
	const toBB = await boundingBoxOf(to.locator);

	const dragEnd = {
		x: toBB.x + to.offset.x,
		y: toBB.y + to.offset.y,
	};

	await page.mouse.move(dragEnd.x, dragEnd.y, { steps: 10 });
	await page.mouse.up();
};

const moveWithMouse = async (
	page: Page,
	name: string,
	position: string,
	target: string,
) => {
	const fromRow = rowOf(page, name);
	const toRow = rowOf(page, target);

	await dragWithMouse(
		page,
		{
			locator: fromRow,
			offset: await rowDragStartOffset(fromRow),
		},
		{
			locator: toRow,
			offset: await rowDragEndOffset(toRow, position),
		},
	);
};

// Steps

// Stubs the API so that only the editor UI is under test.
const editStubbedLayout = async (
	page: Page,
	edition: string,
	sections: Array<{ title: string; names: string[] }>,
) => {
	const identityNameOf = (name: string) => name.toLowerCase();
	await page.route('**/api/newsletters', (route) =>
		route.fulfill({
			json: {
				ok: true,
				data: sections.flatMap(({ names }) =>
					names.map((name) => ({
						identityName: identityNameOf(name),
						name,
						status: 'live',
					})),
				),
			},
		}),
	);
	await page.route(new RegExp(`/api/layouts/${edition}$`, 'i'), (route) =>
		route.fulfill({
			json: {
				ok: true,
				data: {
					groups: sections.map(({ title, names }) => ({
						title,
						newsletters: names.map(identityNameOf),
					})),
				},
			},
		}),
	);
	await openLayoutEditor(page, edition);
};

Given(
	'the editor is editing the {string} layout with section {string} listing {string}',
	async ({ page }, edition: string, title: string, list: string) => {
		await editStubbedLayout(page, edition, [{ title, names: parseList(list) }]);
	},
);

Given(
	'the editor is editing the {string} layout with sections:',
	async ({ page }, edition: string, table: DataTable) => {
		// Tall enough for every section to be on screen, as mouse drags can't scroll.
		await page.setViewportSize({ width: 1280, height: 1200 });
		await editStubbedLayout(page, edition, sectionsIn(table));
	},
);

// Writes to the real (in-memory) API storage; the fixtures undo it afterwards.
Given(
	'the {string} layout has section {string} listing stored newsletters {string}',
	async (
		{ request, namedNewsletters, storedLayouts },
		edition: string,
		title: string,
		list: string,
	) => {
		const identityNames: string[] = [];
		for (const name of parseList(list)) {
			const newsletter = await createFixtureNewsletter(request, { name });
			namedNewsletters.refsByName[name] = { kind: 'launched', ...newsletter };
			identityNames.push(newsletter.identityName);
		}
		await storedLayouts.create(edition.toUpperCase() as EditionId, {
			groups: [{ title, newsletters: identityNames }],
		});
	},
);

When(
	'the editor opens the {string} layout for editing',
	async ({ page }, edition: string) => {
		await openLayoutEditor(page, edition);
	},
);

When(
	/^the editor moves "(.+)" (above|below) "(.+)" using the (keyboard|mouse)$/,
	async (
		{ page },
		name: string,
		position: string,
		target: string,
		input: string,
	) => {
		const move = input === 'keyboard' ? moveWithKeyboard : moveWithMouse;
		await move(page, name, position, target);
	},
);

When(
	'the editor drops {string} into the empty section {string} using the mouse',
	async ({ page }, name: string, title: string) => {
		const fromRow = rowOf(page, name);

		const emptyArea = section(page, title).getByText('Drop a newsletter here');

		await dragWithMouse(
			page,
			{
				locator: fromRow,
				offset: await rowDragStartOffset(fromRow),
			},
			{
				locator: emptyArea,
				offset: await centerOffset(emptyArea),
			},
		);
	},
);

When(
	'the editor cancels a keyboard move of {string}',
	async ({ page }, name: string) => {
		await pickUp(page, name);
		await page.keyboard.press('Escape');
	},
);

When(
	'the editor drops {string} outside the section using the mouse',
	async ({ page }, name: string) => {
		const body = page.locator('body');

		const fromRow = rowOf(page, name);

		await dragWithMouse(
			page,
			{
				locator: fromRow,
				offset: await rowDragStartOffset(fromRow),
			},
			{
				locator: body,
				offset: { x: 5, y: 5 },
			},
		);
	},
);

When(
	'the editor tabs forward from the drag handle for {string}',
	async ({ page }, name: string) => {
		await dragHandle(page, name).focus();
		await expect(dragHandle(page, name)).toBeFocused();
		await page.keyboard.press('Tab');
	},
);

Then('the sections list:', async ({ page }, table: DataTable) => {
	for (const { title, names } of sectionsIn(table)) {
		const handles = dragHandlesIn(section(page, title));
		await expect
			.poll(() =>
				handles.evaluateAll((els) =>
					els.map((el) => el.getAttribute('aria-label')),
				),
			)
			.toEqual(names.map((name) => `Reorder ${name}`));
	}
});

Then(
	'the Remove button for {string} has focus',
	async ({ page }, name: string) => {
		await expect(
			page.getByRole('button', { name: `Remove ${name}`, exact: true }),
		).toBeFocused();
	},
);
