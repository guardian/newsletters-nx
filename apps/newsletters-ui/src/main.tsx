import { ThemeProvider } from '@mui/material';
import { StrictMode } from 'react';
import * as ReactDOM from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { DefaultStyles } from './app/components/DefaultStyles';
import { draftRoute } from './app/routes/drafts';
import { homeRoute } from './app/routes/home';
import { launchedRoute } from './app/routes/launched';
import { appTheme } from './app-theme';

const router = createBrowserRouter([homeRoute, draftRoute, launchedRoute]);

const root = ReactDOM.createRoot(
	document.getElementById('root') as HTMLElement,
);
root.render(
	<StrictMode>
		<DefaultStyles>
			<ThemeProvider theme={appTheme}>
				<RouterProvider router={router} />
			</ThemeProvider>
		</DefaultStyles>
	</StrictMode>,
);
