import type { RouteObject } from 'react-router-dom';
import { ButtonContainer } from '../components/ButtonContainer';
import { ErrorPage, Layout } from '../pages';

export const homeRoute: RouteObject = {
	path: '/',
	element: <Layout />,
	errorElement: <ErrorPage />,
	children: [
		{
			path: '/',
			element: <ButtonContainer />,
		},
	],
};
