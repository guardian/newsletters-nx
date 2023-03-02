import type { RouteObject } from 'react-router-dom';
import { redirect } from 'react-router-dom';
import { Api } from '../components/Api';
// import { NewslettersHome } from '../components/NewslettersHome';
import { ErrorPage } from '../ErrorPage';
import { Layout } from '../Layout';

export const homeRoute: RouteObject = {
	path: '/',
	element: <Layout />,
	errorElement: <ErrorPage />,
	children: [
		{
			path: '',
			action: () => redirect('/newsletters'),
		},
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
