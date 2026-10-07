import { css } from '@emotion/react';
import {
	semanticBreakpoints,
	semanticGrid,
	semanticSpacing,
} from '@guardian/stand';
import { Grid, Item } from '@guardian/stand/Grid';
import { Layout as StandLayout } from '@guardian/stand/Layout';
import { Tile } from '@guardian/stand/Tile';
import { Typography } from '@guardian/stand/Typography';
import { from } from '@guardian/stand/utils';
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

const getEditionName = (editionId: EditionId): string => {
	const mapping: Record<EditionId, string> = {
		UK: 'United Kingdom',
		US: 'United States',
		AU: 'Australia',
		EUR: 'Europe',
		INT: 'International',
	};

	return mapping[editionId];
};

const mainStyle = css`
	display: flex;
	flex-flow: column nowrap;
	gap: ${semanticSpacing.stackXl};
`;

const gridStyle = css`
	max-width: ${semanticBreakpoints.lg};
`;

const editionsListStyle = css`
	display: contents;
`;

const headerStyle = css`
	padding: 0 ${semanticGrid.margin.smPx};

	${from.md} {
		padding: 0 ${semanticGrid.margin.mdPx};
	}

	${from.lg} {
		padding: 0 ${semanticGrid.margin.lgPx};
	}
`;

export const StandLayoutMapView = () => {
	const { editionsLayouts } = useLoaderData<{
		editionsLayouts: EditionsLayouts;
	}>();
	const navigate = useNavigate();

	return (
		<StandLayout.Main css={mainStyle}>
			<AriaRouterProvider
				navigate={(path) => void navigate(path)}
				useHref={useHref}
			>
				<header css={headerStyle}>
					<Typography
						element="h1"
						variant="heading2Xl"
						cssOverrides={titleStyle}
					>
						Newsletters hub layouts
					</Typography>
					<Typography element="p" variant="bodyMd" role="doc-subtitle">
						Manage how the{' '}
						<a href="https://www.theguardian.com/email-newsletters">
							all newsletter pages
						</a>{' '}
						look for readers.
					</Typography>
				</header>

				<Grid css={gridStyle}>
					<ul css={editionsListStyle} aria-label="Available editions">
						{editionIds.map((editionId) => (
							<Item key={editionId} size={{ sm: 12, md: 4, lg: 4 }}>
								<Tile
									href={`/layouts/${editionId.toLowerCase()}`}
									description={getDescription(editionsLayouts, editionId)}
									icon={<FlagAtom editionId={editionId} />}
									aria-label={getEditionName(editionId)}
								>
									{getEditionName(editionId)}
								</Tile>
							</Item>
						))}
					</ul>
				</Grid>
			</AriaRouterProvider>
		</StandLayout.Main>
	);
};
