import { css } from '@emotion/react';
import { baseSpacing, semanticBreakpoints } from '@guardian/stand';
import { Grid, Item } from '@guardian/stand/Grid';
import { Layout as StandLayout } from '@guardian/stand/Layout';
import { Tile } from '@guardian/stand/Tile';
import { Typography } from '@guardian/stand/Typography';
import type {
	EditionId,
	EditionsLayouts,
} from '@newsletters-nx/newsletters-data-client';
import { editionIds } from '@newsletters-nx/newsletters-data-client';
import { RouterProvider as AriaRouterProvider } from 'react-aria-components';
import { useHref, useLoaderData, useNavigate } from 'react-router-dom';
import { titleStyle } from '../home/home.styles';
import { FlagAtom } from '../icons/FlagAtom';

const plural = (count: number, noun: string) =>
	`${count} ${noun}${count === 1 ? '' : 's'}`;

const getDescription = (
	editionsLayouts: EditionsLayouts,
	editionId: EditionId,
) => {
	const layout = editionsLayouts[editionId];
	if (!layout) {
		return 'No layout';
	}
	const newsletterCount = layout.groups.flatMap(
		(group) => group.newsletters,
	).length;
	return `${plural(newsletterCount, 'newsletter')} in ${plural(layout.groups.length, 'group')}`;
};

export const StandLayoutMapView = () => {
	const { editionsLayouts } = useLoaderData<{
		editionsLayouts: EditionsLayouts;
	}>();
	const navigate = useNavigate();

	return (
		<StandLayout.Main
			cssOverrides={css`
				display: flex;
				flex-flow: column nowrap;
				align-items: center;
			`}
		>
			<AriaRouterProvider
				navigate={(path) => void navigate(path)}
				useHref={useHref}
			>
				<Grid
					css={css`
						max-width: ${semanticBreakpoints.lg};
						gap: ${baseSpacing['40Rem']};
					`}
				>
					<Item size={12}>
						<header>
							<Typography
								element="h1"
								variant="heading2Xl"
								cssOverrides={titleStyle}
							>
								Newsletters hub layouts
							</Typography>
							<Typography element="p" variant="bodyMd">
								Manage how the{' '}
								<a href="https://www.theguardian.com/email-newsletters">
									all newsletter pages
								</a>{' '}
								look for readers.
							</Typography>
						</header>
					</Item>

					<ul
						css={css`
							display: contents;
						`}
					>
						{editionIds.map((editionId) => (
							<Item key={editionId} size={{ sm: 12, md: 4, lg: 4 }}>
								<Tile
									href={`/layouts/${editionId.toLowerCase()}`}
									description={getDescription(editionsLayouts, editionId)}
									icon={<FlagAtom editionId={editionId} />}
								>
									{editionId} Layout
								</Tile>
							</Item>
						))}
					</ul>
				</Grid>
			</AriaRouterProvider>
		</StandLayout.Main>
	);
};
