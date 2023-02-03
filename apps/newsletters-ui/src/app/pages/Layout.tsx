import { css } from '@emotion/react';
import { brand, neutral, space } from '@guardian/source-foundations';
import type { ReactNode } from 'react';
import { Link, Outlet } from 'react-router-dom';

interface Props {
	children?: ReactNode;
}

const headerStyle = css`
	background-color: ${brand[400]};
	color: ${neutral[97]};
	nav a {
		margin-right: ${space[2]}px;
	}
`;

const linkStyle = css`
	color: ${neutral[97]};
`;

export function Layout({ children }: Props) {
	return (
		<>
			<header css={headerStyle}>
				<h1>Newsletters UI</h1>

				<nav>
					<Link css={linkStyle} to="/">
						Home
					</Link>
					<Link css={linkStyle} to="/newsletters">
						View Current Newsletters
					</Link>
				</nav>

				{children && <nav>{children}</nav>}

				<hr />
			</header>

			<main>
				<Outlet />
			</main>

			<footer>
				<hr />
				<em>
					Get in touch with the Newsletters Experience P&E team on Google Chat
					at <b>P&E/Newsletters</b> or{' '}
					<a href="mailto:newsletters.dev@guardian.co.uk">by email</a>{' '}
				</em>
			</footer>
		</>
	);
}
