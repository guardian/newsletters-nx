import type { RouteObject } from 'react-router-dom';
import { DraftDetailPageView } from '../components/views/DraftDetailPageView';
import { DraftDetailView } from '../components/views/DraftDetailView';
import { DraftListView } from '../components/views/DraftListView';
import { WizardContainer } from '../components/WizardContainer';
import { ErrorPage } from '../ErrorPage';
import {
	checkFeatureSwitchURLParams,
	isFeatureSwitchEnabled,
} from '../featureSwitches';
import { Layout } from '../Layout';
import { draftDetailLoader, draftListLoader } from '../loaders/newsletters';
import { standWizardRoutes } from './stand-wizard';

checkFeatureSwitchURLParams();
const useLegacy = isFeatureSwitchEnabled('switch-legacy');

const legacyWizardRoutes = [
	{
		path: 'newsletter-data/:listId?',
		element: <WizardContainer wizardId="NEWSLETTER_DATA" />,
	},
	{
		path: 'newsletter-data-rendering/:listId',
		element: <WizardContainer wizardId="RENDERING_OPTIONS" />,
	},
	{
		path: 'launch-newsletter/:listId?',
		element: <WizardContainer wizardId="LAUNCH_NEWSLETTER" />,
	},
];

export const draftRoute: RouteObject = {
	path: '/drafts',
	element: <Layout />,
	errorElement: <ErrorPage />,
	children: [
		{
			path: '',
			element: <DraftListView />,
			loader: draftListLoader,
		},
		{
			path: ':id',
			element: useLegacy ? <DraftDetailView /> : <DraftDetailPageView />,
			loader: draftDetailLoader,
		},
		...(useLegacy ? legacyWizardRoutes : standWizardRoutes),
	],
};
