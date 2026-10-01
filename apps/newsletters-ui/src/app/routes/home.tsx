import type { LoaderFunction, RouteObject } from 'react-router-dom';
import { HomeMenu } from '../components/HomeMenu';
import { HomeView } from '../components/views/HomeView';
import { TemplateListView } from '../components/views/TemplateListView';
import { ContentWrapper } from '../ContentWrapper';
import { ErrorPage } from '../ErrorPage';
import { isFeatureSwitchEnabled } from '../featureSwitches';
import { Layout } from '../Layout';
import { allNewslettersLoader } from '../loaders/all-newsletters';
import { listLoader } from '../loaders/newsletters';
import { renderingTemplateListLoader } from '../loaders/rendering-templates';

const HomeElement = () =>
	isFeatureSwitchEnabled('switch-stand') ? <HomeView /> : <HomeMenu />;

const homeLoader: LoaderFunction = (args) =>
	isFeatureSwitchEnabled('switch-stand')
		? allNewslettersLoader(args)
		: listLoader(args);

export const homeRoute: RouteObject = {
	path: '/',
	element: <Layout />,
	errorElement: <Layout outlet={<ErrorPage />} />,

	children: [
		{
			path: '',
			element: <HomeElement />,
			loader: homeLoader,
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
