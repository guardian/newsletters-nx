import type { Page } from '@playwright/test';
import { expect } from '@playwright/test';
import { defineParameterType } from 'playwright-bdd';
import z from 'zod';
import { Then, When } from './fixtures';

const placementSchema = z.literal(['before', 'after']);
type Placement = z.infer<typeof placementSchema>;

defineParameterType({
	name: 'placement',
	regexp: /before|after/,
	transformer: (s) => placementSchema.parse(s),
});

interface SavedLayout {
	groups: Array<{ title: string; newsletters: string[] }>;
}
// Layout bodies POSTed by the page, per page (i.e. per scenario).
const savedLayouts = new WeakMap<Page, SavedLayout[]>();

When(
	'the editor adds a new section {placement} the {string} section',
	async ({ page }, placement: Placement, adjacentSection: string) => {
		await page
			.getByRole('button', {
				name: `Add section ${placement} ${adjacentSection}`,
			})
			.click();
	},
);

Then(
	'a new section with no name is displayed on the page',
	async ({ page }) => {
		await expect(
			page.getByRole('region', { name: 'Unnamed section' }),
		).toBeVisible();
	},
);

Then(
	'the layout for edition {string} is saved with a new unnamed section {placement} the {string} section',
	async (
		{ page },
		edition: string,
		placement: 'before' | 'after',
		adjacentSection: string,
	) => {
		await expect
			.poll(() => savedLayouts.get(page)?.length ?? 0)
			.toBeGreaterThan(0);
		const [saved] = savedLayouts.get(page) ?? [];

		const adjacentSectionIndex = saved?.groups.findIndex(
			(section) => section.title === adjacentSection,
		);

		expect(adjacentSectionIndex).toBeDefined();
		expect(adjacentSectionIndex).toBeGreaterThanOrEqual(0);

		const getPlacementOffset = (placement: 'before' | 'after'): number => {
			switch (placement) {
				case 'after':
					return 1;
				case 'before':
					return -1;
			}
		};

		const unnamedSectionIndex =
			adjacentSectionIndex! + getPlacementOffset(placement);

		expect(saved?.groups[unnamedSectionIndex]).toEqual([
			{ title: '', newsletters: [] },
		]);
	},
);

Then(
	'there is only 1 section named {string} in the layout',
	async ({ page }, section: string) => {
		await expect(
			page.getByRole('main').getByRole('heading', { level: 4, name: section }),
		).toHaveCount(1);
	},
);
