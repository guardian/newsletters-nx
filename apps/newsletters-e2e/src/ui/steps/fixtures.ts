import type {
	EditionId,
	Layout,
} from '@newsletters-nx/newsletters-data-client';
import { test as base, createBdd } from 'playwright-bdd';
import { deleteDraftNewsletter } from '../../../helpers/draft-newsletter';
import {
	backupFixtureLayouts,
	createFixtureLayout,
	deleteFixtureDraft,
	deleteFixtureNewsletter,
	restoreFixtureLayouts,
} from '../../../helpers/test-fixtures';
import CreateDraftNewsletterWizard from '../helpers/create-newsletter-wizard';
import NewslettersHubLandingPage from '../helpers/newsletters-hub-landing-page';

/** Scenario-scoped state for a draft newsletter created via the API. */
interface ExistingDraftNewsletter {
	listId?: number;
	name?: string;
}

/**
 * A reference to one named newsletter created via a test-fixture route.
 * `listId` is retained on both variants so cleanup can always delete the
 * right record; `identityName` is only meaningful (and only present) for
 * launched newsletters, which are addressed by identity elsewhere.
 */
export type NamedNewsletterRef =
	| { kind: 'draft'; listId: number }
	| { kind: 'launched'; listId: number; identityName: string };

/**
 * Scenario-scoped state for several newsletters (drafts and/or launched)
 * created via the `/api/test-fixtures/*` routes, keyed by whatever name a
 * `Given` step used to refer to them (not the newsletter's own `name` or
 * `identityName`).
 */
interface NamedNewsletters {
	refsByName: Record<string, NamedNewsletterRef>;
}

/**
 * Writes layouts directly to (in-memory) storage. Every edition's layout is
 * snapshotted before the scenario and restored afterwards.
 */
interface StoredLayouts {
	create: (edition: EditionId, layout: Layout) => Promise<void>;
}

type Fixtures = {
	existingDraftNewsletter: ExistingDraftNewsletter;
	namedNewsletters: NamedNewsletters;
	storedLayouts: StoredLayouts;
	createDraftNewsletterWizard: CreateDraftNewsletterWizard;
	newslettersHubLandingPage: NewslettersHubLandingPage;
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

	namedNewsletters: async ({ request }, use) => {
		const newsletters: NamedNewsletters = { refsByName: {} };
		await use(newsletters);
		await Promise.all(
			Object.values(newsletters.refsByName).map((ref) =>
				(ref.kind === 'draft'
					? deleteFixtureDraft(request, ref.listId)
					: deleteFixtureNewsletter(request, ref.listId)
				).catch(() => {
					// Best-effort cleanup only; ignore if already removed.
				}),
			),
		);
	},
	storedLayouts: async ({ request }, use) => {
		const backup = await backupFixtureLayouts(request);
		await use({
			create: (edition, layout) =>
				createFixtureLayout(request, edition, layout),
		});
		await restoreFixtureLayouts(request, backup);
	},

	createDraftNewsletterWizard: async ({ page, request }, use) => {
		const draft = new CreateDraftNewsletterWizard(page, request);
		await use(draft);
	},

	newslettersHubLandingPage: async ({ page, request }, use) => {
		const landingPage = new NewslettersHubLandingPage(page, request);
		await landingPage.backupLayouts();
		await use(landingPage);
		await landingPage.restoreLayouts();
	},
});

export const { Given, When, Then } = createBdd(test);
