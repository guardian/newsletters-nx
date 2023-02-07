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
	{ path: '/', label: 'home' },
	{ path: '/api', label: 'api test page' },
	{ path: '/newsletters/', label: 'View Current Newsletters' },
];

const navStyle = css`
	display: flex;
	padding: ${space[2]}px 0;
	flex-wrap: wrap;

	a {
		${textSansObjectStyles.medium({ fontWeight: 'light' })};
		min-width: 200px;
		margin-right: ${space[2]}px;
		padding: ${space[1]}px;
		background-color: ${neutral[97]};
		color: ${neutral[7]};
		text-decoration: none;

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
				<Link to={link.path} className={getLinkClass(link.path)}>
					{link.label}
				</Link>
			))}
		</nav>
	);
}
