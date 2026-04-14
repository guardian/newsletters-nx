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
		<Grid container spacing={2} rowSpacing={2} sx={{ paddingY: 3 }}>
			<Grid
				container
				sx={{ display: 'flex', flexDirection: 'column' }}
				size={12}
			>
				{children}
			</Grid>
		</Grid>
	</Container>
);
