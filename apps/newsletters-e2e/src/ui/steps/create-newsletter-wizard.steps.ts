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

When(
	'the editor sets the series tag & description, campaign tag & description fields',
	async ({ page }) => {
		await page
			.getByRole('textbox', { name: 'Add the series tag', exact: true })
			.fill('example/series');
		await page
			.getByRole('textbox', {
				name: 'Add the Series tag description',
				exact: true,
			})
			.fill('Example series tag description');

		await page
			.getByRole('textbox', { name: 'Campaign tag', exact: true })
			.fill('Example (newsletter sign up)');
		await page
			.getByRole('textbox', {
				name: 'Campaign description',
				exact: true,
			})
			.fill('Example campaign tag description');
	},
);

When(
	'the editor sets the headline, description, embed description, success message, highlight card message and image url fields',
	async ({ page }) => {
		await page.getByLabel('Headline').fill('Example headline');
		await page
			.getByLabel('Description', { exact: true })
			.fill('Example description');
		await page
			.getByLabel('Embed description')
			.fill('Example embed description');
		await page
			.getByLabel('Success message', { exact: true })
			.fill('Example success message. Hurray!');

		await page
			.getByLabel('Highlight card message', { exact: true })
			.fill('Example message for highlight card.');

		await page
			.getByPlaceholder('URL of the newsletter graphic 5:4')
			.fill('https://www.example.com/');

		await page
			.getByPlaceholder('URL of the newsletter graphic 1:1')
			.fill('https://www.example.com/');
	},
);

Given(
	"the editor has completed up until the 'Review' step",
	async ({ page, createDraftNewsletterWizard }) => {
		const continueToNextStep = async () => {
			await createDraftNewsletterWizard.gotoNextStep();
		};

		await continueToNextStep();

		await page.getByLabel('Name the newsletter').fill('example');
		await page.getByLabel('Set the frequency').getByText('Monthly').check();
		await continueToNextStep();

		await page
			.getByLabel('Type of newsletter')
			.getByText('article-based')
			.check();
		await page
			.getByLabel('Location of newsletter')
			.getByText('Web for first send only')
			.check();
		await continueToNextStep();

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
		await fillDateSegment(launchDateGroup, 'year', '2027');

		const signUpDateGroup = page.getByRole('group', {
			name: 'Enter sign up page date',
		});
		await fillDateSegment(signUpDateGroup, 'day', '18');
		await fillDateSegment(signUpDateGroup, 'month', '12');
		await fillDateSegment(signUpDateGroup, 'year', '2027');
		await continueToNextStep();

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
		await continueToNextStep();

		await page
			.getByRole('textbox', {
				name: 'Add the series tag',
				exact: true,
			})
			.fill('example/series');
		await page
			.getByRole('textbox', {
				name: 'Add the Series tag description',
				exact: true,
			})
			.fill('Example series tag description');
		await page
			.getByRole('textbox', {
				name: 'Campaign tag',
				exact: true,
			})
			.fill('Example (newsletter sign up)');
		await page
			.getByRole('textbox', {
				name: 'Campaign description',
				exact: true,
			})
			.fill('Example campaign tag description');
		await continueToNextStep();

		await page.getByLabel('Headline').fill('Example headline');
		await page
			.getByLabel('Description', { exact: true })
			.fill('Example description');
		await page
			.getByLabel('Embed description')
			.fill('Example embed description');
		await page
			.getByLabel('Success message', { exact: true })
			.fill('Example success message. Hurray!');
		await page
			.getByLabel('Highlight card message', { exact: true })
			.fill('Example message for highlight card.');
		await page
			.getByPlaceholder('URL of the newsletter graphic 5:4')
			.fill('https://www.example.com/');
		await page
			.getByPlaceholder('URL of the newsletter graphic 1:1')
			.fill('https://www.example.com/');
		await continueToNextStep();
	},
);

Given(
	"the editor has completed up until the 'Finish' step",
	async ({ page, createDraftNewsletterWizard }) => {
		const continueToNextStep = async () => {
			await createDraftNewsletterWizard.gotoNextStep();
		};

		await continueToNextStep();

		await page.getByLabel('Name the newsletter').fill('example');
		await page.getByLabel('Set the frequency').getByText('Monthly').check();
		await continueToNextStep();

		await page
			.getByLabel('Type of newsletter')
			.getByText('article-based')
			.check();
		await page
			.getByLabel('Location of newsletter')
			.getByText('Web for first send only')
			.check();
		await continueToNextStep();

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
		await fillDateSegment(launchDateGroup, 'year', '2027');

		const signUpDateGroup = page.getByRole('group', {
			name: 'Enter sign up page date',
		});
		await fillDateSegment(signUpDateGroup, 'day', '18');
		await fillDateSegment(signUpDateGroup, 'month', '12');
		await fillDateSegment(signUpDateGroup, 'year', '2027');
		await continueToNextStep();

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
		await continueToNextStep();

		await page
			.getByRole('textbox', {
				name: 'Add the series tag',
				exact: true,
			})
			.fill('example/series');
		await page
			.getByRole('textbox', {
				name: 'Add the Series tag description',
				exact: true,
			})
			.fill('Example series tag description');
		await page
			.getByRole('textbox', {
				name: 'Campaign tag',
				exact: true,
			})
			.fill('Example (newsletter sign up)');
		await page
			.getByRole('textbox', {
				name: 'Campaign description',
				exact: true,
			})
			.fill('Example campaign tag description');
		await continueToNextStep();

		await page.getByLabel('Headline').fill('Example headline');
		await page
			.getByLabel('Description', { exact: true })
			.fill('Example description');
		await page
			.getByLabel('Embed description')
			.fill('Example embed description');
		await page
			.getByLabel('Success message', { exact: true })
			.fill('Example success message. Hurray!');
		await page
			.getByLabel('Highlight card message', { exact: true })
			.fill('Example message for highlight card.');
		await page
			.getByPlaceholder('URL of the newsletter graphic 5:4')
			.fill('https://www.example.com/');
		await page
			.getByPlaceholder('URL of the newsletter graphic 1:1')
			.fill('https://www.example.com/');
		await continueToNextStep();

		// Go to Finish step
		await continueToNextStep();
	},
);

Then('the wizard navigation is disabled', async ({ page }) => {
	const allNavButtons = await page
		.getByRole('navigation', { name: 'Newsletter creation steps' })
		.getByRole('button')
		.all();

	for (const btn of allNavButtons) {
		const isCurrent = (await btn.getAttribute('aria-current')) == 'step';
		const isDisabled = await btn.isDisabled();
		expect(isCurrent || isDisabled).toBe(true);
	}
});

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
