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
import { Navigation } from './components/Nav';

const Frame = styled.div`
	display: flex;
	flex-direction: column;
	height: 100vh;
	box-sizing: border-box;
	overflow: hidden;
	align-items: stretch;

	>
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

interface IRootRoute {
	outlet?: undefined | React.ReactNode;
}

export function Layout(props: IRootRoute) {
	// const location = useLocation();
	return (
		<Frame>
			<header>
				{/*<MainNav pathname={location.pathname} />*/}
				<Navigation />
			</header>

			<main>{props.outlet ? props.outlet : <Outlet />}</main>

			{/*<footer>*/}
			{/*	<FooterContents />*/}
			{/*</footer>*/}
		</Frame>
	);
}
