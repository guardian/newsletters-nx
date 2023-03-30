import type { RouteObject } from 'react-router-dom';
import { NewslettersHome } from '../components/NewslettersHome';
import { ErrorPage } from '../ErrorPage';
import { Layout } from '../Layout';
import { listLoader } from '../loaders/newsletters';

export const homeRoute: RouteObject = {
	path: '/',
	element: <Layout />,
	errorElement: <ErrorPage />,

	children: [
		{
			path: '',
			element: <NewslettersHome />,
			loader: listLoader,
		},
		{
			path: 'templates',
			element: <span>Coming soon...</span>,
		},
		{
			path: 'thrashers',
			element: <span>Coming soon...</span>,
		},
		{ path: '*', element: <ErrorPage /> },
	],
};
