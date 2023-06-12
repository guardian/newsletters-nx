import styled from '@emotion/styled';
import {
	brand,
	space,
	textSansObjectStyles,
} from '@guardian/source-foundations';
import { Box } from '@mui/material';
import { Outlet } from 'react-router-dom';
import { MainNav } from './components/MainNav';

const Frame = styled.div`
	display: flex;
	flex-direction: column;
	height: 100vh;
	box-sizing: border-box;
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
	return (
		<Frame>
			<header>
				<MainNav />
			</header>
			<Box pt={8}>
				<main>{props.outlet ? props.outlet : <Outlet />}</main>
			</Box>
		</Frame>
	);
}
