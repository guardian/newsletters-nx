import type { RouteObject } from 'react-router-dom';
import {
	Navigate,
	useLoaderData,
	useLocation,
	useParams,
} from 'react-router-dom';
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
import {
	newsletterLayoutDestination,
	newsletterLayoutPath,
} from '../lib/newsletter-layout';
import type { NewsletterLayoutData } from '../loaders/newsletter-layout';
import { newsletterLayoutLoader } from '../loaders/newsletter-layout';
import { detailLoader, listLoader } from '../loaders/newsletters';

checkFeatureSwitchURLParams();

const isLegacy = isFeatureSwitchEnabled('switch-legacy');

// Stand users see the new details page; Legacy users keep NewsletterDetailView.
const RedirectToNewDetails = () => {
	const { id = '' } = useParams();
	const { search, hash } = useLocation();
	return (
		<Navigate
			to={{ pathname: `/newsletters/${id}/details`, search, hash }}
			replace
		/>
	);
};

const RedirectToStandLayout = ({ edit = false }: { edit?: boolean }) => {
	const { newsletter, canEdit } = useLoaderData<NewsletterLayoutData>();
	const { id = '' } = useParams();
	const { search, hash } = useLocation();
	const pathname = newsletter
		? newsletterLayoutDestination(newsletter, edit && canEdit)
		: newsletterLayoutPath(id, 'details');
	return <Navigate to={{ pathname, search, hash }} replace />;
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
			element: isLegacy ? (
				<RenderingOptionsView />
			) : (
				<RedirectToStandLayout edit />
			),
			loader: isLegacy ? detailLoader : newsletterLayoutLoader,
		},
		{
			path: 'edit-json/:id',
			element: <NewsletterJsonEditView />,
			loader: detailLoader,
		},
		{
			path: 'preview/:id',
			element: isLegacy ? <PreviewView /> : <RedirectToStandLayout />,
			loader: isLegacy ? detailLoader : newsletterLayoutLoader,
		},
	],
};
