import type { Page } from '@playwright/test';
import { expect } from '@playwright/test';
import { Given, Then, When } from './fixtures';

interface SavedLayout {
	groups: Array<{ title: string; newsletters: string[] }>;
}

// Layout bodies POSTed by the page, per page (i.e. per scenario).
const savedLayouts = new WeakMap<Page, SavedLayout[]>();

const identityNameOf = (name: string) => name.toLowerCase();

const dragHandle = (page: Page, name: string) =>
	page.getByRole('button', { name: `Reorder ${name}`, exact: true });

const section = (page: Page, title: string) =>
	page.getByRole('region', { name: title, exact: true });

// react-aria keyboard drag: Enter picks up, arrows move between drop targets, Enter drops.
// The grid can steal focus back from the handle, so retry until the drag has started.
const pickUp = async (page: Page, name: string) => {
	const dropTargets = page.getByRole('button', { name: /^Insert / });
	await expect(async () => {
		await dragHandle(page, name).focus();
		await expect(dragHandle(page, name)).toBeFocused({ timeout: 250 });
		await page.keyboard.press('Enter');
		await expect(dropTargets.first()).toBeAttached({ timeout: 500 });
	}).toPass({ timeout: 5000 });
};

Given(
	'the editor is editing the layout for edition {string} with newsletters {string}, {string} and {string} in section {string} and an unassigned newsletter {string}',
	async (
		{ page },
		edition: string,
		first: string,
		second: string,
		third: string,
		title: string,
		unassigned: string,
	) => {
		const saved: SavedLayout[] = [];
		savedLayouts.set(page, saved);
		const layout: SavedLayout = {
			groups: [
				{
					title,
					newsletters: [first, second, third].map(identityNameOf),
				},
			],
		};
		await page.route('**/api/newsletters', async (route) => {
			await route.fulfill({
				json: {
					ok: true,
					data: [first, second, third, unassigned].map((name) => ({
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
	'the editor starts dragging {string} using the keyboard',
	async ({ page }, name: string) => {
		await pickUp(page, name);
	},
);

When('the editor presses Escape', async ({ page }) => {
	await page.keyboard.press('Escape');
});

When(
	'the editor drags {string} below {string} using the keyboard',
	async ({ page }, name: string, target: string) => {
		await moveWithKeyboard(page, name, target, 'after');
	},
);

When(
	'the editor drags {string} above {string} using the keyboard',
	async ({ page }, name: string, target: string) => {
		await moveWithKeyboard(page, name, target, 'before');
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
	'the editor drags {string} below {string} using the mouse',
	async ({ page }, name: string, target: string) => {
		await dragWithMouse(page, name, target, 'after');
	},
);

When(
	'the editor drags {string} above {string} using the mouse',
	async ({ page }, name: string, target: string) => {
		await dragWithMouse(page, name, target, 'before');
	},
);

When(
	'the editor drags {string} using the mouse and drops it outside the section',
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

Then(
	'each newsletter in section {string} has an enabled drag handle',
	async ({ page }, title: string) => {
		const handles = section(page, title).getByRole('button', {
			name: /^Reorder /,
		});
		await expect(handles).toHaveCount(3);
		for (const handle of await handles.all()) {
			await expect(handle).toBeEnabled();
		}
	},
);

Then(
	'each newsletter in section {string} has a disabled drag handle',
	async ({ page }, title: string) => {
		const handles = section(page, title).getByRole('button', {
			name: /^Reorder /,
		});
		await expect(handles).toHaveCount(3);
		for (const handle of await handles.all()) {
			await expect(handle).toBeDisabled();
		}
	},
);

Then(
	'section {string} lists newsletters in the order {string}, {string}, {string}',
	async ({ page }, title: string, a: string, b: string, c: string) => {
		const handles = section(page, title).getByRole('button', {
			name: /^Reorder /,
		});
		await expect
			.poll(async () =>
				handles.evaluateAll((els) =>
					els.map((el) => el.getAttribute('aria-label')),
				),
			)
			.toEqual([a, b, c].map((n) => `Reorder ${n}`));
	},
);

Then(
	'the layout for edition {string} is saved with section {string} ordered {string}, {string}, {string}',
	async (
		{ page },
		_edition: string,
		title: string,
		a: string,
		b: string,
		c: string,
	) => {
		await expect
			.poll(() => savedLayouts.get(page)?.length ?? 0)
			.toBeGreaterThan(0);
		const [saved] = savedLayouts.get(page) ?? [];
		expect(saved?.groups).toEqual([{ title, newsletters: [a, b, c] }]);
	},
);

Then('no reordered layout has been published', async ({ page }) => {
	await page.waitForLoadState('networkidle');
	expect(savedLayouts.get(page) ?? []).toHaveLength(0);
});
