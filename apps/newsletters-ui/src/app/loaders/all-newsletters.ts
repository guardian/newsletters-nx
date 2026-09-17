import type { LoaderFunction } from 'react-router-dom';
import type {
	NewsletterRow,
	NewsletterRowKind,
} from '../lib/all-newsletters-rows';
import {
	draftNewsletterToRow,
	launchedNewsletterToRow,
} from '../lib/all-newsletters-rows';
import { fetchDraftNewsletterList, fetchNewsletterList } from './newsletters';

export interface AllNewslettersData {
	rows: NewsletterRow[];
	/**
	 * Sources that failed to load. The view still renders rows from whichever
	 * source succeeded, and reports these as a non-blocking error rather than
	 * pretending the missing newsletters do not exist.
	 */
	failedSources: NewsletterRowKind[];
}

/**
 * Loads both newsletter sources in parallel — the same two list fetches the
 * `/launched` and `/drafts` loaders use — and normalises them into one row
 * shape, following the parallel `Promise.all` pattern in `loaders/layouts.ts`.
 */
export const allNewslettersLoader: LoaderFunction =
	async (): Promise<AllNewslettersData> => {
		const [launched, drafts] = await Promise.all([
			fetchNewsletterList(),
			fetchDraftNewsletterList(),
		]);

		const failedSources: NewsletterRowKind[] = [
			...(launched ? [] : (['launched'] as const)),
			...(drafts ? [] : (['draft'] as const)),
		];

		const rows = [
			...(launched ?? []).map(launchedNewsletterToRow),
			// listId is the row's identity and its link target, so a draft
			// without one cannot be rendered.
			...(drafts ?? [])
				.filter((draft) => typeof draft.listId === 'number')
				.map(draftNewsletterToRow),
		];

		// Most recently updated first; rows with no known update time (`Unknown`
		// in the table) sort last rather than clumping at the top.
		rows.sort((a, b) => (b.lastUpdated ?? 0) - (a.lastUpdated ?? 0));

		return { rows, failedSources };
	};
