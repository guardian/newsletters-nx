import type { RouteObject } from 'react-router-dom';
import { Api } from '../components/Api';
import { ButtonContainer } from '../components/ButtonContainer';
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

here is some random markdown text
			`}
					stepName="test step"
					wizardButtons={[
						{
							label: 'Proceed',
							buttonType: 'green',
							onClick: () => {
								console.log('proceed button');
							},
						},
						{
							label: 'Danger',
							buttonType: 'red',
							onClick: () => {
								console.log('danger button');
							},
						},
					]}
				/>
			),
		},
	],
};
