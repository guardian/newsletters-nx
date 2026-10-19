import { css } from '@emotion/react';
import {
	semanticColors,
	semanticRadius,
	semanticSpacing,
} from '@guardian/stand';
import { Icon } from '@guardian/stand/Icon';
import { Typography } from '@guardian/stand/Typography';
import { until } from '@guardian/stand/utils';
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

const backLinkStyles = css`
	display: inline-flex;
	align-items: center;
	gap: ${semanticSpacing.stackXxs};
	margin-bottom: ${semanticSpacing.stackMd};
	color: ${semanticColors.text.strong};
	text-decoration: underline;
`;

// Padding is 16px except 24px below, and the graphic stretches to the height
// of the text column (the "graphic" is 120px wide).
// Below Stand's `md` breakpoint the header stacks into a column.
const headerStyles = css`
	display: flex;
	align-items: stretch;
	justify-content: space-between;
	gap: ${semanticSpacing.stackMd};
	padding: ${semanticSpacing.stackMd} ${semanticSpacing.stackMd} 1.5rem;
	background-color: ${semanticColors.bg.raisedLevel2};
	border-bottom: 1px solid ${semanticColors.border.weak};
	border-radius: ${semanticRadius.cornerSm} ${semanticRadius.cornerSm} 0 0;

	${until.md} {
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

	${until.md} {
		height: 5.2rem;
	}
`;

export const LaunchedNewsletterHeader = ({
	newsletter,
}: {
	newsletter: NewsletterData;
}) => (
	<>
		<Link to="/all" css={backLinkStyles}>
			<Icon symbol="arrow_back" size="sm" />
			<Typography element="span" variant="headingCompactSm">
				Back to all newsletters
			</Typography>
		</Link>
		<header css={headerStyles}>
			<div css={textStyles}>
				<NewsletterStatusBadge newsletter={newsletter} />
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
	</>
);
