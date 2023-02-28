import type { RouteObject } from 'react-router-dom';
import { NewsletterDetailView } from '../components/views/NewsletterDetailView';
import { NewsletterListView } from '../components/views/NewslettersListView';
import { ErrorPage } from '../ErrorPage';
import { Layout } from '../Layout';
import { detailLoader, listLoader } from './loaders';

export const newsletterRoute: RouteObject = {
	path: '/newsletters',
	element: <Layout />,
	errorElement: <ErrorPage />,
	children: [
		{
			path: '',
			element: <NewsletterListView />,
			loader: listLoader,
		},
		{
			path: ':id',
			element: <NewsletterDetailView />,
			loader: detailLoader,
		},
	],
};
