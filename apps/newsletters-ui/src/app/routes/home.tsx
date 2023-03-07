import { Container } from '@mui/material';
import type { RouteObject } from 'react-router-dom';
import { redirect, useParams } from 'react-router-dom';
import { FormDemoView } from '../components/FormDemoView';
import { HealthCheck } from '../components/HealthCheck';
import { Wizard } from '../components/Wizard';
import type { WizardProps } from '../components/Wizard';
import { ErrorPage } from '../ErrorPage';
import { Layout } from '../Layout';

const WizardLink: React.FC<WizardProps> = ({ wizardId, id }: WizardProps) => {
	const { listId } = useParams();
	return (
		<Container>
			<Wizard wizardId={wizardId} id={listId} />
		</Container>
	);
};

export const homeRoute: RouteObject = {
	path: '/',
	element: <Layout />,
	errorElement: <ErrorPage />,
	children: [
		{
			path: '',
			action: () => redirect('/newsletters'),
		},
		{
			path: 'api/',
			element: <HealthCheck />,
		},
		{
			path: 'templates',
			element: <span>Coming soon...</span>,
		},
		{
			path: '/test-forms',
			element: <FormDemoView />,
		},
		{
			path: 'newsletter-data/:listId',
			element: <WizardLink wizardId="NEWSLETTER_DATA" />,
		},
		{
			path: 'newsletter-data',
			element: <WizardLink wizardId="NEWSLETTER_DATA" />,
		},
		{
			path: 'launch-newsletter',
			element: <WizardLink wizardId="LAUNCH_NEWSLETTER" />,
		},
		{
			path: 'thrashers',
			element: <span>Coming soon...</span>,
		},
		{ path: '*', element: <ErrorPage /> },
	],
};
