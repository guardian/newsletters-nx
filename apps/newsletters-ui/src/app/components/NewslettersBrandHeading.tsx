import MailOutlineIcon from '@mui/icons-material/MailOutline';
import { Typography } from '@mui/material';
import { NavigateButton } from './NavigateButton';

export const NewslettersBrandHeading = () => {
	return (
		<NavigateButton
			href="/"
			sx={{
				cursor: 'pointer',
				margin: 0,
				flexGrow: {
					xs: 1,
					md: 0,
				},
				color: 'inherit',
				textDecoration: 'none',
				textTransform: 'none',
				padding: 0,
				minWidth: 'unset',
			}}
		>
			<MailOutlineIcon sx={{ display: 'flex', mr: 1 }} />
			<Typography
				variant="h1"
				noWrap
				sx={{
					margin: 0,
					mr: 2,
					display: 'flex',
					fontSize: { xs: '1.5rem', md: '1.25rem' },
					lineHeight: { xs: '1.334', md: '1.6' },
				}}
			>
				Newsletters
			</Typography>
		</NavigateButton>
	);
};
