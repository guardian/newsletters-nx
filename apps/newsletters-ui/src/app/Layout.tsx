import styled from '@emotion/styled';
import {
	brand,
	brandAlt,
	space,
	textSansObjectStyles,
} from '@guardian/source-foundations';
import { Outlet, useLocation } from 'react-router-dom';
import { FooterContents } from './components/FooterContents';
import { MainNav } from './components/MainNav';

const Frame = styled.div`
	display: flex;
	flex-direction: column;
	height: 100vh;
	box-sizing: border-box;
	overflow: hidden;
	align-items: stretch;

	> header {
		padding: ${space[1]}px;
		border-bottom: 2px solid ${brand[400]};
		background-color: ${brandAlt[400]};
		box-sizing: border-box;

		h1 {
			${textSansObjectStyles.xlarge({ fontStyle: 'italic' })};
			margin: 0;
			color: ${brand[300]};
		}
	}

	> main {
		box-sizing: border-box;
		flex: 1;
		overflow: auto;
	}

	> footer {
		box-sizing: border-box;
		padding: ${space[1]}px;
		border-top: 2px solid ${brand[300]};
		background-color: ${brand[800]};
	}
`;

export function Layout() {
	const location = useLocation();

	return (
		<Frame>
			<header>
				<MainNav pathname={location.pathname} />
			</header>

			<main>
				<Outlet />
			</main>

			<footer>
				<FooterContents />
			</footer>
		</Frame>
	);
}
