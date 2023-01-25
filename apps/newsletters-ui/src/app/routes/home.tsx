import type { RouteObject } from 'react-router-dom';
import { Api } from '../components/Api';
import { ButtonContainer } from '../components/ButtonContainer';
import { ErrorPage } from '../ErrorPage';
import { Layout } from '../Layout';

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
	],
};
