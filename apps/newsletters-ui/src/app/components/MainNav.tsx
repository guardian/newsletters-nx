import CodeIcon from '@mui/icons-material/Code';
import MenuIcon from '@mui/icons-material/Menu';
import AppBar from '@mui/material/AppBar';
import type { AvatarProps } from '@mui/material/Avatar';
import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import IconButton from '@mui/material/IconButton';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Toolbar from '@mui/material/Toolbar';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import * as React from 'react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProfile } from '../hooks/user-hooks';
import { NewslettersBrandHeading } from './NewslettersBrandHeading';

interface Props {
	isOnCode: boolean;
	isOnLocal: boolean;
}

interface NavLink {
	path: string;
	label: string;
}

const navLinks: NavLink[] = [
	{ path: '/launched', label: 'Launched' },
	{ path: '/drafts', label: 'Drafts' },
	{ path: '/templates', label: 'Email Templates' },
	{ path: '/layouts', label: 'Layouts' },
];

const menuItemIsSelected = (path: string): boolean => {
	return window.location.pathname.startsWith(path);
};

const ToolBarIcon = (props: {
	tooltip: string;
	avatarProps: AvatarProps;
	children?: React.ReactNode;
}) => (
	<Box sx={{ flexGrow: 0, marginLeft: 2 }}>
		<Tooltip title={props.tooltip}>
			<IconButton sx={{ p: 0 }}>
				<Avatar {...props.avatarProps}>{props.children}</Avatar>
			</IconButton>
		</Tooltip>
	</Box>
);

const DesktopNavLinks = () => {
	const navigate = useNavigate();
	return (
		<Box sx={{ flexGrow: 1, display: { xs: 'none', md: 'flex' } }}>
			{navLinks.map(({ path, label }) => (
				<Button
					key={label}
					onClick={() => {
						navigate(path);
					}}
					sx={{
						my: 2,
						color: 'white',
						fontWeight: menuItemIsSelected(path) ? 'bold' : 'normal',
						display: 'block',
						borderBottomStyle: menuItemIsSelected(path) ? 'solid' : 'none',
						borderBottomWidth: '2px',
						borderRadius: '0',
					}}
				>
					{label}
				</Button>
			))}
		</Box>
	);
};

const MobileBurgerNav = () => {
	const [anchorElNav, setAnchorElNav] = useState<null | HTMLElement>(null);
	const navigate = useNavigate();
	const handleOpenNavMenu = (event: React.MouseEvent<HTMLElement>) => {
		setAnchorElNav(event.currentTarget);
	};

	const handleCloseNavMenu = () => {
		setAnchorElNav(null);
	};

	return (
		<Box sx={{ display: { xs: 'flex', md: 'none' } }}>
			<IconButton
				size="large"
				aria-label="account of current user"
				aria-controls="menu-appbar"
				aria-haspopup="true"
				onClick={handleOpenNavMenu}
				color="inherit"
			>
				<MenuIcon />
			</IconButton>
			<Menu
				id="menu-appbar"
				anchorEl={anchorElNav}
				anchorOrigin={{
					vertical: 'bottom',
					horizontal: 'left',
				}}
				keepMounted
				transformOrigin={{
					vertical: 'top',
					horizontal: 'left',
				}}
				open={Boolean(anchorElNav)}
				onClose={handleCloseNavMenu}
				sx={{
					display: { xs: 'block', md: 'none' },
				}}
			>
				{navLinks.map(({ path, label }) => (
					<MenuItem
						key={label}
						onClick={() => {
							navigate(path);
							handleCloseNavMenu();
						}}
						selected={menuItemIsSelected(path)}
					>
						<Typography textAlign="center">{label}</Typography>
					</MenuItem>
				))}
			</Menu>
		</Box>
	);
};

export function MainNav({ isOnCode }: Props) {
	const userProfile = useProfile();
	const userName = userProfile?.name ?? 'Logged in user';

	return (
		<AppBar position="fixed" component={'header'}>
			<Container maxWidth="xl">
				<Toolbar disableGutters>
					<MobileBurgerNav />
					<NewslettersBrandHeading />
					<DesktopNavLinks />

					{isOnCode && (
						<ToolBarIcon
							tooltip="This is the test version of the newsletters tool - changes will not impact https://www.theguardian.com/"
							avatarProps={{
								sx: { bgcolor: 'secondary.dark' },
							}}
						>
							<CodeIcon />
						</ToolBarIcon>
					)}

					<ToolBarIcon
						tooltip={userName}
						avatarProps={{
							alt: userName,
							src: userProfile?.picture,
						}}
					/>
				</Toolbar>
			</Container>
		</AppBar>
	);
}
