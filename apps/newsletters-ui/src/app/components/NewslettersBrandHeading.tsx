import MailOutlineIcon from '@mui/icons-material/MailOutline';
import type { TypographyProps } from '@mui/material';
import { Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';

interface Props {
	mobile: boolean;
}

export const NewslettersBrandHeading = ({ mobile }: Props) => {
	const navigate = useNavigate();

	const titleSx: TypographyProps['sx'] = mobile
		? {
				mr: 2,
				display: { xs: 'flex', md: 'none' },
				color: 'inherit',
				textDecoration: 'none',
				fontSize: '1.5rem',
				lineHeight: '1.334',
		  }
		: {
				mr: 2,
				display: { xs: 'none', md: 'flex' },
				color: 'inherit',
				textDecoration: 'none',
		  };

	const iconSx = mobile
		? {
				display: { xs: 'flex', md: 'none' },
				mr: 1,
		  }
		: {
				display: { xs: 'none', md: 'flex' },
				mr: 1,
		  };

	return (
		<>
			<MailOutlineIcon sx={iconSx} />
			<div
				role={'link'}
				onClick={() => navigate('/')}
				style={{
					cursor: 'pointer',
					flexGrow: mobile ? 1 : undefined,
				}}
			>
				<Typography variant="h1" noWrap component="a" sx={titleSx}>
					Newsletters
				</Typography>
			</div>
		</>
	);
};
