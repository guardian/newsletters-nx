import type { RouteObject } from 'react-router-dom';
import { HomeView } from '../components/views/HomeView';
import { TemplateListView } from '../components/views/TemplateListView';
import { ContentWrapper } from '../ContentWrapper';
import { ErrorPage } from '../ErrorPage';
import { Layout } from '../Layout';
import { allNewslettersLoader } from '../loaders/all-newsletters';
import { renderingTemplateListLoader } from '../loaders/rendering-templates';

export const homeRoute: RouteObject = {
	path: '/',
	element: <Layout />,
	errorElement: <Layout outlet={<ErrorPage />} />,

	children: [
		{
			path: '',
			element: <HomeView />,
			loader: allNewslettersLoader,
		},
		{
			path: 'templates',
			element: (
				<ContentWrapper>
					<TemplateListView />
				</ContentWrapper>
			),
			loader: renderingTemplateListLoader,
		},
	],
};
