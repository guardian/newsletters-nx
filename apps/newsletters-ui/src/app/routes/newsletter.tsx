import type { RouteObject } from 'react-router-dom';
import { getNewsletter, getNewsletters } from '../api/newsletters';
import { NewsletterDetailView } from '../components/NewsletterDetailView';
import { NewsletterListView } from '../components/NewslettersListView';
import { ErrorPage, Layout } from '../pages';

export const newsletterRoute: RouteObject = {
	path: '/newsletters',
	element: <Layout />,
	errorElement: <ErrorPage />,
	children: [
		{
			path: '/newsletters',
			element: <NewsletterListView />,
			loader: async () => getNewsletters(),
		},
		{
			path: '/newsletters/:id',
			element: <NewsletterDetailView />,
			loader: async ({ params: { id } }) =>
				id ? getNewsletter(id) : undefined,
		},
	],
};
