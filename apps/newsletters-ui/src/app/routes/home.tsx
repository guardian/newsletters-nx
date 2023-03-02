import type { ReactJSXElement } from '@emotion/react/types/jsx-namespace';
import { Container } from '@mui/material';
import type { RouteObject } from 'react-router-dom';
import { useParams } from 'react-router-dom';
import { Api } from '../components/Api';
import { ButtonContainer } from '../components/ButtonContainer';
import { FormDemoView } from '../components/FormDemoView';
import { NewsletterCreateView } from '../components/views/NewsletterCreateView';
import { Wizard } from '../components/Wizard';
import { ErrorPage } from '../ErrorPage';
import { Layout } from '../Layout';
import { listLoader } from './loaders';

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
			path: 'wizard/:listId',
			element: <WizardLink />,
		},
		{
			path: 'wizard',
			element: <WizardLink />,
		},
	],
};

function WizardLink(): ReactJSXElement {
	const { listId } = useParams();
	return (
		<Container>
			<Wizard wizardId={'NEWSLETTER_INFO'} id={listId} />
		</Container>
	);
}
