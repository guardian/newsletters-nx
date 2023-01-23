import { StrictMode } from 'react';
import * as ReactDOM from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { homeRoute } from './app/routes/home';

const router = createBrowserRouter([homeRoute]);

const root = ReactDOM.createRoot(
	document.getElementById('root') as HTMLElement,
);
root.render(
	<StrictMode>
		<RouterProvider router={router} />
	</StrictMode>,
);
