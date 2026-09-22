import type { NewsletterData } from '@newsletters-nx/newsletters-data-client';
import { expect } from '@playwright/test';
import { createBdd, type DataTable } from 'playwright-bdd';
import type { NewsletterFormData } from '../helpers/create-newsletter-wizard';
import { test } from './fixtures';

const { Given, Then, When } = createBdd(test, {
	tags: '@feature-create-newsletter-wizard',
});

Given('the editor is creating a new newsletter', async ({ page }) => {
	await page.goto('/drafts/newsletter-data');
});

When(
	'the editor selects the {string} step from the navigation',
	async ({ createDraftNewsletterWizard }, step: string) => {
		await createDraftNewsletterWizard.getNavigationStepButton(step).click();
	},
);

Then(
	'the editor will see the {string} step',
	async ({ createDraftNewsletterWizard }, step: string) => {
		await expect(
			createDraftNewsletterWizard.getNavigationStepButton(step),
		).toHaveAttribute('aria-current', 'step');
	},
);

Then(
	'the editor cannot select the {string} step from the navigation',
	async ({ createDraftNewsletterWizard }, step: string) => {
		await expect(
			createDraftNewsletterWizard.getNavigationStepButton(step),
		).toBeDisabled();
	},
);

When(
	'the editor chooses to continue',
	async ({ createDraftNewsletterWizard }) => {
		await createDraftNewsletterWizard.gotoNextStep();
	},
);

When(
	'the editor chooses to save and continue',
	async ({ createDraftNewsletterWizard }) => {
		await createDraftNewsletterWizard.gotoNextStep();
	},
);

When(
	'the editor fills out the name and frequency fields',
	async ({ createDraftNewsletterWizard }) => {
		await createDraftNewsletterWizard.fillNameField('example');
		await createDraftNewsletterWizard.setFrequencyField('Monthly');
	},
);
When(
	'the editor fills out the newsletter type and location fields',
	async ({ createDraftNewsletterWizard }) => {
		await createDraftNewsletterWizard.setTypeField('article-based');
		await createDraftNewsletterWizard.setLocationField(
			'Web for first send only',
		);
	},
);

When(
	'the editor sets the launch and sign up dates',
	async ({ createDraftNewsletterWizard }) => {
		await createDraftNewsletterWizard.setLaunchDate('09', '12', '2025');
		await createDraftNewsletterWizard.setSignUpDate('18', '12', '2025');
	},
);

When(
	'the editor sets the region focus, pillar and MMA group',
	async ({ createDraftNewsletterWizard }) => {
		await createDraftNewsletterWizard.setRegionFocus('UK');
		await createDraftNewsletterWizard.selectPillar('sport');
		await createDraftNewsletterWizard.selectMmaGroup('Opinion');
	},
);

When(
	'the editor sets the series tag & description, campaign tag & description fields',
	async ({ createDraftNewsletterWizard }) => {
		await createDraftNewsletterWizard.setSeriesTag('example/series');
		await createDraftNewsletterWizard.setSeriesTagDescription(
			'Example series tag description',
		);
		await createDraftNewsletterWizard.setCampaignTag(
			'Example (newsletter sign up)',
		);
		await createDraftNewsletterWizard.setCampaignDescription(
			'Example campaign tag description',
		);
	},
);

When(
	'the editor sets the headline, description, embed description, success message, highlight card message and image url fields',
	async ({ createDraftNewsletterWizard }) => {
		await createDraftNewsletterWizard.setHeadline('Example headline');
		await createDraftNewsletterWizard.setDescription('Example description');
		await createDraftNewsletterWizard.setEmbedDescription(
			'Example embed description',
		);
		await createDraftNewsletterWizard.setSuccessMessage(
			'Example success message. Hurray!',
		);
		await createDraftNewsletterWizard.setHighlightCardMessage(
			'Example message for highlight card.',
		);
		await createDraftNewsletterWizard.setImageUrl(
			'5:4',
			'https://www.example.com/',
		);
		await createDraftNewsletterWizard.setImageUrl(
			'1:1',
			'https://www.example.com/',
		);
	},
);

Given(
	"the editor has completed up until the 'Review' step",
	async ({ createDraftNewsletterWizard }) => {
		await createDraftNewsletterWizard.gotoNextStep();
		await createDraftNewsletterWizard.fillAllFields();
	},
);

Given(
	"the editor has completed up until the 'Finish' step",
	async ({ createDraftNewsletterWizard }) => {
		await createDraftNewsletterWizard.gotoNextStep();
		await createDraftNewsletterWizard.fillAllFields();

		// Go to Finish step
		await createDraftNewsletterWizard.gotoNextStep();
	},
);

Then(
	'the wizard navigation is disabled',
	async ({ createDraftNewsletterWizard }) => {
		for (const btn of await createDraftNewsletterWizard.getAllNavigationStepButtons()) {
			const isCurrent = (await btn.getAttribute('aria-current')) == 'step';
			const isDisabled = await btn.isDisabled();
			expect(isCurrent || isDisabled).toBe(true);
		}
	},
);

When(
	'the editor follows the edit link for the {string} step',
	async ({ page }, step: string) => {
		await page
			.locator('section')
			.filter({ hasText: step })
			.getByRole('link', { name: 'Edit' })
			.click();
	},
);

When('the editor selects the details page link', async ({ page }) => {
	await page.getByRole('link', { name: 'details page' }).click();
});

Then(
	'the editor can see the details page',
	async ({ page, createDraftNewsletterWizard }) => {
		expect(
			createDraftNewsletterWizard.listId,
			'Newsletter list id was not captured in test run',
		).toBeDefined();
		await expect(page.locator('p').filter({ hasText: `id:` })).toContainText(
			createDraftNewsletterWizard.listId!.toString(),
		);
	},
);

When('the editor selects the launch wizard link', async ({ page }) => {
	await page.getByRole('link', { name: 'use the launch wizard' }).click();
});

Then(
	'the editor can see the launch wizard',
	async ({ page, createDraftNewsletterWizard }) => {
		expect(
			createDraftNewsletterWizard.listId,
			'Newsletter list id was not captured in test run',
		).toBeDefined();
		await expect(page.getByRole('heading', { name: 'Launch' })).toBeVisible();
		const storedNewsletterData =
			await createDraftNewsletterWizard.getStoredNewsletterData();

		expect(storedNewsletterData.name).toBeDefined();

		await expect(page.getByText('This wizard will guide you')).toContainText(
			storedNewsletterData.name!,
		);
	},
);

Given(
	'all form fields will be filled in',
	({ createDraftNewsletterWizard }, table: DataTable) => {
		const overrides = Object.fromEntries(
			table.hashes().map(({ field, value }) => [field, value]),
		) as Partial<NewsletterFormData>;

		createDraftNewsletterWizard.setFormFieldOverrides(overrides);
	},
);

When('the editor selects the rendering options link', async ({ page }) => {
	await page.getByRole('link', { name: 'rendering options' }).click();
});

Then(
	'the editor can see the rendering options page for the newly created newsletter',
	async ({ page, createDraftNewsletterWizard }) => {
		expect(
			createDraftNewsletterWizard.listId,
			'Newsletter list id was not captured in test run',
		).toBeDefined();
		await expect(
			page.getByRole('heading', { name: 'Set Rendering Template Options' }),
		).toBeVisible();

		// Neither the list id, no name are rendered on the page, so we check the url.
		expect(page.url()).toContain(
			createDraftNewsletterWizard.listId!.toString(),
		);
	},
);

When('the editor should not see a rendering options link', async ({ page }) => {
	await expect(
		page.getByRole('link', { name: 'rendering options' }),
	).toHaveCount(0);
});

Then(
	'the ui will indicate the following fields are mandatory',
	async ({ page, createDraftNewsletterWizard }, table: DataTable) => {
		const errorAlert = page
			.getByRole('alert')
			.filter({ hasText: 'Please try again' });
		for (const row of table.hashes()) {
			const field = createDraftNewsletterWizard.locateField(
				row.id! as keyof NewsletterData,
			);

			const invalidDiv = page.locator('div[data-invalid="true"]');
			const wrapper = invalidDiv
				.filter({ has: field })
				.or(invalidDiv.and(field));

			const errorMessage = wrapper.filter({
				has: page.locator('[slot="errorMessage"]'),
			});

			await expect(errorMessage).toContainText(
				row.message ?? 'Must not be empty',
			);
			await expect(errorAlert).toContainText(row.id!);
		}
	},
);

When(
	'the editor fills out the series tag field',
	async ({ createDraftNewsletterWizard }) => {
		await createDraftNewsletterWizard.setSeriesTag(
			'example/example-newsletter',
		);
	},
);

When(
	'the editor fills out the campaign tag field',
	async ({ createDraftNewsletterWizard }) => {
		await createDraftNewsletterWizard.setCampaignTag(
			'Example (newsletter sign up)',
		);
	},
);

Then(
	'the ui will indicate the series tag description is mandatory',
	async ({ page }) => {
		const errorAlert = page
			.getByRole('alert')
			.filter({ hasText: 'Please try again' });

		await expect(errorAlert).toContainText(
			'Series tag description is required if series tag specified',
		);
	},
);

Then(
	'the ui will indicate the campagin tag description is mandatory',
	async ({ page }) => {
		const errorAlert = page
			.getByRole('alert')
			.filter({ hasText: 'Please try again' });

		await expect(errorAlert).toContainText(
			'Enter composer campaign tag if specifying composer tag',
		);
	},
);

Then(
	'only the following navigation links are marked as optional',
	async ({ createDraftNewsletterWizard }, table: DataTable) => {
		for (const row of table.hashes()) {
			const navButton = createDraftNewsletterWizard.getNavigationStepButton(
				row.step!,
			);

			await expect(navButton).toContainText('Optional');
		}

		const totalNavButtons = await createDraftNewsletterWizard
			.locateNavigationStepButtons()
			.count();
		const totalOptionalSteps = table.hashes().length;
		const requiredStepButtons = createDraftNewsletterWizard
			.locateNavigationStepButtons()
			.filter({ hasNotText: 'Optional' });

		await expect(requiredStepButtons).toHaveCount(
			totalNavButtons - totalOptionalSteps,
		);
	},
);

Then(
	'the following navigation links are marked as incomplete',
	async ({ createDraftNewsletterWizard }, table: DataTable) => {
		for (const row of table.hashes()) {
			const navButton = createDraftNewsletterWizard.getNavigationStepButton(
				row.step!,
			);

			await expect(navButton).toContainText('Incomplete');
		}
	},
);

Then(
	'the {string} step will be marked complete',
	async ({ createDraftNewsletterWizard }, step: string) => {
		const navButton = createDraftNewsletterWizard.getNavigationStepButton(step);
		await expect(navButton).toContainText('Complete');
	},
);
