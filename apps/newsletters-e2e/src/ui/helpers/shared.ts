import type { Page } from '@playwright/test';

export async function enableLegacyDesign(page: Page) {
	await page.goto('/drafts?switch-legacy=true');
}
