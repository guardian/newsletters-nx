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
	// Not ideal to use the host name to determine environment.
	// Could also use a hook to query the API on a route that exposes the
	// process.env.STAGE value, but taht seems unnecessary.
	const host = typeof window !== 'undefined' ? window.location.host : undefined;
	const isOnCode = !!host?.toLowerCase().split('.').includes('code');
	const isOnLocal = !!host?.toLowerCase().split(':').includes('localhost');

	return (
		<Frame>
			<MainNav isOnCode={isOnCode} isOnLocal={isOnLocal} />
			<Box pt={8} component={'main'}>
				{props.outlet ? props.outlet : <Outlet />}
			</Box>
		</Frame>
	);
}
