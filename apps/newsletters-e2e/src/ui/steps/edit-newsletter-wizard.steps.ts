import { expect } from '@playwright/test';
import { createBdd } from 'playwright-bdd';
import { test } from './fixtures';

const { Then, When } = createBdd(test, {
	tags: '@feature-edit-newsletter-wizard',
});

When(
	'the editor edits the existing draft newsletter',
	async ({ page, existingDraftNewsletter, createDraftNewsletterWizard }) => {
		await page.goto(
			`/drafts/newsletter-data/${existingDraftNewsletter.listId}`,
		);
		// Pre-set the listId so `getStoredNewsletterData` can be used without
		// first having to advance a step (which is how it's normally captured
		// when creating a brand new draft).
		createDraftNewsletterWizard.listId = existingDraftNewsletter.listId!;
	},
);

Then(
	'the {string} step is only shown once in the navigation',
	async ({ createDraftNewsletterWizard }, step: string) => {
		await expect(
			createDraftNewsletterWizard.getNavigationStepButton(step),
		).toHaveCount(1);
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
	"the name field is pre-filled with the existing draft's name",
	async ({ createDraftNewsletterWizard, existingDraftNewsletter }) => {
		await expect(createDraftNewsletterWizard.locateNameField()).toHaveValue(
			existingDraftNewsletter.name!,
		);
	},
);

When(
	'the editor updates every field of the draft newsletter',
	async ({ createDraftNewsletterWizard }) => {
		await createDraftNewsletterWizard.fillAllFields();
	},
);

Then(
	"the stored newsletter reflects the editor's changes to the same draft",
	async ({ createDraftNewsletterWizard, existingDraftNewsletter }) => {
		expect(createDraftNewsletterWizard.listId).toEqual(
			existingDraftNewsletter.listId,
		);

		const storedNewsletterData =
			await createDraftNewsletterWizard.getStoredNewsletterData();

		expect(storedNewsletterData.name).toEqual('example');
		expect(storedNewsletterData.name).not.toEqual(existingDraftNewsletter.name);
	},
);
