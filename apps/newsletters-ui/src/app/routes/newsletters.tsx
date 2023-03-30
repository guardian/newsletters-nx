import type { RouteObject } from 'react-router-dom';
import { NewsletterCreateView } from '../components/views/NewsletterCreateView';
import { NewsletterDetailView } from '../components/views/NewsletterDetailView';
import { NewslettersListView } from '../components/views/NewslettersListView';
import { ErrorPage } from '../ErrorPage';
import { Layout } from '../Layout';
import { detailLoader, listLoader } from '../loaders/newsletters';

export const newslettersRoute: RouteObject = {
	path: '/newsletters',
	element: <Layout />,
	errorElement: <ErrorPage />,
	children: [
		{
			path: '',
			element: <NewslettersListView />,
			loader: listLoader,
		},
		{
			path: ':id',
			element: <NewsletterDetailView />,
			loader: detailLoader,
		},
		{
			path: 'create',
			element: <NewsletterCreateView />,
			loader: listLoader,
		},
	],
};
