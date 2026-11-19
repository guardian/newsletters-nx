import type { RouteObject } from 'react-router-dom';
import { StandRedesignWizardContainer } from '../components/StandRedesignWizard';
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

checkFeatureSwitchURLParams();
const legacy = isFeatureSwitchEnabled('switch-legacy');

export const draftRoute: RouteObject = {
	path: '/drafts',
	element: <Layout />,
	errorElement: <ErrorPage />,
	children: [
		{ path: '', element: <DraftListView />, loader: draftListLoader },
		{
			path: ':id',
			element: legacy ? <DraftDetailView /> : <DraftDetailPageView />,
			loader: draftDetailLoader,
		},
		{
			path: legacy
				? 'newsletter-data/:listId'
				: 'newsletter-data/:listId/:stepSlug?',
			element: legacy ? (
				<WizardContainer wizardId="NEWSLETTER_DATA" />
			) : (
				<StandRedesignWizardContainer wizardId="NEWSLETTER_DATA_STAND_REDESIGN" />
			),
		},
		{
			path: 'newsletter-data-rendering/:listId',
			element: legacy ? (
				<WizardContainer wizardId="RENDERING_OPTIONS" />
			) : (
				<StandRedesignWizardContainer wizardId="RENDERING_OPTIONS" />
			),
		},
		{
			path: 'newsletter-data',
			element: legacy ? (
				<WizardContainer wizardId="NEWSLETTER_DATA" />
			) : (
				<StandRedesignWizardContainer wizardId="NEWSLETTER_DATA_STAND_REDESIGN" />
			),
		},
		{
			path: 'launch-newsletter/:listId',
			element: legacy ? (
				<WizardContainer wizardId="LAUNCH_NEWSLETTER" />
			) : (
				<StandRedesignWizardContainer wizardId="LAUNCH_NEWSLETTER" />
			),
		},
		{
			path: 'launch-newsletter',
			element: legacy ? (
				<WizardContainer wizardId="LAUNCH_NEWSLETTER" />
			) : (
				<StandRedesignWizardContainer wizardId="LAUNCH_NEWSLETTER" />
			),
		},
	],
};
