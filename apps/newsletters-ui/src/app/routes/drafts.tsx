import type { RouteObject } from 'react-router-dom';
import { DraftDetailView } from '../components/views/DraftDetailView';
import { DraftListView } from '../components/views/DraftListView';
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
