import { css } from '@emotion/react';
import { semanticColors, semanticSpacing } from '@guardian/stand';
import { Typography } from '@guardian/stand/Typography';
import type {
	NewsletterData,
	RegionFocus,
} from '@newsletters-nx/newsletters-data-client';
import { Link } from 'react-router-dom';
import {
	formatPillarCategoryLabel,
	toThumbnailUrl,
} from '../lib/all-newsletters-rows';
import { NewsletterStatusBadge } from './NewsletterStatusBadge';
import { NewsletterThumbnail } from './NewsletterThumbnail';

const regionNames: Record<NonNullable<RegionFocus>, string> = {
	UK: 'United Kingdom',
	US: 'United States',
	AU: 'Australia',
	INT: 'International',
	EUR: 'Europe',
};

// "News | Article based | Australia" - anything not set is left out.
const formatLabel = ({ theme, category, regionFocus }: NewsletterData) =>
	[
		formatPillarCategoryLabel(theme, category),
		regionFocus && regionNames[regionFocus],
	]
		.filter(Boolean)
		.join(' | ');

const headerStyles = css`
	display: flex;
	align-items: center;
	justify-content: space-between;
	gap: ${semanticSpacing.stackMd};
	padding: ${semanticSpacing.stackMd};
	background-color: ${semanticColors.bg.raisedLevel2};

	@media (max-width: 600px) {
		flex-direction: column-reverse;
		align-items: flex-start;
	}
`;

const textStyles = css`
	display: flex;
	flex-direction: column;
	align-items: flex-start;
	gap: ${semanticSpacing.stackSm};
`;

const titleStyles = css`
	margin: 0;
	color: ${semanticColors.text.strong};
	overflow-wrap: anywhere;
`;

const graphicStyles = css`
	@media (max-width: 393px) {
		display: none;
	}
`;

export const LaunchedNewsletterHeader = ({
	newsletter,
}: {
	newsletter: NewsletterData;
}) => (
	<>
		<Link to="/all">Back to all newsletters</Link>
		<header css={headerStyles}>
			<div css={textStyles}>
				<Typography
					element="h2"
					variant="headingCompact2Xl"
					cssOverrides={titleStyles}
				>
					{newsletter.name}
				</Typography>
				<Typography element="p" variant="bodyXs">
					{formatLabel(newsletter)}
				</Typography>
				<NewsletterStatusBadge newsletter={newsletter} />
			</div>
			<div css={graphicStyles}>
				<NewsletterThumbnail src={toThumbnailUrl(newsletter)} size="120px" />
			</div>
		</header>
	</>
);
