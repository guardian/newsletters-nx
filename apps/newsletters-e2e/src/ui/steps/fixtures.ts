import { test as base, createBdd } from 'playwright-bdd';
import { deleteDraftNewsletter } from '../../../helpers/draft-newsletter';

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

type ApiRequestEvent = {
	type: 'started' | 'finished';
	path: string;
};

/**
 * An ordered log of the page's calls to the API, so a scenario can assert not
 * just *that* two requests were made but that they were in flight at the same
 * time: parallel requests both start before either of them finishes.
 */
interface ApiRequestLog {
	events: ApiRequestEvent[];
	/** Discards everything logged so far, e.g. before a fresh navigation. */
	reset: () => void;
}

type Fixtures = {
	existingDraftNewsletter: ExistingDraftNewsletter;
	apiRequestLog: ApiRequestLog;
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

	apiRequestLog: async ({ page }, use) => {
		const log: ApiRequestLog = {
			events: [],
			reset: () => {
				log.events.length = 0;
			},
		};

		const record =
			(type: ApiRequestEvent['type']) =>
			({ url }: { url: () => string }) => {
				const { pathname } = new URL(url());
				if (pathname.startsWith('/api/')) {
					log.events.push({ type, path: pathname });
				}
			};

		page.on('request', record('started'));
		page.on('requestfinished', record('finished'));
		// A failed request is still "no longer in flight" as far as overlap
		// goes, so log it the same way.
		page.on('requestfailed', record('finished'));

		await use(log);
	},
});

export const { Given, When, Then } = createBdd(test);
