import { ThemeProvider } from '@mui/material';
import { StrictMode } from 'react';
import * as ReactDOM from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { DefaultStyles } from './app/components/DefaultStyles';
import { checkFeatureSwitchURLParams } from './app/featureSwitches';
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

checkFeatureSwitchURLParams();

const router = createBrowserRouter([
	homeRoute,
	draftRoute,
	launchedRoute,
	layoutsRoute,
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
