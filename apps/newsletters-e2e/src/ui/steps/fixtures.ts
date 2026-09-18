import { test as base, createBdd } from 'playwright-bdd';
import { deleteDraftNewsletter } from '../../../helpers/draft-newsletter';
import {
	deleteFixtureDraft,
	deleteFixtureNewsletter,
} from '../../../helpers/test-fixtures';

/** Scenario-scoped state for a draft newsletter created via the API. */
interface ExistingDraftNewsletter {
	listId?: number;
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

type Fixtures = {
	existingDraftNewsletter: ExistingDraftNewsletter;
	namedNewsletters: NamedNewsletters;
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
});

export const { Given, When, Then } = createBdd(test);
