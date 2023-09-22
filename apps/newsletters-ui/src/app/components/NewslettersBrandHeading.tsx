import { palette, space } from '@guardian/source-foundations';
import { Box, Typography } from '@mui/material';
import { NavigateButton } from './NavigateButton';

export const NewslettersBrandHeading = () => {
	return (
		<NavigateButton
			href="/"
			sx={{
				flexGrow: {
					xs: 1,
					md: 0,
				},
				color: 'inherit',
				textDecoration: 'none',
				textTransform: 'none',
				minWidth: 'unset',
				padding: 0,
				mr: 2,
			}}
		>
			<Box
				sx={{
					padding: `1px ${space[1]}px`,
					border: `1px dashed ${palette.neutral[100]}`,
				}}
			>
				<Typography variant="h1">Newsletters</Typography>
			</Box>
		</NavigateButton>
	);
};
