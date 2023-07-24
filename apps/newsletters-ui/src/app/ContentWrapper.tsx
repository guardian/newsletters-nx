import type { ContainerProps } from '@mui/material';
import { Container, Grid } from '@mui/material';

export const ContentWrapper = ({
	children,
	maxWidth = 'lg',
}: {
	children: React.ReactNode;
	maxWidth?: ContainerProps['maxWidth'];
}) => (
	<Container maxWidth={maxWidth}>
		<Grid container spacing={2} rowSpacing={2} paddingY={2}>
			<Grid item container xs={12} display="flex" direction="column">
				{children}
			</Grid>
		</Grid>
	</Container>
);
