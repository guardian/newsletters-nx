import type {
	DraftNewsletterData,
	MetaData,
	NewsletterData,
} from '@newsletters-nx/newsletters-data-client';
import type { LoaderFunction } from 'react-router-dom';
import { fetchApiData } from '../api-requests/fetch-api-data';
import type { NewsletterRow, NewsletterRowKind } from '../lib/all-newsletters-rows';
import {
	draftNewsletterToRow,
	launchedNewsletterToRow,
} from '../lib/all-newsletters-rows';

type LaunchedListItem = NewsletterData & { meta?: MetaData };
type DraftListItem = DraftNewsletterData & { listId: number; meta?: MetaData };

export interface AllNewslettersData {
	rows: NewsletterRow[];
	/**
	 * Sources that failed to load. The list still renders rows from whichever
	 * source succeeded, and the view surfaces a non-blocking error for these.
	 */
	failedSources: NewsletterRowKind[];
}

/**
 * `fetchApiData` resolves to `undefined` on failure and to an array on
 * success, so an absent result is a genuine failure rather than an empty list.
 */
export const allNewslettersLoader: LoaderFunction =
	async (): Promise<AllNewslettersData> => {
		const [launched, drafts] = await Promise.all([
			fetchApiData<LaunchedListItem[]>(`api/newsletters`),
			fetchApiData<DraftListItem[]>(`api/drafts`),
		]);

		const failedSources: NewsletterRowKind[] = [
			...(launched ? [] : (['launched'] as const)),
			...(drafts ? [] : (['draft'] as const)),
		];

		const rows = [
			...(launched ?? []).map(launchedNewsletterToRow),
			...(drafts ?? [])
				.filter((draft) => typeof draft.listId === 'number')
				.map(draftNewsletterToRow),
		];

		return { rows, failedSources };
	};
