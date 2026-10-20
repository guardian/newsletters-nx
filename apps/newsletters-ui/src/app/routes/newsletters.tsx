import type { RouteObject } from 'react-router-dom';
import { Navigate } from 'react-router-dom';
import { LaunchedNewsletterPageView } from '../components/views/LaunchedNewsletterPageView';
import { ErrorPage } from '../ErrorPage';
import {
	checkFeatureSwitchURLParams,
	isFeatureSwitchEnabled,
} from '../featureSwitches';
import { Layout } from '../Layout';
import { detailLoader } from '../loaders/newsletters';

checkFeatureSwitchURLParams();

// Nothing links here until switch-over. The route is only registered when
// `switch-stand` is on, so other users never reach it.
export const newslettersRoute: RouteObject = {
	path: '/newsletters',
	element: <Layout compactTopPadding />,
	errorElement: <ErrorPage />,
	children: [
		{
			path: ':id',
			children: [
				{
					index: true,
					element: <Navigate to="details" replace />,
				},
				{
					path: 'details',
					element: <LaunchedNewsletterPageView />,
					loader: detailLoader,
				},
			],
		},
	],
};

export const newslettersRoutes: RouteObject[] = isFeatureSwitchEnabled(
	'switch-stand',
)
	? [newslettersRoute]
	: [];
