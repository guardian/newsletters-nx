import MailOutlineIcon from '@mui/icons-material/MailOutline';
import { Box, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';

export const NewslettersBrandHeading = () => {
	const navigate = useNavigate();

	return (
		<>
			<MailOutlineIcon sx={{ display: 'flex', mr: 1 }} />
			<Box
				role={'link'}
				onClick={(event) => {
					// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call -- is a sythetic pointer event
					event.preventDefault();
					navigate('/');
				}}
				sx={{
					cursor: 'pointer',
					margin: 0,
					flexGrow: {
						xs: 1,
						md: 0,
					},
					color: 'inherit',
					textDecoration: 'none',
				}}
				href="#"
				component={'a'}
			>
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
			</Box>
		</>
	);
};
