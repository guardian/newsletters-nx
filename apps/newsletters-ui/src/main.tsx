import { ThemeProvider } from '@mui/material';
import { StrictMode } from 'react';
import * as ReactDOM from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { DefaultStyles } from './app/components/DefaultStyles';
import { allNewslettersRoute } from './app/routes/all-newsletters';
import { draftRoute } from './app/routes/drafts';
import { homeRoute } from './app/routes/home';
import { launchedRoute } from './app/routes/launched';
import { layoutsRoute } from './app/routes/layouts';
import { appTheme } from './app-theme';
import { addGuardianFonts } from './fonts';
import '@guardian/stand/util/reset.css';
import '@guardian/stand/fonts/MaterialSymbolsOutlined.css';
import '@guardian/stand/fonts/OpenSans.css';

addGuardianFonts(document);

const router = createBrowserRouter([
	homeRoute,
	draftRoute,
	launchedRoute,
	layoutsRoute,
	// Always registered; AllNewslettersView itself shows a message in place
	// of the table when the Stand design isn't enabled.
	allNewslettersRoute,
]);

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
