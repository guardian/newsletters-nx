import type { RouteObject } from 'react-router-dom';
import { StandRedesignWizardContainer } from '../components/StandRedesignWizard';
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
			element: <DraftDetailView />,
			loader: draftDetailLoader,
		},
		{
			path: 'newsletter-data/:listId',
			element: isFeatureSwitchEnabled('switch-stand') ? (
				<StandRedesignWizardContainer wizardId="NEWSLETTER_DATA_STAND_REDESIGN" />
			) : (
				<WizardContainer wizardId="NEWSLETTER_DATA" />
			),
		},
		{
			path: 'newsletter-data-rendering/:listId',
			element: isFeatureSwitchEnabled('switch-stand') ? (
				<StandRedesignWizardContainer wizardId="RENDERING_OPTIONS" />
			) : (
				<WizardContainer wizardId="RENDERING_OPTIONS" />
			),
		},
		{
			path: 'newsletter-data',
			element: isFeatureSwitchEnabled('switch-stand') ? (
				<StandRedesignWizardContainer wizardId="NEWSLETTER_DATA_STAND_REDESIGN" />
			) : (
				<WizardContainer wizardId="NEWSLETTER_DATA" />
			),
		},
		{
			path: 'launch-newsletter/:listId',
			element: isFeatureSwitchEnabled('switch-stand') ? (
				<StandRedesignWizardContainer wizardId="LAUNCH_NEWSLETTER" />
			) : (
				<WizardContainer wizardId="LAUNCH_NEWSLETTER" />
			),
		},
		{
			path: 'launch-newsletter',
			element: isFeatureSwitchEnabled('switch-stand') ? (
				<StandRedesignWizardContainer wizardId="LAUNCH_NEWSLETTER" />
			) : (
				<WizardContainer wizardId="LAUNCH_NEWSLETTER" />
			),
		},
	],
};
