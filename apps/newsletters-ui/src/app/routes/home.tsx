import type { RouteObject } from 'react-router-dom';
import { ComingSoon } from '../ComingSoonPage';
import { HomeMenu } from '../components/HomeMenu';
import { ErrorPage } from '../ErrorPage';
import { Layout } from '../Layout';
import { listLoader } from '../loaders/newsletters';
import { NotFound } from '../NotFoundPage';

export const homeRoute: RouteObject = {
	path: '/',
	element: <Layout />,
	errorElement: <ErrorPage />,

	children: [
		{
			path: '',
			element: <HomeMenu />,
			loader: listLoader,
		},
		{
			path: 'templates',
			element: <ComingSoon />,
		},
		{
			path: 'thrashers',
			element: <ComingSoon />,
		},
		{ path: '*', element: <NotFound /> },
	],
};
