import { Box, css } from '@mui/material';
import { useEffect } from 'react';
import { useLocation } from 'react-router';
import { Outlet } from 'react-router-dom';
import { MainNav } from './components/MainNav';

const frameCss = css`
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
	// process.env.STAGE value, but that seems unnecessary.
	const host = typeof window !== 'undefined' ? window.location.host : undefined;
	const isOnCode = !!host?.toLowerCase().split('.').includes('code');
	const isOnLocal = !!host?.toLowerCase().split(':').includes('localhost');

	const location = useLocation();

	useEffect(() => {
		let hostname = 'user-telemetry.gutools.co.uk';
		if(isOnCode){
			hostname = 'user-telemetry.code.dev-gutools.co.uk';
		}
		else if(isOnLocal){
			hostname = 'user-telemetry.local.dev-gutools.co.uk';
		}
		const image = new Image();
		image.src = `https://${hostname}/guardian-tool-accessed?app=newsletters-tool&path=${location.pathname}`;
	}, [isOnCode, isOnLocal, location.pathname]);

	return (
		<div css={frameCss}>
			<MainNav isOnCode={isOnCode} isOnLocal={isOnLocal} />
			<Box pt={8} component={'main'}>
				{props.outlet ? props.outlet : <Outlet />}
			</Box>
		</div>
	);
}
