import type { LoaderFunction, RouteObject } from 'react-router-dom';
import { Link } from 'react-router-dom';
import { NewsletterDetail } from '../components/NewsletterDetail';
import { ErrorPage } from '../ErrorPage';
import { Layout } from '../Layout';

export type Item = {
	id: string;
	name: string;
};

export async function getNames(): Promise<Item[]> {
	await new Promise((resolve) => setTimeout(resolve, 200));
	return [
		{ id: 'mail-1', name: 'The Mail' },
		{ id: 'newsletter-number-six', name: 'News at six' },
		{ id: 'the-news', name: 'More news now' },
	];
}

export const listLoader: LoaderFunction = async (): Promise<{
	ids: string[];
}> => {
	const list = await getNames();
	return { ids: list.map((item) => item.id) };
};

export const detailLoader: LoaderFunction = async ({
	params,
}): Promise<Item | undefined> => {
	const items = await getNames();
	const match = items.find((item) => item.id === params.id);
	return match;
};

export const newsletterRoute: RouteObject = {
	path: '/newsletters/',
	element: (
		<Layout>
			<Link to={`/`}>home</Link>
		</Layout>
	),
	errorElement: <ErrorPage />,
	loader: listLoader,
	children: [
		{
			path: '/newsletters/',
			element: <p>This is newsletters page</p>,
		},
		{
			path: '/newsletters/:id',
			element: <NewsletterDetail />,
			loader: detailLoader,
		},
	],
};
