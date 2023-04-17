import type { RouteObject } from 'react-router-dom';
import { HomeMenu } from '../components/HomeMenu';
import { ContentWrapper } from '../ContentWrapper';
import { ErrorPage } from '../ErrorPage';
import { Layout } from '../Layout';
import { listLoader } from '../loaders/newsletters';

export const homeRoute: RouteObject = {
	path: '/',
	element: <Layout />,
	errorElement: <Layout outlet={<ErrorPage />} />,

	children: [
		{
			path: '',
			element: <HomeMenu />,
			loader: listLoader,
		},
		{
			path: 'templates',
			element: <ContentWrapper>Coming soon...</ContentWrapper>,
		},
		{
			path: 'thrashers',
			element: <ContentWrapper>Coming soon...</ContentWrapper>,
		},
	],
};
