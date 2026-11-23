import type { RouteObject } from 'react-router-dom';
import { Navigate, useLocation } from 'react-router-dom';
import { NewsletterDetailPageView } from '../components/views/NewsletterDetailPageView';
import { NewsletterLayoutView } from '../components/views/NewsletterLayoutView';
import { ErrorPage } from '../ErrorPage';
import {
	checkFeatureSwitchURLParams,
	isFeatureSwitchEnabled,
} from '../featureSwitches';
import { Layout } from '../Layout';
import { newsletterLayoutLoader } from '../loaders/newsletter-layout';
import { detailLoader } from '../loaders/newsletters';

checkFeatureSwitchURLParams();

// Keep any `#panel` in the address, so `/newsletters/<id>#integrations` still
// opens at that panel after redirecting to the details page.
const RedirectToDetails = () => {
	const { search, hash } = useLocation();
	return <Navigate to={{ pathname: 'details', search, hash }} replace />;
};

// Only registered when `switch-legacy` is off. `/launched/:id` redirects here
// for those users.
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
					element: <RedirectToDetails />,
				},
				{
					path: 'details',
					element: <NewsletterDetailPageView />,
					loader: detailLoader,
				},
				{
					path: 'layout',
					element: <NewsletterLayoutView />,
					loader: newsletterLayoutLoader,
				},
				{
					path: 'layout/edit',
					element: <NewsletterLayoutView editing />,
					loader: newsletterLayoutLoader,
				},
			],
		},
	],
};

export const newslettersRoutes: RouteObject[] = isFeatureSwitchEnabled(
	'switch-legacy',
)
	? []
	: [newslettersRoute];
