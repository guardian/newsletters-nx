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

/**
 * Scenario-scoped state for several draft newsletters created via the API,
 * keyed by whatever name a `Given` step's data table used to refer to them
 * (not necessarily the draft's actual API name -- see `namedDraftNewsletters`
 * below). Torn down automatically afterwards, same as `existingDraftNewsletter`.
 */
interface NamedDraftNewsletters {
	listIdsByName: Record<string, number>;
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
	namedDraftNewsletters: NamedDraftNewsletters;
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

	namedDraftNewsletters: async ({ request }, use) => {
		const drafts: NamedDraftNewsletters = { listIdsByName: {} };
		await use(drafts);
		await Promise.all(
			Object.values(drafts.listIdsByName).map((listId) =>
				deleteDraftNewsletter(request, listId).catch(() => {
					// Best-effort cleanup only; ignore if already removed.
				}),
			),
		);
	},

	apiRequestLog: async ({ page }, use) => {
		/**
		 * Requests whose `started` event was logged since the last `reset`.
		 * A request that began before the reset may still be in flight and
		 * emit `requestfinished` afterwards; without this, that stray
		 * `finished` event would be logged with no matching `started` and
		 * make requests look sequential when they weren't.
		 */
		let tracked = new WeakSet();

		const log: ApiRequestLog = {
			events: [],
			reset: () => {
				log.events.length = 0;
				tracked = new WeakSet();
			},
		};

		const record =
			(type: ApiRequestEvent['type']) => (request: { url: () => string }) => {
				// Call `.url()` on the request itself rather than destructuring
				// it: `Request.url()` reads internal instance state, so a bare
				// destructured reference loses its `this` binding and throws.
				const { pathname } = new URL(request.url());
				if (!pathname.startsWith('/api/')) {
					return;
				}
				if (type === 'started') {
					tracked.add(request);
				} else if (!tracked.has(request)) {
					return;
				}
				log.events.push({ type, path: pathname });
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
