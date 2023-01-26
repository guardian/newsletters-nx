import type { LoaderFunction, RouteObject } from 'react-router-dom';
import type { Newsletter } from '@newsletters-nx/newsletters-data-client';
import { NewsletterDetailView } from '../components/NewsletterDetailView';
import { NewsletterCreateView } from '../components/NewsletterCreateView';
import { NewsletterListView } from '../components/NewslettersListView';
import { ErrorPage } from '../ErrorPage';
import { Layout } from '../Layout';
import { detailLoader, listLoader } from './loaders';



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
