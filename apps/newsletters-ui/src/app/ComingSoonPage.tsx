import { Container, Grid } from '@mui/material';

export const ComingSoon = () => (
	<Container maxWidth="lg">
		<Grid container spacing={3} rowSpacing={6} paddingY={2}>
			<Grid item xs={6} sm={4} display={'flex'}>
				Coming soon...
			</Grid>
		</Grid>
	</Container>
);
