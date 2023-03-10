import type { RouteObject } from 'react-router-dom';
import { redirect } from 'react-router-dom';
import { HealthCheck } from '../components/HealthCheck';
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
			path: 'api/',
			element: <HealthCheck />,
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
