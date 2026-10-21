import { css } from '@emotion/react';
import {
	semanticColors,
	semanticRadius,
	semanticSpacing,
} from '@guardian/stand';
import { Icon } from '@guardian/stand/Icon';
import { Typography } from '@guardian/stand/Typography';
import type { NewsletterData } from '@newsletters-nx/newsletters-data-client';
import { Link } from 'react-router-dom';
import { formatPillarCategoryLabel } from '../lib/all-newsletters-rows';
import { regionNames } from '../lib/region-names';
import { NewsletterStatusBadge } from './NewsletterStatusBadge';
import { NewsletterThumbnail } from './NewsletterThumbnail';

// These widths come from the Figma design and don't match Stand's breakpoints
// (sm 0, md 830, lg 1056). They are explicit here for now and could be added
// to Stand later, at which point these can switch to its `until` helpers.
const STACKED_MAX_WIDTH = '600px';
const MOBILE_MAX_WIDTH = '393px';
const untilStacked = `@media (max-width: ${STACKED_MAX_WIDTH})`;
const untilMobile = `@media (max-width: ${MOBILE_MAX_WIDTH})`;

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
	color: ${semanticColors.text.strong};
	text-decoration: none;
`;

// Underline the text only, not the arrow icon.
const backLinkTextStyles = css`
	text-decoration: underline;
`;

// Padding is 16px except 24px below, and the graphic stretches to the height
// of the text column (the "graphic" is 120px wide).
// At 600px and below the header stacks into a column, and the graphic is
// hidden at 393px and below.
const headerStyles = css`
	display: flex;
	align-items: stretch;
	justify-content: space-between;
	gap: ${semanticSpacing.stackMd};
	padding: ${semanticSpacing.stackMd} ${semanticSpacing.stackMd} 1.5rem;
	background-color: ${semanticColors.bg.raisedLevel2};
	border-bottom: 1px solid ${semanticColors.border.weak};
	border-radius: ${semanticRadius.cornerSm} ${semanticRadius.cornerSm} 0 0;

	${untilStacked} {
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

	${untilStacked} {
		height: 5.2rem;
	}

	${untilMobile} {
		display: none;
	}
`;

export const NewsletterDetailHeader = ({
	newsletter,
	children,
}: {
	newsletter: NewsletterData;
	children?: React.ReactNode;
}) => (
	<>
		<Link to="/all" css={backLinkStyles}>
			<Icon symbol="arrow_back" size="sm" />
			<Typography
				element="span"
				variant="headingCompactSm"
				cssOverrides={backLinkTextStyles}
			>
				Back to all newsletters
			</Typography>
		</Link>
		<div>
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
						src={newsletter.illustrationCard ?? undefined}
						variant="large"
					/>
				</div>
			</header>
			{children}
		</div>
	</>
);
