import type { RouteObject } from 'react-router-dom';
import { Api } from '../components/Api';
import { ButtonContainer } from '../components/ButtonContainer';
import { MarkdownView } from '../components/MarkdownView';
import { Wizard } from '../components/Wizard';
import { ErrorPage } from '../ErrorPage';
import { Layout } from '../Layout';

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
			path: 'markdowntest/',
			element: (
				<Wizard
					markdown={`
# hello world

here is some random text
			`}
					wizardButtons={[
						{ label: 'Cancel', onClick: () => { console.log('cancel button')} },
						{ label: 'Proceed', onClick: () => { console.log('proceed button')} },
					]}
				/>
			),
		},
	],
};
