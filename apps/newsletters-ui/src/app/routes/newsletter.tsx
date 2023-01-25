import type { LoaderFunction, RouteObject } from 'react-router-dom';
import type { Newsletter } from '@newsletters-nx/newsletters-data-client';
import { NewsletterDetailView } from '../components/NewsletterDetailView';
import { NewsletterListView } from '../components/NewslettersListView';
import { ErrorPage } from '../ErrorPage';
import { Layout } from '../Layout';

export async function getNewsletters(): Promise<Newsletter[]> {
	try {
		const response = await fetch('api/v1/newsletters');
		// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment -- internal api call
		const data = await response.json();
		return data as Newsletter[];
	} catch (err) {
		console.error(err);
		return [];
	}
}

export const listLoader: LoaderFunction = async (): Promise<Newsletter[]> => {
	const list = await getNewsletters();
	return list;
};

export const detailLoader: LoaderFunction = async ({
	params,
}): Promise<Newsletter | undefined> => {
	const items = await getNewsletters();
	const match = items.find((item) => item.identityName === params.id);
	return match;
};

export const newsletterRoute: RouteObject = {
	path: '/newsletters/',
	element: <Layout />,
	errorElement: <ErrorPage />,
	children: [
		{
			path: '/newsletters/',
			element: <NewsletterListView />,
			loader: listLoader,
		},
		{
			path: '/newsletters/:id',
			element: <NewsletterDetailView />,
			loader: detailLoader,
		},
	],
};
