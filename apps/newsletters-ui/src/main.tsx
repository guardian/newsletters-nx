import { StrictMode } from 'react';
import * as ReactDOM from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { DefaultStyles } from './app/components/DefaultStyles';
import { homeRoute } from './app/routes/home';
import { newsletterRoute } from './app/routes/newsletter';

const router = createBrowserRouter([homeRoute, newsletterRoute]);

const root = ReactDOM.createRoot(
	document.getElementById('root') as HTMLElement,
);
root.render(
	<StrictMode>
		<DefaultStyles>
			<RouterProvider router={router} />
		</DefaultStyles>
	</StrictMode>,
);
