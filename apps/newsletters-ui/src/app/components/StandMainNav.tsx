import { baseColors, semanticColors, semanticSizing } from '@guardian/stand';
import { Avatar as StandAvatar } from '@guardian/stand/avatar';
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
	'background-color': baseColors.cyan[200],
	'border-top': `${semanticSizing.border.default} solid ${semanticColors.border.strong}`,
	'border-right': `${semanticSizing.border.default} solid ${semanticColors.border.strong}`,
	'border-bottom': `${semanticSizing.border.default} solid ${semanticColors.border.weak}`,
	'border-left': `${semanticSizing.border.default} solid ${semanticColors.border.strong}`,

	collapsedNavMenu: {
		button: {
			color: semanticColors.text['stronger-inverse'],
			active: { 'background-color': baseColors.cyan[100] },
			hovered: { 'background-color': baseColors.cyan[100] },
		},
		popover: {
			'background-color': baseColors.cyan[200],
		},
	},
	ToolName: {
		color: semanticColors.text['stronger-inverse'],
	},
	Navigation: {
		shared: {
			_menuOpen: {
				selected: {
					'background-color': baseColors.cyan[100],
				},
			},
		},
		selected: {
			color: semanticColors.text['stronger-inverse'],
			'border-bottom': `${semanticSizing.border['extra-wide']} solid ${semanticColors.border['selected-inverse']}`,
		},
		unselected: {
			color: semanticColors.text['stronger-inverse'],
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
				favicon={{
					icon: 'email',
					theme: {
						color: {
							background: baseColors.cyan[400],
							text: semanticColors.text['stronger-inverse'],
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
