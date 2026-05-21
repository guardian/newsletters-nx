import { baseColors, semanticColors, semanticSizing } from '@guardian/stand';
import { Avatar as StandAvatar } from '@guardian/stand/Avatar';
import type { TopBarTheme } from '@guardian/stand/TopBar';
import {
	TopBar,
	TopBarContainerLeft,
	TopBarNavigation,
	TopBarToolName,
} from '@guardian/stand/TopBar';
import { useLocation } from 'react-router-dom';
import { useProfile } from '../hooks/user-hooks';
import '@guardian/stand/util/reset.css';

interface NavLink {
	path: string;
	label: string;
}

const navLinks: NavLink[] = [
	{ path: '/launched', label: 'Launched Newsletters' },
	{ path: '/drafts', label: 'Draft Newsletters' },
	{ path: '/templates', label: 'Email Templates' },
	{ path: '/layouts', label: 'All Newsletter Page Layouts' },
	{
		path: '/drafts/newsletter-data',
		label: 'Create New Newsletter',
	},
];

const menuItemIsSelected = (path: string, pathname: string): boolean => {
	if (!pathname.startsWith(path)) {
		return false;
	}
	return !navLinks.some(
		(link) =>
			link.path !== path &&
			pathname.startsWith(link.path) &&
			link.path.length > path.length,
	);
};

const topBarTheme: TopBarTheme = {
	backgroundColor: baseColors.cyan[200],
	borderTop: `${semanticSizing.border.default} solid ${semanticColors.border.strong}`,
	borderRight: `${semanticSizing.border.default} solid ${semanticColors.border.strong}`,
	borderBottom: `${semanticSizing.border.default} solid ${semanticColors.border.weak}`,
	borderLeft: `${semanticSizing.border.default} solid ${semanticColors.border.strong}`,

	collapsedNavMenu: {
		button: {
			color: semanticColors.text.strongerInverse,
			active: { backgroundColor: baseColors.cyan[100] },
			hovered: { backgroundColor: baseColors.cyan[100] },
		},
		popover: {
			backgroundColor: baseColors.cyan[200],
		},
	},
	toolName: {
		color: semanticColors.text.strongerInverse,
	},
	navigation: {
		shared: {
			_menuOpen: {
				selected: {
					backgroundColor: baseColors.cyan[100],
				},
			},
		},
		selected: {
			color: semanticColors.text.strongerInverse,
			borderBottom: `${semanticSizing.border.extraWide} solid ${semanticColors.border.selectedInverse}`,
		},
		unselected: {
			color: semanticColors.text.strongerInverse,
		},
	},
};

export function StandMainNav() {
	const userProfile = useProfile();
	const userName = userProfile?.name ?? 'Logged in user';
	const { pathname } = useLocation();

	return (
		<TopBar theme={topBarTheme}>
			<TopBarToolName
				name="Newsletter"
				href="/"
				collapsedHoverText={'Back'}
				hoverText="Back to dashboard"
				favicon={{
					icon: 'email',
					theme: {
						color: {
							background: baseColors.cyan[400],
							text: semanticColors.text.strongerInverse,
						},
					},
				}}
			/>
			<TopBarContainerLeft>
				{navLinks.map(({ path, label }) => (
					<TopBarNavigation
						text={label}
						href={path}
						isSelected={menuItemIsSelected(path, pathname)}
						key={label}
					/>
				))}
			</TopBarContainerLeft>
			<StandAvatar
				src={userProfile?.picture ?? ''}
				alt={userName}
				initials={userName.charAt(0)}
				size="sm"
			/>
		</TopBar>
	);
}
