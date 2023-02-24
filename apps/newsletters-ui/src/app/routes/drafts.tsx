import type { RouteObject } from 'react-router-dom';
import { NewsletterDetailView } from '../components/NewsletterDetailView';
import { NewsletterListView } from '../components/NewslettersListView';
import { ErrorPage } from '../ErrorPage';
import { Layout } from '../Layout';
// import { detailLoader, listLoader } from './loaders';

export const draftRoute: RouteObject = {
	path: '/drafts',
	element: <Layout />,
	errorElement: <ErrorPage />,
	children: [
		{
			path: '',
			element: <p>list view</p>,
			// loader: listLoader,
		},
		{
			path: ':id',
			element: <p>detail view</p>,
			// loader: detailLoader,
		},
	],
};
