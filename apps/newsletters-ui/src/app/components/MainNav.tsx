import { Button, ButtonGroup, Typography } from '@mui/material';
import { Container } from '@mui/system';
import { useNavigate } from 'react-router-dom';

interface Props {
	pathname: string;
}

interface NavLink {
	path: string;
	label: string;
}

const navLinks: NavLink[] = [
	{ path: '/', label: 'Home' },
	{ path: '/newsletters', label: 'Newsletters' },
	{ path: '/drafts', label: 'Drafts' },
	{ path: '/templates', label: 'Email Templates' },
	{ path: '/thrashers', label: 'Thrashers' },
];

export function MainNav({ pathname }: Props) {
	const navigate = useNavigate();
	const getButtonVariant = (linkPath: string): 'contained' | 'outlined' => {
		if (linkPath === pathname) {
			return 'contained';
		}
		return 'outlined';
	};

	return (
		<Container maxWidth="lg">
			<ButtonGroup component={'nav'}>
				{navLinks.map((link) => (
					<Button
						color="info"
						variant={getButtonVariant(link.path)}
						onClick={() => {
							navigate(link.path);
						}}
						key={link.path}
					>
						{link.label}
					</Button>
				))}
			</ButtonGroup>
			<Typography component={'h1'}>Have I Got Newsletters For You</Typography>
		</Container>
	);
}
