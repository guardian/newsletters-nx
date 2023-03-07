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
			path: 'wizard/:listId',
			element: <WizardContainer />,
		},
		{
			path: 'wizard',
			element: <WizardContainer />,
		},
	],
};
