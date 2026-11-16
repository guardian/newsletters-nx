import type { Locator, Page } from '@playwright/test';

/** Shared by the Stand draft and launched newsletter detail pages. */
export const panelByName = (page: Page, name: string): Locator =>
	page.locator('section', {
		has: page.getByRole('heading', { level: 3, name, exact: true }),
	});

export const definitionForLabel = (panel: Locator, label: string): Locator =>
	panel
		.getByRole('group', { name: label, exact: true })
		.getByRole('definition');
