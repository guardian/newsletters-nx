import type { RouteObject } from 'react-router-dom';
import { FormDemoView } from '../components/FormDemoView';
import { WizardContainer } from '../components/WizardContainer';
import { ErrorPage } from '../ErrorPage';
import { Layout } from '../Layout';

/** This is for work-in-progress routes  */
export const demoRoute: RouteObject = {
	path: '/demo',
	element: <Layout />,
	errorElement: <ErrorPage />,
	children: [
		{
			path: 'forms',
			element: <FormDemoView />,
		},
		{
			path: 'newsletter-data/:listId',
			element: <WizardContainer wizardId="NEWSLETTER_DATA" />,
		},
		{
			path: 'newsletter-data',
			element: <WizardContainer wizardId="NEWSLETTER_DATA" />,
		},
		{
			path: 'launch-newsletter',
			element: <WizardContainer wizardId="LAUNCH_NEWSLETTER" />,
		},
	],
};
