import type { LoaderFunction } from 'react-router-dom';
import type {
	NewsletterRow,
	NewsletterRowKind,
} from '../lib/all-newsletters-rows';
import {
	draftNewsletterToRow,
	launchedNewsletterToRow,
} from '../lib/all-newsletters-rows';
import { sortByNumber } from '../lib/sort-by-number';
import { fetchDraftNewsletterList, fetchNewsletterList } from './newsletters';

export interface AllNewslettersData {
	rows: NewsletterRow[];
	/** Sources that failed to load; the view still renders whichever succeeded. */
	failedSources: NewsletterRowKind[];
}

// Fetches both list sources in parallel and normalises them into one row shape.
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

		const draftsWithoutListId = (drafts ?? []).filter(
			(draft) => typeof draft.listId !== 'number',
		);
		if (draftsWithoutListId.length > 0) {
			console.warn(
				`allNewslettersLoader: omitting ${draftsWithoutListId.length} draft(s) with no listId`,
				draftsWithoutListId.map((draft) => draft.name),
			);
		}

		const rows = [
			...(launched ?? []).map(launchedNewsletterToRow),
			// listId is the row's identity and its link target, so a draft
			// without one cannot be rendered.
			...(drafts ?? [])
				.filter((draft) => typeof draft.listId === 'number')
				.map(draftNewsletterToRow),
		];

		// Most recently updated first; rows with no known update time (`Unknown`
		// in the table) sort last rather than clumping at the top. Ties (e.g.
		// several undated rows) fall back to `id` so ordering is deterministic
		// rather than depending on fetch/insertion order.
		const byDate = sortByNumber<NewsletterRow>(
			(row) => row.lastUpdated,
			'DESCENDING',
		);
		rows.sort((a, b) => byDate(a, b) || a.id.localeCompare(b.id));

		return { rows, failedSources };
	};
