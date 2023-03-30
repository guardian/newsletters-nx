import styled from '@emotion/styled';
import {
	brand,
	space,
	textSansObjectStyles,
} from '@guardian/source-foundations';
import { Outlet, useLocation } from 'react-router-dom';
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
		border-bottom: 2px solid ${brand[300]};
		background-color: ${brand[800]};
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
				<h1>Have I Got Newsletters For You</h1>
				<MainNav pathname={location.pathname} />
			</header>

			<main>
				<Outlet />
			</main>

			<footer>
				<b>Footer</b>
			</footer>
		</Frame>
	);
}
