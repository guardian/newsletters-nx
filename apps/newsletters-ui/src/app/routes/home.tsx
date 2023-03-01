import type { RouteObject } from 'react-router-dom';
import { Api } from '../components/Api';
import { ErrorPage } from '../ErrorPage';
import { Layout } from '../Layout';

export const homeRoute: RouteObject = {
	path: '/',
	element: <Layout />,
	errorElement: <ErrorPage />,
	children: [
		{
			path: 'api',
			element: <Api />,
		},
		{
			path: 'templates',
			element: <span>Coming soon...</span>,
		},
		{
			path: 'thrashers',
			element: <span>Coming soon...</span>,
		},
	],
};
