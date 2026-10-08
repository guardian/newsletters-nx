import type { RouteObject } from 'react-router-dom';
import { EditLayoutJsonView } from '../components/views/EditLayoutJsonView';
import { EditLayoutView } from '../components/views/EditLayoutView';
import { LayoutMapView } from '../components/views/LayoutMapView';
import { LayoutView } from '../components/views/LayoutView';
import { StandLayoutMapView } from '../components/views/StandLayoutMapView';
import { ErrorPage } from '../ErrorPage';
import { isFeatureSwitchEnabled } from '../featureSwitches';
import { Layout } from '../Layout';
import { layoutLoader, mapLoader } from '../loaders/layouts';

const LayoutsMapElement = () =>
	isFeatureSwitchEnabled('switch-stand') ? (
		<StandLayoutMapView />
	) : (
		<LayoutMapView />
	);

export const layoutsRoute: RouteObject = {
	path: '/layouts',
	element: <Layout />,
	errorElement: <ErrorPage />,
	children: [
		{
			path: '',
			element: <LayoutsMapElement />,
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
