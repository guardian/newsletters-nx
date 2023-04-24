import { Container, Grid } from '@mui/material';

export const ContentWrapper = ({ children }: { children: React.ReactNode }) => (
	<Container maxWidth="lg">
		<Grid container spacing={2} rowSpacing={2} paddingY={2}>
			<Grid item container xs={12} display='flex' direction='column'>
				{children}
			</Grid>
		</Grid>
	</Container>
);
