import type {
	DraftNewsletterData,
	DraftWithIdAndMeta,
	NewsletterData,
	NewsletterDataWithMeta,
} from '@newsletters-nx/newsletters-data-client';
import type { LoaderFunction } from 'react-router-dom';
import { fetchApiData } from '../api-requests/fetch-api-data';

// Exposed separately (not flattened to []) so callers can tell "no
// newsletters" apart from "could not load the newsletters".
export const fetchNewsletterList = async (): Promise<
	NewsletterDataWithMeta[] | undefined
> => fetchApiData<NewsletterDataWithMeta[]>(`api/newsletters`);

export const fetchDraftNewsletterList = async (): Promise<
	DraftWithIdAndMeta[] | undefined
> => fetchApiData<DraftWithIdAndMeta[]>(`api/drafts`);

export const listLoader: LoaderFunction = async (): Promise<
	NewsletterData[]
> => {
	const list = (await fetchNewsletterList()) ?? [];
	return list;
};

export const detailLoader: LoaderFunction = async ({
	params,
}): Promise<NewsletterData | undefined> => {
	const { id } = params;
	if (!id) {
		return undefined;
	}
	return await fetchApiData<NewsletterData>(`api/newsletters/${id}`);
};

export const draftListLoader: LoaderFunction = async (): Promise<
	DraftNewsletterData[]
> => {
	const list = (await fetchDraftNewsletterList()) ?? [];
	return list;
};

export const draftDetailLoader: LoaderFunction = async ({
	params,
}): Promise<DraftNewsletterData | undefined> => {
	const { id } = params;
	if (!id) {
		return undefined;
	}
	return await fetchApiData<DraftNewsletterData>(`api/drafts/${id}`);
};
