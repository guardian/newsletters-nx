import type { RouteObject } from 'react-router-dom';
import { DraftDetailView } from '../components/DraftDetailView';
import { DraftListView } from '../components/DraftListView';
import { ErrorPage } from '../ErrorPage';
import { Layout } from '../Layout';
import { draftDetailLoader, draftListLoader } from './loaders';

export const draftRoute: RouteObject = {
	path: '/drafts',
	element: <Layout />,
	errorElement: <ErrorPage />,
	children: [
		{
			path: '',
			element: <DraftListView />,
			loader: draftListLoader,
		},
		{
			path: ':id',
			element: <DraftDetailView />,
			loader: draftDetailLoader,
		},
	],
};
