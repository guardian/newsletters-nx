import type { RouteObject } from 'react-router-dom';
import { Navigate, useLocation, useParams } from 'react-router-dom';
import { NewsletterDetailView } from '../components/views/NewsletterDetailView';
import { NewsletterEditView } from '../components/views/NewsletterEditView';
import { NewsletterJsonEditView } from '../components/views/NewsletterJsonEditView';
import { NewslettersListView } from '../components/views/NewslettersListView';
import { PreviewView } from '../components/views/PreviewView';
import { RenderingOptionsView } from '../components/views/RenderingOptionsView';
import { ErrorPage } from '../ErrorPage';
import {
	checkFeatureSwitchURLParams,
	isFeatureSwitchEnabled,
} from '../featureSwitches';
import { Layout } from '../Layout';
import { newsletterDetailPath } from '../lib/newsletter-detail-path';
import { detailLoader, listLoader } from '../loaders/newsletters';

checkFeatureSwitchURLParams();

const isLegacy = isFeatureSwitchEnabled('switch-legacy');

// Stand users see the new details page; Legacy users keep NewsletterDetailView.
const RedirectToNewDetails = () => {
	const { id = '' } = useParams();
	const { search, hash } = useLocation();
	return (
		<Navigate
			to={{ pathname: newsletterDetailPath(id), search, hash }}
			replace
		/>
	);
};

export const launchedRoute: RouteObject = {
	path: '/launched',
	element: <Layout />,
	errorElement: <ErrorPage />,
	children: [
		{
			path: '',
			element: <NewslettersListView />,
			loader: listLoader,
		},
		{
			path: ':id',
			element: isLegacy ? <NewsletterDetailView /> : <RedirectToNewDetails />,
			loader: isLegacy ? detailLoader : undefined,
		},
		{
			path: 'edit/:id',
			element: <NewsletterEditView />,
			loader: detailLoader,
		},
		{
			path: 'rendering-options/:id',
			element: <RenderingOptionsView />,
			loader: detailLoader,
		},
		{
			path: 'edit-json/:id',
			element: <NewsletterJsonEditView />,
			loader: detailLoader,
		},
		{
			path: 'preview/:id',
			element: <PreviewView />,
			loader: detailLoader,
		},
	],
};
