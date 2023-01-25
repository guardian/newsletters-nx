import type { RouteObject } from 'react-router-dom';
import { Api } from '../components/Api';
import { ButtonContainer } from '../components/ButtonContainer';
import { EmotionTest } from '../components/EmotionTest';
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
			path: 'dark/',
			element: <EmotionTest theme="dark" />,
		},
		{
			path: 'light/',
			element: <EmotionTest theme="light" />,
		},
		{
			path: 'api/',
			element: <Api />,
		},
	],
};
