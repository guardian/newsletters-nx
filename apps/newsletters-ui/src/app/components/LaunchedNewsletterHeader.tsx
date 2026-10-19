import { css } from '@emotion/react';
import {
	semanticColors,
	semanticRadius,
	semanticSpacing,
	semanticTypography,
} from '@guardian/stand';
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

// The back link and header are one block, so the 16px between them doesn't
// depend on the page wrapper's own gap.
const pageHeaderStyles = css`
	display: flex;
	flex-direction: column;
	gap: ${semanticSpacing.stackMd};
`;

const backLinkStyles = css`
	align-self: flex-start;
	display: flex;
	align-items: center;
	gap: ${semanticSpacing.stackXxs};
	color: ${semanticColors.text.strong};
	font: ${semanticTypography.headingCompactSm.font};
	white-space: nowrap;
	text-decoration: underline;
`;

// Padding is 16px except 24px below, and the graphic stretches to the height
// of the text column (the "graphic" is 120px wide).
const headerStyles = css`
	display: flex;
	align-items: stretch;
	justify-content: space-between;
	gap: ${semanticSpacing.stackMd};
	padding: ${semanticSpacing.stackMd} ${semanticSpacing.stackMd} 1.5rem;
	background-color: ${semanticColors.bg.raisedLevel2};
	border-bottom: 1px solid ${semanticColors.border.weak};
	border-radius: ${semanticRadius.cornerSm} ${semanticRadius.cornerSm} 0 0;

	@media (max-width: 600px) {
		flex-direction: column;
	}
`;

const textStyles = css`
	display: flex;
	flex-direction: column;
	align-items: flex-start;
	gap: ${semanticSpacing.stackXs};
`;

const titleStyles = css`
	margin: 0;
	color: ${semanticColors.text.strong};
	overflow-wrap: anywhere;
`;

const labelStyles = css`
	margin: 0;
	color: ${semanticColors.text.weak};
	line-height: 1.5;
`;

const graphicStyles = css`
	flex-shrink: 0;

	@media (max-width: 600px) {
		height: 5.2rem;
	}

	@media (max-width: 393px) {
		display: none;
	}
`;

export const LaunchedNewsletterHeader = ({
	newsletter,
}: {
	newsletter: NewsletterData;
}) => (
	<div css={pageHeaderStyles}>
		<Link to="/all" css={backLinkStyles}>
			{/* The design's 12px arrow, centred in an 18px box. */}
			<svg width="18" height="16" viewBox="24 39 18 16" aria-hidden="true">
				<path
					d="M39 46.25H29.8725L34.065 42.0575L33 41L27 47L33 53L34.0575 51.9425L29.8725 47.75H39V46.25Z"
					fill="currentColor"
				/>
			</svg>
			Back to all newsletters
		</Link>
		<header css={headerStyles}>
			<div css={textStyles}>
				<NewsletterStatusBadge newsletter={newsletter} size="xs" />
				<Typography
					element="h2"
					variant="headingCompact2Xl"
					cssOverrides={titleStyles}
				>
					{newsletter.name}
				</Typography>
				<Typography
					element="p"
					variant="bodyCompactSm"
					cssOverrides={labelStyles}
				>
					{formatLabel(newsletter)}
				</Typography>
			</div>
			<div css={graphicStyles}>
				<NewsletterThumbnail
					src={toThumbnailUrl(newsletter)}
					size="120px"
					height="100%"
				/>
			</div>
		</header>
	</div>
);
