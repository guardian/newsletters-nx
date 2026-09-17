import type { Locator } from '@playwright/test';
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

When('the editor chooses to continue', async ({ page }) => {
	await page.getByRole('button').filter({ hasText: 'Continue' }).click();
});

When('the editor chooses to save and continue', async ({ page }) => {
	await page
		.getByRole('button')
		.filter({ hasText: 'Save and continue' })
		.click();
});

When('the editor fills out the name and frequency fields', async ({ page }) => {
	await page.getByLabel('Name the newsletter').fill('example');
	await page.getByLabel('Set the frequency').getByText('Monthly').check();
});

When(
	'the editor fills out the newsletter type and location fields',
	async ({ page }) => {
		await page
			.getByLabel('Type of newsletter')
			.getByText('article-based')
			.check();
		await page
			.getByLabel('Location of newsletter')
			.getByText('Web for first send only')
			.check();
	},
);

When('the editor sets the launch and sign up dates', async ({ page }) => {
	const fillDateSegment = async (
		group: Locator,
		name: string,
		value: string,
	) => {
		await group.getByRole('spinbutton', { name }).click();
		await page.keyboard.type(value);
	};

	const launchDateGroup = page.getByRole('group', {
		name: 'Enter launch date',
	});

	await fillDateSegment(launchDateGroup, 'day', '09');
	await fillDateSegment(launchDateGroup, 'month', '12');
	await fillDateSegment(launchDateGroup, 'year', '2025');

	const signUpDateGroup = page.getByRole('group', {
		name: 'Enter sign up page date',
	});

	await fillDateSegment(signUpDateGroup, 'day', '18');
	await fillDateSegment(signUpDateGroup, 'month', '12');
	await fillDateSegment(signUpDateGroup, 'year', '2025');
});

When(
	'the editor sets the region focus, pillar and MMA group',
	async ({ page }) => {
		await page
			.getByRole('radiogroup', { name: 'Region focus' })
			.getByText('UK')
			.check();

		const selectOption = async (label: string, option: string) => {
			await page.getByLabel(label).click();
			await page
				.getByRole('listbox')
				.getByRole('option', { name: option })
				.click();
		};

		await selectOption('Pillar', 'sport');
		await selectOption('Group for MMA page', 'Opinion');
	},
);
