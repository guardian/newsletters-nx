import type { RouteObject } from 'react-router-dom';
import { Link } from 'react-router-dom';
import { Api } from '../components/Api';
import { EmotionTest } from '../components/EmotionTest';
import { ErrorPage } from '../ErrorPage';
import { Layout } from '../Layout';


export const homeRoute: RouteObject = {
	path: '/',
	element: (
		<Layout>
			<Link to={`/`}>home</Link>
			<Link to={`/dark`}>dark theme</Link>
			<Link to={`/light`}>light theme</Link>
			<Link to={`/api`}>api</Link>
		</Layout>
	),
	errorElement: <ErrorPage />,
	children: [
		{
			path: '/',
			element: <p>Index route</p>,
		},
		{
			path: 'dark/',
			element: <EmotionTest theme="dark" />,
		},
		{
			path: 'light/',
			element: <EmotionTest theme="light" />,
		},
		{
			path: 'api/',
			element: <Api />,
		},
	],
};
