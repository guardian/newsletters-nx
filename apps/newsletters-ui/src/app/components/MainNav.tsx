import CodeIcon from '@mui/icons-material/Code';
import MailOutlineIcon from '@mui/icons-material/MailOutline';
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

export function MainNav({ isOnCode }: Props) {
	const [anchorElNav, setAnchorElNav] = useState<null | HTMLElement>(null);
	const navigate = useNavigate();
	const userProfile = useProfile();
	const userName = userProfile?.name ?? 'Logged in user';

	const handleOpenNavMenu = (event: React.MouseEvent<HTMLElement>) => {
		setAnchorElNav(event.currentTarget);
	};

	const handleCloseNavMenu = () => {
		setAnchorElNav(null);
	};

	return (
		<AppBar position="fixed" component={'header'}>
			<Container maxWidth="xl">
				<Toolbar disableGutters>
					<MailOutlineIcon
						sx={{ display: { xs: 'none', md: 'flex' }, mr: 1 }}
					/>
					<div
						role={'link'}
						onClick={() => navigate('/')}
						style={{
								cursor: 'pointer',
							}}
					>
						<Typography
							variant="h1"
							noWrap
							component="a"
							sx={{
								mr: 2,
								display: { xs: 'none', md: 'flex' },
								color: 'inherit',
								textDecoration: 'none',
							}}
						>
							Newsletters
						</Typography>
					</div>
					<Box sx={{ flexGrow: 1, display: { xs: 'flex', md: 'none' } }}>
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
					<MailOutlineIcon
						sx={{ display: { xs: 'flex', md: 'none' }, mr: 1 }}
					/>
					<Typography
						variant="h1"
						noWrap
						component="a"
						href=""
						sx={{
							mr: 2,
							display: { xs: 'flex', md: 'none' },
							flexGrow: 1,
							color: 'inherit',
							textDecoration: 'none',
							fontSize: '1.5rem',
							lineHeight: '1.334',
						}}
					>
						Newsletters
					</Typography>
					<Box sx={{ flexGrow: 1, display: { xs: 'none', md: 'flex' } }}>
						{navLinks.map(({ path, label }) => (
							<Button
								key={label}
								onClick={() => {
									navigate(path);
								}}
								sx={{
									my: 2,
									color: menuItemIsSelected(path) ? 'grey' : 'white',
									display: 'block',
								}}
							>
								{label}
							</Button>
						))}
					</Box>

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
