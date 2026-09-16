import type { RouteObject } from 'react-router-dom';
import { AllNewslettersView } from '../components/views/AllNewslettersView';
import { ErrorPage } from '../ErrorPage';
import { Layout } from '../Layout';
import { allNewslettersLoader } from '../loaders/all-newsletters';

export const allNewslettersRoute: RouteObject = {
	path: '/all',
	element: <Layout />,
	errorElement: <ErrorPage />,
	children: [
		{
			path: '',
			element: <AllNewslettersView />,
			loader: allNewslettersLoader,
		},
	],
};
