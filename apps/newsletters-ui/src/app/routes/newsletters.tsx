import type { RouteObject } from 'react-router-dom';
import { WizardContainer } from '../components/WizardContainer';
import { ErrorPage } from '../ErrorPage';
import { Layout } from '../Layout';

export const newslettersRoute: RouteObject = {
	path: '/newsletters',
	element: <Layout />,
	errorElement: <ErrorPage />,
	children: [
		{
			path: 'newsletter-data/:listId',
			element: <WizardContainer wizardId="NEWSLETTER_DATA" />,
		},
		{
			path: 'newsletter-data-rendering/:listId',
			element: <WizardContainer wizardId="RENDERING_OPTIONS" />,
		},
		{
			path: 'newsletter-data',
			element: <WizardContainer wizardId="NEWSLETTER_DATA" />,
		},
		{
			path: 'launch-newsletter/:listId',
			element: <WizardContainer wizardId="LAUNCH_NEWSLETTER" />,
		},
		{
			path: 'launch-newsletter',
			element: <WizardContainer wizardId="LAUNCH_NEWSLETTER" />,
		},
	],
};
