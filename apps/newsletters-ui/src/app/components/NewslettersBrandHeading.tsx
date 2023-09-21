import MailOutlineIcon from '@mui/icons-material/MailOutline';
import type { TypographyProps } from '@mui/material';
import { Box, Typography } from '@mui/material';
import type { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';

const titleSx: TypographyProps['sx'] = {
	mr: 2,
	display: 'flex',
	color: 'inherit',
	textDecoration: 'none',
	fontSize: { xs: '1.5rem', md: '1.25rem' },
	lineHeight: { xs: '1.334', md: '1.6' },
};

const LinkWrap = ({ children }: { children: ReactNode }) => {
	const navigate = useNavigate();
	return (
		<Box
			role={'link'}
			onClick={() => navigate('/')}
			sx={{
				cursor: 'pointer',
				flexGrow: {
					xs: 1,
					md: 0,
				},
			}}
		>
			{children}
		</Box>
	);
};

export const NewslettersBrandHeading = () => {
	return (
		<>
			<MailOutlineIcon sx={{ display: 'flex', mr: 1 }} />
			<LinkWrap>
				<Typography variant="h1" noWrap component="a" sx={titleSx}>
					Newsletters
				</Typography>
			</LinkWrap>
		</>
	);
};
