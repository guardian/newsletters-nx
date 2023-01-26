import type { RouteObject } from 'react-router-dom';
import { Api } from '../components/Api';
import { ButtonContainer } from '../components/ButtonContainer';
import { NewsletterCreateView } from '../components/NewsletterCreateView';
import { ErrorPage } from '../ErrorPage';
import { Layout } from '../Layout';
import { listLoader } from './loaders';

export const homeRoute: RouteObject = {
	path: '/',
	element: <Layout />,
	errorElement: <ErrorPage />,
	children: [
		{
			path: '/',
			element: <ButtonContainer />,
		},
		{
			path: 'api/',
			element: <Api />,
		},
		{
			path: '/create',
			element: <NewsletterCreateView />,
			loader: listLoader,
		},
	],
};
