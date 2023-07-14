import { palette } from '@guardian/source-foundations';
import { createTheme } from '@mui/material';

export const appTheme = createTheme({
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
			main: palette.news[400],
			dark: palette.news[300],
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
			fontSize: '2rem',
			marginTop: '1rem',
			marginBottom: '1.5rem',
			borderBottomWidth: 1,
			borderBottomColor: 'primary.dark',
			borderBottomStyle: 'solid',
		},
		h3: {
			fontSize: '1.5rem',
			marginBottom: '.25rem',
			marginTop: '1.5rem',
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
