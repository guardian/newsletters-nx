import type { ReactJSXElement } from '@emotion/react/types/jsx-namespace';
import { Container } from '@mui/material';
import type { RouteObject } from 'react-router-dom';
import { useParams } from 'react-router-dom';
import { FormDemoView } from '../components/FormDemoView';
import { Wizard } from '../components/Wizard';
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
			<Wizard id={listId} />
		</Container>
	);
}
