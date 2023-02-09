import { css } from '@emotion/react';
import {
	brand,
	space,
	textSansObjectStyles,
} from '@guardian/source-foundations';
import { Outlet, useLocation } from 'react-router-dom';
import { MainNav } from './components/MainNav';

const headerStyle = css`
	margin-bottom: ${space[6]}px;
	padding: ${space[1]}px;
	border-bottom: 2px solid ${brand[300]};
	background-color: ${brand[800]};

	h1 {
		${textSansObjectStyles.xlarge({ fontStyle: 'italic' })};
		margin: 0;
		color: ${brand[300]};
	}
`;

const footerStyle = css`
	margin-top: ${space[3]}px;
	padding: ${space[1]}px;
	border-top: 2px solid ${brand[300]};
	background-color: ${brand[800]};
`;

export function Layout() {
	const location = useLocation();

	return (
		<>
			<header css={headerStyle}>
				<h1>Newsletters UI</h1>
				<MainNav pathname={location.pathname} />
			</header>
			<main>
				<Outlet />
			</main>
			<footer css={footerStyle}>
				<b>Footer</b>
			</footer>
		</>
	);
}
