import type { LoaderFunction } from 'react-router';
import { fetchApiData } from '../api-requests/fetch-api-data';

export interface BrazeNewsletterUrlEntry {
	identityName: string;
	newsletterName: string;
	exampleUrl: string | undefined;
	brazeUrl: string | undefined;
	isMatch: boolean;
}

export const brazeUrlLoader: LoaderFunction = async (): Promise<
	BrazeNewsletterUrlEntry[]
> => {
	const data =
		(await fetchApiData<BrazeNewsletterUrlEntry[]>(
			`api/braze/newsletter-urls`,
		)) ?? [];
	return data;
};

