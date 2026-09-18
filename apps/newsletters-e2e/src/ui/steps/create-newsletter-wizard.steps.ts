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
		const continueToNextStep = async () => {
			await createDraftNewsletterWizard.gotoNextStep();
		};

		await continueToNextStep();

		await createDraftNewsletterWizard.fillNameField('example');
		await createDraftNewsletterWizard.setFrequencyField('Monthly');
		await continueToNextStep();

		await createDraftNewsletterWizard.setTypeField('article-based');
		await createDraftNewsletterWizard.setLocationField(
			'Web for first send only',
		);
		await continueToNextStep();

		await createDraftNewsletterWizard.setLaunchDate('09', '12', '2027');
		await createDraftNewsletterWizard.setSignUpDate('18', '12', '2027');
		await continueToNextStep();

		await createDraftNewsletterWizard.setRegionFocus('UK');
		await createDraftNewsletterWizard.selectPillar('sport');
		await createDraftNewsletterWizard.selectMmaGroup('Opinion');
		await continueToNextStep();

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
		await continueToNextStep();

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
		await continueToNextStep();
	},
);

Given(
	"the editor has completed up until the 'Finish' step",
	async ({ createDraftNewsletterWizard }) => {
		const continueToNextStep = async () => {
			await createDraftNewsletterWizard.gotoNextStep();
		};

		await continueToNextStep();

		await createDraftNewsletterWizard.fillNameField('example');
		await createDraftNewsletterWizard.setFrequencyField('Monthly');
		await continueToNextStep();

		await createDraftNewsletterWizard.setTypeField('article-based');
		await createDraftNewsletterWizard.setLocationField(
			'Web for first send only',
		);
		await continueToNextStep();

		await createDraftNewsletterWizard.setLaunchDate('09', '12', '2027');
		await createDraftNewsletterWizard.setSignUpDate('18', '12', '2027');
		await continueToNextStep();

		await createDraftNewsletterWizard.setRegionFocus('UK');
		await createDraftNewsletterWizard.selectPillar('sport');
		await createDraftNewsletterWizard.selectMmaGroup('Opinion');
		await continueToNextStep();

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
		await continueToNextStep();

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
		await continueToNextStep();

		// Go to Finish step
		await continueToNextStep();
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
