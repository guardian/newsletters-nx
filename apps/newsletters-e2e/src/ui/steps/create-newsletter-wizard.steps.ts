import { expect } from '@playwright/test';
import { Given, Then, When } from './fixtures';

Given('the redesign switch is turned on', async ({ page }) => {
	await page.goto('/?switch-stand=true');
});

Given('the editor is creating a new newsletter', async ({ page }) => {
	await page.goto('/drafts/newsletter-data');
});

When(
	'the editor selects the {string} step from the navigation',
	async ({ page }, step: string) => {
		await page.getByRole('navigation').getByText(step).click();
	},
);

Then(
	'the editor will see the {string} step',
	async ({ page }, step: string) => {
		await expect(
			page
				.getByRole('navigation')
				.getByRole('button')
				.filter({ hasText: step }),
		).toHaveAttribute('aria-current', 'step');
	},
);

Then(
	'the editor cannot select the {string} step from the navigation',
	async ({ page }, step: string) => {
		await expect(
			page
				.getByRole('navigation')
				.getByRole('button')
				.filter({ hasText: step }),
		).toBeDisabled();
	},
);
