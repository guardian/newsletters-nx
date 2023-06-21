import styled from '@emotion/styled';
import { Box } from '@mui/material';
import { Outlet } from 'react-router-dom';
import { MainNav } from './components/MainNav';

const Frame = styled.div`
	display: flex;
	flex-direction: column;
	height: 100vh;
	box-sizing: border-box;
	align-items: stretch;

	> main {
		box-sizing: border-box;
		flex: 1;
		overflow: auto;
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
