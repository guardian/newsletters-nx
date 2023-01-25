import { css } from '@emotion/react';
import { space } from '@guardian/source-foundations';
import type { ReactNode } from 'react';
import { Link, Outlet } from 'react-router-dom';

interface Props {
	children?: ReactNode;
}

const headerStyle = css`
	nav a {
		margin-right: ${space[2]}px;
	}
`;

export function Layout({ children }: Props) {
	return (
		<>
			<header css={headerStyle}>
				<h1>Newsletters UI</h1>

				<nav>
					<Link to={`/`}>home</Link>
					<Link to={`/dark`}>dark theme</Link>
					<Link to={`/light`}>light theme</Link>
					<Link to={`/api`}>api</Link>
					<Link to={`/newsletters/`}>newsleters-list</Link>
				</nav>
				{children && <nav>{children}</nav>}
				<hr></hr>
			</header>
			<main>
				<Outlet />
			</main>
			<footer>
				<hr></hr>
				<b>Footer</b>
			</footer>
		</>
	);
}
