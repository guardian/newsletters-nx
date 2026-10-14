import type { Page } from '@playwright/test';
import { expect } from '@playwright/test';
import { Given, Then, When } from './fixtures';

interface SavedLayout {
	groups: Array<{ title: string; newsletters: string[] }>;
}

// Layout bodies POSTed by the page, per page (i.e. per scenario).
const savedLayouts = new WeakMap<Page, SavedLayout[]>();

const identityNameOf = (name: string) => name.toLowerCase();

const parseList = (list: string) => list.split(',').map((n) => n.trim());

const dragHandle = (page: Page, name: string) =>
	page.getByRole('button', { name: `Reorder ${name}`, exact: true });

const section = (page: Page, title: string) =>
	page.getByRole('region', { name: title, exact: true });

// react-aria keyboard drag: Enter picks up, arrows move between drop targets, Enter drops.
// The grid can steal focus back from the handle, so retry until the drag has started.
const pickUp = async (page: Page, name: string) => {
	const dropTargets = page.getByRole('button', { name: /^Insert / });
	await expect(async () => {
		// Don't press Enter again if a previous attempt already started the drag.
		if ((await dropTargets.count()) > 0) {
			return;
		}
		await dragHandle(page, name).focus();
		await expect(dragHandle(page, name)).toBeFocused({ timeout: 250 });
		await page.keyboard.press('Enter');
		await expect(dropTargets.first()).toBeAttached({ timeout: 500 });
	}).toPass({ timeout: 5000 });
};

Given(
	'the editor is editing the {string} layout with section {string} listing {string}',
	async ({ page }, edition: string, title: string, list: string) => {
		const names = parseList(list);
		const saved: SavedLayout[] = [];
		savedLayouts.set(page, saved);
		const layout: SavedLayout = {
			groups: [{ title, newsletters: names.map(identityNameOf) }],
		};
		await page.route('**/api/newsletters', async (route) => {
			await route.fulfill({
				json: {
					ok: true,
					data: names.map((name) => ({
						identityName: identityNameOf(name),
						name,
						status: 'live',
					})),
				},
			});
		});
		await page.route(
			new RegExp(`/api/layouts/${edition}$`, 'i'),
			async (route) => {
				if (route.request().method() === 'POST') {
					saved.push(route.request().postDataJSON() as SavedLayout);
				}
				await route.fulfill({ json: { ok: true, data: layout } });
			},
		);
		await page.goto(`/layouts/edit/${edition}`);
		await expect(
			page.getByRole('button', {
				name: 'Save and publish layout',
				exact: true,
			}),
		).toBeVisible();
	},
);

When(
	'the editor cancels a keyboard move of {string}',
	async ({ page }, name: string) => {
		await pickUp(page, name);
		await page.keyboard.press('Escape');
	},
);

const rowOf = (page: Page, name: string) =>
	page.getByRole('row').filter({ hasText: name });

// Presses on empty space in the row (between the details and the Remove button).
const dragWithMouse = async (
	page: Page,
	name: string,
	target: string,
	position: 'before' | 'after',
) => {
	const source = await rowOf(page, name).boundingBox();
	const destination = await rowOf(page, target).boundingBox();
	expect(source).not.toBeNull();
	expect(destination).not.toBeNull();
	if (!source || !destination) {
		return;
	}
	// The gap is the boundary between two rows; aim a pixel inside the target row.
	const gapY =
		position === 'before'
			? destination.y + 2
			: destination.y + destination.height - 2;
	const x = source.x + source.width * 0.6;
	await page.mouse.move(x, source.y + source.height / 2);
	await page.mouse.down();
	await page.mouse.move(x, source.y + source.height / 2 + 10, { steps: 5 });
	await page.mouse.move(x, gapY, { steps: 10 });
	await page.mouse.up();
};

When(
	'the editor drops {string} outside the section using the mouse',
	async ({ page }, name: string) => {
		const source = await rowOf(page, name).boundingBox();
		expect(source).not.toBeNull();
		if (!source) {
			return;
		}
		const x = source.x + source.width * 0.6;
		await page.mouse.move(x, source.y + source.height / 2);
		await page.mouse.down();
		await page.mouse.move(x, source.y + source.height / 2 + 10, { steps: 5 });
		await page.mouse.move(5, 5, { steps: 10 });
		await page.mouse.up();
	},
);

const moveWithKeyboard = async (
	page: Page,
	name: string,
	target: string,
	position: 'before' | 'after',
) => {
	const names = (
		await page
			.getByRole('button', { name: /^Reorder / })
			.evaluateAll((els) =>
				els.map((el) => el.getAttribute('aria-label') ?? ''),
			)
	).map((label) => label.slice('Reorder '.length));
	const to = names.indexOf(target);
	expect(to).toBeGreaterThanOrEqual(0);
	const before = position === 'before' ? names[to - 1] : names[to];
	const after = position === 'before' ? names[to] : names[to + 1];
	// react-aria renders a focusable button for each gap, labelled like this.
	const label = !before
		? `Insert before ${after}`
		: !after
			? `Insert after ${before}`
			: `Insert between ${before} and ${after}`;
	const dropTarget = page.getByRole('button', { name: label, exact: true });

	await pickUp(page, name);
	await expect(dropTarget).toBeAttached();
	// ArrowDown moves focus through the drop targets, wrapping round at the end.
	await expect(async () => {
		const isFocused = await dropTarget.evaluate(
			(el) => el === document.activeElement,
		);
		if (!isFocused) {
			await page.keyboard.press('ArrowDown');
		}
		await expect(dropTarget).toBeFocused({ timeout: 250 });
	}).toPass({ timeout: 5000 });
	await page.keyboard.press('Enter');
};

const positions = { above: 'before', below: 'after' } as const;

When(
	'the editor moves {string} {word} {string} using the {word}',
	async (
		{ page },
		name: string,
		position: string,
		target: string,
		input: string,
	) => {
		const where = positions[position as keyof typeof positions];
		expect(where, `unknown position "${position}"`).toBeDefined();
		if (input === 'keyboard') {
			await moveWithKeyboard(page, name, target, where);
		} else if (input === 'mouse') {
			await dragWithMouse(page, name, target, where);
		} else {
			throw new Error(`Unknown input method "${input}"`);
		}
	},
);

Given(
	'the editor has moved {string} below {string}',
	async ({ page }, name: string, target: string) => {
		await moveWithKeyboard(page, name, target, 'after');
	},
);

When('the editor discards their changes', async ({ page }) => {
	await page.getByRole('button', { name: 'Cancel', exact: true }).click();
	await expect(page.getByText('Discard unsaved changes?')).toBeVisible();
	await page
		.getByRole('button', { name: 'Discard changes', exact: true })
		.click();
});

Then(
	'each newsletter in section {string} has an enabled drag handle',
	async ({ page }, title: string) => {
		const handles = section(page, title).getByRole('button', {
			name: /^Reorder /,
		});
		await expect(handles).not.toHaveCount(0);
		for (const handle of await handles.all()) {
			await expect(handle).toBeEnabled();
		}
	},
);

Then(
	'section {string} lists {string}',
	async ({ page }, title: string, list: string) => {
		const handles = section(page, title).getByRole('button', {
			name: /^Reorder /,
		});
		await expect
			.poll(async () =>
				handles.evaluateAll((els) =>
					els.map((el) => el.getAttribute('aria-label')),
				),
			)
			.toEqual(parseList(list).map((n) => `Reorder ${n}`));
	},
);

Then(
	'the published layout lists section {string} as {string}',
	async ({ page }, title: string, list: string) => {
		await expect
			.poll(() => savedLayouts.get(page)?.length ?? 0)
			.toBeGreaterThan(0);
		const [saved] = savedLayouts.get(page) ?? [];
		expect(saved?.groups).toEqual([
			{ title, newsletters: parseList(list).map(identityNameOf) },
		]);
	},
);

Then('no layout has been published', async ({ page }) => {
	await page.waitForLoadState('networkidle');
	expect(savedLayouts.get(page) ?? []).toHaveLength(0);
});

When(
	'the editor tabs forward from the drag handle for {string}',
	async ({ page }, name: string) => {
		await dragHandle(page, name).focus();
		await expect(dragHandle(page, name)).toBeFocused();
		await page.keyboard.press('Tab');
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
