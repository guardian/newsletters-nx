import { Container } from '@mui/material';
import type { RouteObject } from 'react-router-dom';
import { useParams } from 'react-router-dom';
import { Api } from '../components/Api';
import { ButtonContainer } from '../components/ButtonContainer';
import { FormDemoView } from '../components/FormDemoView';
import { NewsletterCreateView } from '../components/views/NewsletterCreateView';
import { Wizard } from '../components/Wizard';
import type { WizardProps } from '../components/Wizard';
import { ErrorPage } from '../ErrorPage';
import { Layout } from '../Layout';
import { listLoader } from './loaders';

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
			path: '/',
			element: <ButtonContainer />,
		},
		{
			path: 'api/',
			element: <Api />,
		},
		{
			path: '/create',
			element: <NewsletterCreateView />,
			loader: listLoader,
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
	],
};
