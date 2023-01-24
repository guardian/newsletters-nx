import { css } from '@emotion/react';
import { space } from '@guardian/source-foundations';
import type { ReactNode } from 'react';
import { Outlet, useLoaderData } from 'react-router-dom';
import { NewsletterList } from './components/NewslettersList';

interface Props {
	children?: ReactNode;
}

const headerStyle = css`
	nav a {
		margin-right: ${space[2]}px;
	}
`;

export function Layout({ children }: Props) {
	const data = useLoaderData() as {ids: string[]} | undefined;
	return (
		<>
			<header css={headerStyle}>
				<h1>Newsletters UI</h1>
				<nav>{children}</nav>
				<nav>
					<NewsletterList list={data?.ids} />
				</nav>
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
