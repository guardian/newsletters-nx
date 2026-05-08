import type { RouteObject } from 'react-router-dom';
import { BrazeUrlReviewView } from '../components/views/BrazeUrlReviewView';
import { ErrorPage } from '../ErrorPage';
import { Layout } from '../Layout';

export const brazeRoute: RouteObject = {
	path: '/braze-sync',
	element: <Layout />,
	errorElement: <ErrorPage />,
	children: [
		{
			path: '',
			element: <BrazeUrlReviewView />,
		},
	],
};

