import type { EditionId } from '@newsletters-nx/newsletters-data-client';
import type { Locator, Page } from '@playwright/test';
import { expect } from '@playwright/test';
import { createFixtureNewsletter } from '../../../helpers/test-fixtures';
import { Given, Then, When } from './fixtures';

const parseList = (list: string) => list.split(',').map((n) => n.trim());

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
	// ArrowDown cycles through the gaps, wrapping round at the end.
	await expect(async () => {
		if (!(await gap.evaluate((el) => el === document.activeElement))) {
			await page.keyboard.press('ArrowDown');
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

// Presses on empty space in the row (between the details and the Remove
// button) and drags it to `toY`, or to (`toX`, `toY`) if given.
const dragRow = async (page: Page, name: string, toY: number, toX?: number) => {
	const row = await boundingBoxOf(rowOf(page, name));
	const x = row.x + row.width * 0.6;
	const y = row.y + row.height / 2;
	await page.mouse.move(x, y);
	await page.mouse.down();
	// A small initial move is needed for the drag to start.
	await page.mouse.move(x, y + 10, { steps: 5 });
	await page.mouse.move(toX ?? x, toY, { steps: 10 });
	await page.mouse.up();
};

const moveWithMouse = async (
	page: Page,
	name: string,
	position: string,
	target: string,
) => {
	const row = await boundingBoxOf(rowOf(page, target));
	// Aim just inside the target row's top or bottom edge.
	await dragRow(
		page,
		name,
		position === 'above' ? row.y + 2 : row.y + row.height - 2,
	);
};

// Steps

// Stubs the API so that only the editor UI is under test.
Given(
	'the editor is editing the {string} layout with section {string} listing {string}',
	async ({ page }, edition: string, title: string, list: string) => {
		const names = parseList(list);
		const identityNameOf = (name: string) => name.toLowerCase();
		await page.route('**/api/newsletters', (route) =>
			route.fulfill({
				json: {
					ok: true,
					data: names.map((name) => ({
						identityName: identityNameOf(name),
						name,
						status: 'live',
					})),
				},
			}),
		);
		await page.route(new RegExp(`/api/layouts/${edition}$`, 'i'), (route) =>
			route.fulfill({
				json: {
					ok: true,
					data: { groups: [{ title, newsletters: names.map(identityNameOf) }] },
				},
			}),
		);
		await openLayoutEditor(page, edition);
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
	'the editor cancels a keyboard move of {string}',
	async ({ page }, name: string) => {
		await pickUp(page, name);
		await page.keyboard.press('Escape');
	},
);

When(
	'the editor drops {string} outside the section using the mouse',
	async ({ page }, name: string) => {
		await dragRow(page, name, 5, 5);
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

Then(
	'section {string} lists {string}',
	async ({ page }, title: string, list: string) => {
		const handles = dragHandlesIn(section(page, title));
		await expect
			.poll(() =>
				handles.evaluateAll((els) =>
					els.map((el) => el.getAttribute('aria-label')),
				),
			)
			.toEqual(parseList(list).map((name) => `Reorder ${name}`));
	},
);

Then(
	'each newsletter in section {string} has an enabled drag handle',
	async ({ page }, title: string) => {
		const handles = dragHandlesIn(section(page, title));
		await expect(handles).not.toHaveCount(0);
		for (const handle of await handles.all()) {
			await expect(handle).toBeEnabled();
		}
	},
);

Then(
	'the Remove button for {string} has focus',
	async ({ page }, name: string) => {
		await expect(
			page.getByRole('button', { name: `Remove ${name}`, exact: true }),
		).toBeFocused();
	},
);
