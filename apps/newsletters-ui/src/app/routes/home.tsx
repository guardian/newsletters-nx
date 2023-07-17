import type { RouteObject } from 'react-router-dom';
import { HomeMenu } from '../components/HomeMenu';
import { TemplateListView } from '../components/views/TemplateListView';
import { ContentWrapper } from '../ContentWrapper';
import { ErrorPage } from '../ErrorPage';
import { Layout } from '../Layout';
import { listLoader } from '../loaders/newsletters';
import { renderingTemplateListLoader } from '../loaders/rendering-templates';

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
			element: (
				<ContentWrapper>
					<TemplateListView />
				</ContentWrapper>
			),
			loader: renderingTemplateListLoader,
		},
	],
};
