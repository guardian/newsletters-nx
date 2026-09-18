import { test as base, createBdd } from 'playwright-bdd';
import { deleteDraftNewsletter } from '../../../helpers/draft-newsletter';
import CreateDraftNewsletterWizard from './create-newsletter-wizard';

/**
 * Scenario-scoped state for a draft newsletter created via the API. Playwright
 * instantiates a fresh copy of this fixture per test, so it's safe under
 * parallel/sharded execution without any shared global state (no "World"
 * object) -- each scenario's step definitions read/write only their own
 * fixture instance, and the draft is torn down automatically afterwards.
 */
interface ExistingDraftNewsletter {
	listId?: number;
}

type Fixtures = {
	existingDraftNewsletter: ExistingDraftNewsletter;
	createDraftNewsletterWizard: CreateDraftNewsletterWizard;
};

export const test = base.extend<Fixtures>({
	existingDraftNewsletter: async ({ request }, use) => {
		const draft: ExistingDraftNewsletter = {};
		await use(draft);
		if (draft.listId) {
			await deleteDraftNewsletter(request, draft.listId).catch(() => {
				// Best-effort cleanup only; ignore if already removed.
			});
		}
	},
	createDraftNewsletterWizard: async ({ page }, use) => {
		const draft = new CreateDraftNewsletterWizard(page);
		await use(draft);
	},
});

export const { Given, When, Then } = createBdd(test);
