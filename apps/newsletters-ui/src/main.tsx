import { palette } from '@guardian/source-foundations';
import { createTheme, ThemeProvider } from '@mui/material';
import { StrictMode } from 'react';
import * as ReactDOM from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { DefaultStyles } from './app/components/DefaultStyles';
import { draftRoute } from './app/routes/drafts';
import { homeRoute } from './app/routes/home';
import { newslettersRoute } from './app/routes/newsletters';

const theme = createTheme({
	palette: {
		primary: {
			light: palette.brand[800],
			// main: palette.brand[500],
			main: '#1C5689',
			dark: palette.brand[400],
			contrastText: palette.neutral[97],
		},
		secondary: {
			light: palette.news[800],
			main: palette.news[500],
			dark: palette.news[400],
			contrastText: palette.neutral[97],
		},
	},

	typography: {
		allVariants: {
			fontFamily: 'roboto, arial, sans-serif',
		},
		h1: {
			fontFamily: 'monospace, sans-serif',
			fontWeight: 700,
			letterSpacing: '.3rem',
			fontSize: '1.25rem',
			lineHeight: '1.6',
		},
		h2: {
			fontFamily: 'monospace, sans-serif',
			fontSize: '2.25rem',
		},
		h3: {
			fontSize: '1.75rem',
			fontWeight: 700,
			marginBottom: '.25rem',
		},
	},
	components: {
		MuiButton: {
			defaultProps: {
				sx: { borderRadius: 0 },
			},
		},
	},
});

const router = createBrowserRouter([homeRoute, newslettersRoute, draftRoute]);

const root = ReactDOM.createRoot(
	document.getElementById('root') as HTMLElement,
);
root.render(
	<StrictMode>
		<DefaultStyles>
			<ThemeProvider theme={theme}>
				<RouterProvider router={router} />
			</ThemeProvider>
		</DefaultStyles>
	</StrictMode>,
);
