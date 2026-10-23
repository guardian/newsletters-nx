import { css } from '@emotion/react';
import { baseSpacing } from '@guardian/stand';
import { ToastRegion } from '@guardian/stand/Toast';
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
import { newslettersRoutes } from './app/routes/newsletters';
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
	// Only registered when `switch-stand` is on.
	...newslettersRoutes,
	// Always registered; AllNewslettersView itself shows a message in place
	// of the table when the Stand design isn't enabled.
	allNewslettersRoute,
]);

/** Position all toasts under the top bar */
const toastStyles = css`
	position: fixed;
	position-anchor: --top-bar;
	top: anchor(bottom);
	margin-top: ${baseSpacing['20Px']};
`;

const root = ReactDOM.createRoot(
	document.getElementById('root') as HTMLElement,
);
root.render(
	<StrictMode>
		<DefaultStyles>
			<ThemeProvider theme={appTheme}>
				<RouterProvider router={router} />
				<ToastRegion
					toastProps={{
						cssOverrides: toastStyles,
					}}
				/>
			</ThemeProvider>
		</DefaultStyles>
	</StrictMode>,
);
