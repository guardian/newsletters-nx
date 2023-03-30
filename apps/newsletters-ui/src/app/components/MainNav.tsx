import { css } from '@emotion/react';
import {
	neutral,
	space,
	textSansObjectStyles,
} from '@guardian/source-foundations';
import { Link } from 'react-router-dom';

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

const navStyle = css`
	display: flex;
	padding: ${space[2]}px 0;
	flex-wrap: wrap;

	a {
		${textSansObjectStyles.medium({ fontWeight: 'light' })};
		flex-wrap: nowrap;
		flex-basis: 220px;
		margin-right: ${space[2]}px;
		margin-bottom: ${space[2]}px;
		padding: ${space[1]}px;
		background-color: ${neutral[97]};
		color: ${neutral[7]};
		text-decoration: none;
		text-align: center;

		&.current {
			${textSansObjectStyles.medium({ fontWeight: 'bold' })};
			background-color: ${neutral[7]};
			color: ${neutral[97]};
		}
	}
`;

export function MainNav({ pathname }: Props) {
	const getLinkClass = (linkPath: string): string | undefined => {
		if (linkPath === pathname) {
			return 'current';
		}
		return undefined;
	};

	return (
		<nav css={navStyle}>
			{navLinks.map((link) => (
				<Link
					key={link.path}
					to={link.path}
					className={getLinkClass(link.path)}
				>
					{link.label}
				</Link>
			))}
		</nav>
	);
}
