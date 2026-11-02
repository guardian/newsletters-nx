import { css } from '@emotion/react';
import {
	baseSpacing,
	semanticBreakpoints,
	semanticSpacing,
} from '@guardian/stand';
import { Item, Grid as StandGrid } from '@guardian/stand/Grid';
import { Layout as StandLayout } from '@guardian/stand/Layout';
import { from } from '@guardian/stand/utils';
import { isNewsletterData } from '@newsletters-nx/newsletters-data-client';
import type React from 'react';
import { useLoaderData } from 'react-router-dom';
import { NewsletterDetailHeader } from '../NewsletterDetailHeader';
import { NewsletterDetailPanels } from '../NewsletterDetailPanels';
import { NewsletterDetailTabs } from '../NewsletterDetailTabs';

const gridStyle = css`
	max-width: ${semanticBreakpoints.lg};
`;

const Container = ({ children }: { children?: React.ReactNode }) => {
	return (
		<StandGrid css={gridStyle}>
			<Item size={12}>{children}</Item>
		</StandGrid>
	);
};

const mainStyle = css`
	${from.sm} {
		padding-top: ${baseSpacing['40Px']};
		padding-bottom: ${baseSpacing['24Px']};
	}

	display: flex;
	flex-flow: column nowrap;
	margin: 0 auto;
`;

const spacerStyles = css`
	display: flex;
	flex-flow: column nowrap;
	gap: ${semanticSpacing.stackMd};
`;

export const NewsletterDetailPageView = () => {
	const matchedItem = useLoaderData<unknown>();

	if (!matchedItem) {
		return (
			<StandLayout.Main>
				<Container>
					{/* Temporary copy until a dedicated Stand not-found state is designed. */}
					<article>NOT FOUND!</article>
				</Container>
			</StandLayout.Main>
		);
	}

	if (!isNewsletterData(matchedItem)) {
		return (
			<StandLayout.Main>
				<Container>
					{/* Temporary copy until a dedicated Stand invalid-data state is designed. */}
					<article>NOT VALID DATA!</article>
				</Container>
			</StandLayout.Main>
		);
	}

	return (
		<StandLayout.Main css={mainStyle}>
			<Container>
				<div css={spacerStyles}>
					<NewsletterDetailHeader newsletter={matchedItem}>
						<NewsletterDetailTabs
							identityName={matchedItem.identityName}
							selected="details"
						/>
					</NewsletterDetailHeader>
					{/* Keyed so panel edits and saved state don't carry over to another newsletter */}
					<NewsletterDetailPanels
						key={matchedItem.listId}
						newsletter={matchedItem}
					/>
				</div>
			</Container>
		</StandLayout.Main>
	);
};
