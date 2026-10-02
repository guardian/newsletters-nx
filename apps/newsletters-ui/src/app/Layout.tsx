import { LocationType } from '@aws-sdk/client-s3';
import { css as emotionCss } from '@emotion/react';
import { AlertBanner } from '@guardian/stand/AlertBanner';
import { Layout as StandLayout } from '@guardian/stand/Layout';
import { from } from '@guardian/stand/utils';
import { LocationCityOutlined } from '@mui/icons-material';
import { Box, css } from '@mui/material';
import { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { MainNav } from './components/MainNav';
import { StandMainNav } from './components/StandMainNav';
import { isFeatureSwitchEnabled } from './featureSwitches';

const pinnedToViewport = `
	height: 100svh;
	overflow: hidden;
`;

// Pins the shell to the viewport so content scrolls inside the main area;
// `StandLayout` only sets `min-height`, which would let the main row stretch
// and hand scrolling back to the page. Optionally only from the lg breakpoint,
// so smaller screens scroll as normal.
const viewportHeightCss = (options: { fromLgOnly?: boolean } = {}) =>
	options.fromLgOnly
		? emotionCss`
			${from.lg} {
				${pinnedToViewport}
			}
		`
		: emotionCss(pinnedToViewport);

const allNewslettersViewportCss = viewportHeightCss();
const homeViewportCss = viewportHeightCss({ fromLgOnly: true });

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

const StandAlertBanner = ({ isOnCode }: { isOnCode: boolean }) => (
	<AlertBanner level="information" showIcon>
		Environment: {isOnCode ? 'CODE' : 'LOCAL'} - Changes will not impact
		https://www.theguardian.com/
	</AlertBanner>
);

export function Layout(props: IRootRoute) {
	// Not ideal to use the host name to determine environment.
	// Could also use a hook to query the API on a route that exposes the
	// process.env.STAGE value, but that seems unnecessary.
	const host = typeof window !== 'undefined' ? window.location.host : undefined;
	const isOnCode = !!host?.toLowerCase().split('.').includes('code');
	const isOnLocal =
		!!host?.toLowerCase().split(':').includes('localhost') ||
		!!host?.toLowerCase().split('.').includes('local');

	const location = useLocation();

	const isWizardRoute = (() => {
		const wizardRoutes = [
			'/drafts/newsletter-data',
			'/drafts/newsletter-data-rendering',
			'/drafts/launch-newsletter',
		];
		return wizardRoutes.some((route) => location.pathname.includes(route));
	})();
	const isAllNewslettersRoute = location.pathname === '/all';
	const isHomeRoute = location.pathname === '/';
	const isNewslettersHubLandingRoute = location.pathname === '/layouts';
	// /all and the home page use the same Stand top bar / alert banner shell as the wizard.
	const usesStandShell =
		isWizardRoute ||
		isAllNewslettersRoute ||
		isHomeRoute ||
		isNewslettersHubLandingRoute;
	const isUsingStand = isFeatureSwitchEnabled('switch-stand');

	useEffect(() => {
		let hostname = 'user-telemetry.gutools.co.uk';
		if (isOnCode) {
			hostname = 'user-telemetry.code.dev-gutools.co.uk';
		} else if (isOnLocal) {
			hostname = 'user-telemetry.local.dev-gutools.co.uk';
		}
		const image = new Image();
		image.src = `https://${hostname}/guardian-tool-accessed?app=newsletters-tool&path=${location.pathname}`;
	}, [isOnCode, isOnLocal, location.pathname]);

	const Nav = isUsingStand ? (
		<StandMainNav />
	) : (
		<MainNav isOnCode={isOnCode} isOnLocal={isOnLocal} />
	);

	if (isUsingStand && usesStandShell) {
		return (
			<StandLayout
				cssOverrides={
					isAllNewslettersRoute
						? allNewslettersViewportCss
						: isHomeRoute
							? homeViewportCss
							: undefined
				}
			>
				{(isOnCode || isOnLocal) && (
					<StandLayout.AlertBanner>
						<StandAlertBanner isOnCode={isOnCode} />
					</StandLayout.AlertBanner>
				)}
				<StandLayout.TopBar>{Nav}</StandLayout.TopBar>
				{props.outlet ?? <Outlet />}
			</StandLayout>
		);
	}

	return (
		<div css={frameCss}>
			{(isOnCode || isOnLocal) && isUsingStand && (
				<StandAlertBanner isOnCode={isOnCode} />
			)}
			{Nav}
			<Box sx={{ pt: 8 }} component={'main'}>
				{props.outlet ?? <Outlet />}
			</Box>
		</div>
	);
}
