import type { LoaderFunction, RouteObject } from 'react-router-dom';
import type {
	ApiResponse,
	Newsletter,
} from '@newsletters-nx/newsletters-data-client';
import { NewsletterDetailView } from '../components/NewsletterDetailView';
import { NewsletterListView } from '../components/NewslettersListView';
import { ErrorPage } from '../ErrorPage';
import { Layout } from '../Layout';

async function getNewsletters(): Promise<Newsletter[]> {
	try {
		const response = await fetch('api/v1/newsletters');
		const data = (await response.json()) as ApiResponse<Newsletter[]>;
		return data.results;
	} catch (err) {
		console.error(err);
		return [];
	}
}

async function getNewsletter(id: string): Promise<Newsletter | undefined> {
	try {
		const response = await fetch(`api/v1/newsletters/${id}`);
		const data = (await response.json()) as ApiResponse<Newsletter>;
		return data.results;
	} catch (err) {
		console.error(err);
		return undefined;
	}
}

export const listLoader: LoaderFunction = async (): Promise<Newsletter[]> => {
	const list = await getNewsletters();
	return list;
};

export const detailLoader: LoaderFunction = async ({
	params,
}): Promise<Newsletter | undefined> => {
	if (!params.id) {
		return undefined;
	}
	return await getNewsletter(params.id);
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
