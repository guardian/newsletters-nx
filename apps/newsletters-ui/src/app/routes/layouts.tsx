import type { RouteObject } from 'react-router-dom';
import { LayoutMapView } from '../components/views/LayoutMapView';
import { LayoutView } from '../components/views/LayoutView';
import { ErrorPage } from '../ErrorPage';
import { Layout } from '../Layout';
import { layoutLoader, mapLoader } from '../loaders/layouts';
import { EditLayoutJsonView } from '../components/views/EditLayoutJsonView';
import { EditLayoutView } from '../components/views/EditLayoutView';

export const layoutsRoute: RouteObject = {
	path: '/layouts',
	element: <Layout />,
	errorElement: <ErrorPage />,
	children: [
		{
			path: '',
			element: <LayoutMapView />,
			loader: mapLoader,
		},

		{
			path: ':id',
			element: <LayoutView />,
			loader: layoutLoader,
		},
		{
			path: 'edit-json/:id',
			element: <EditLayoutJsonView />,
			loader: layoutLoader,
		},
		{
			path: 'edit/:id',
			element: <EditLayoutView />,
			loader: layoutLoader,
		},
	],
};
