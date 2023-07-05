import type { LoaderFunction } from 'react-router';
import type {
	DraftNewsletterData,
	NewsletterData,
} from '@newsletters-nx/newsletters-data-client';
import { fetchApiData } from '../api-requests/fetch-api-data';

export const listLoader: LoaderFunction = async (): Promise<NewsletterData[]> =>
	(await fetchApiData<NewsletterData[]>(
		`api/newsletters?includeCancelled=true`,
	)) ?? [];

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
	const list = (await fetchApiData<DraftNewsletterData[]>(`api/drafts`)) ?? [];
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
