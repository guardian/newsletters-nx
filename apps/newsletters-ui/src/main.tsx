import { StrictMode } from 'react';
import * as ReactDOM from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { DefaultStyles } from './app/components/DefaultStyles';
import { demoRoute } from './app/routes/demo';
import { draftRoute } from './app/routes/drafts';
import { homeRoute } from './app/routes/home';
import { newslettersRoute } from './app/routes/newsletters';

const router = createBrowserRouter([
	homeRoute,
	newslettersRoute,
	draftRoute,
	demoRoute,
]);

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
