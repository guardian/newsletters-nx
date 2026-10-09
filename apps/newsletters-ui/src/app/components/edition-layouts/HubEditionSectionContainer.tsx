import { css } from '@emotion/react';
import {
	baseRadius,
	baseSizing,
	semanticColors,
	semanticSpacing,
} from '@guardian/stand';
import { Badge } from '@guardian/stand/Badge';
import { Tooltip } from '@guardian/stand/Tooltip';
import { Typography } from '@guardian/stand/Typography';
import type {
	LayoutGroup,
	NewsletterData,
} from '@newsletters-nx/newsletters-data-client';
import { Link } from 'react-router-dom';
import { getLaunchedStatusBadgeContent } from '../NewsletterStatusBadge';
import { NewsletterThumbnail } from '../NewsletterThumbnail';

interface HubEditionSectionContainerProps {
	section: LayoutGroup;
	sectionNumber: number;
	newsletters: NewsletterData[];
}

const containerStyles = css`
	border: ${baseSizing.size1Px} solid ${semanticColors.border.weak};
	border-top-left-radius: ${baseRadius.corner4Px};
	border-top-right-radius: ${baseRadius.corner4Px};
`;

const sectionHeaderStyles = css`
	display: flex;
	flex-direction: column;
	align-items: flex-start;
	padding: ${semanticSpacing.stackMd};
	background-color: ${semanticColors.fill.neutralWeak};
	border-top-left-radius: ${baseRadius.corner4Px};
	border-top-right-radius: ${baseRadius.corner4Px};
`;

const sectionNumberStyles = css`
	margin: 0;
	color: ${semanticColors.text.strong};
`;

const sectionTitleStyles = css`
	margin: 0;
	color: ${semanticColors.text.strong};
`;

const newsletterListStyles = css`
	list-style: none;
	margin: 0;
	padding: 0;
`;

const newsletterItemStyles = css`
	display: flex;
	align-items: center;
	gap: ${semanticSpacing.stackMd};
	padding: ${baseSizing.size16Px};
	border-top: ${baseSizing.size1Px} solid ${semanticColors.border.weak};
`;

const newsletterDetailsStyles = css`
	display: flex;
	min-width: 0;
	flex-direction: column;
	align-items: flex-start;
	gap: ${semanticSpacing.stackXs};
`;

const badgeTooltipMessages: Record<string, string> = {
	Pending:
		"Not yet visible on the newsletters hub. It will appear once it's set to Live.",
	Paused:
		'This newsletter is not yet live - it will not appear until its status is updated.',
	Cancelled:
		'This newsletter has been cancelled and will not be displayed on the newsletters hub.',
	'Invalid id': 'There is no newsletter with this id',
};

const badgeTooltipStyles = css`
	display: flex;
	width: fit-content;
	align-items: center;
	gap: ${semanticSpacing.stackXxs};
`;

const newsletterLinkStyles = css`
	color: inherit;
	text-decoration: underline;
`;

const newsletterTitleStyles = css`
	margin: 0;
	color: ${semanticColors.text.strong};
`;

interface NewsletterListItemProps {
	newsletter?: NewsletterData;
}

const NewsletterListItem = ({ newsletter }: NewsletterListItemProps) => {
	const thumbnailUrl =
		newsletter?.illustrationSquare ??
		newsletter?.illustrationCircle ??
		newsletter?.illustrationCard;
	const badge = newsletter
		? getLaunchedStatusBadgeContent(newsletter.status)
		: undefined;
	const tooltipMessage = badge && badgeTooltipMessages[badge.label];

	return (
		newsletter && (
			<li css={newsletterItemStyles}>
				<NewsletterThumbnail src={thumbnailUrl} />
				<div css={newsletterDetailsStyles}>
					<Link
						to={`/launched/${newsletter.identityName}`}
						css={newsletterLinkStyles}
					>
						<Typography
							element="span"
							variant="bodyBoldMd"
							cssOverrides={newsletterTitleStyles}
						>
							{newsletter.name}
						</Typography>
					</Link>
					{badge && (
						<div css={badgeTooltipStyles}>
							<Badge color={badge.color} weight="strong" size="xs">
								{badge.label}
							</Badge>
							{tooltipMessage && <Tooltip>{tooltipMessage}</Tooltip>}
						</div>
					)}
				</div>
			</li>
		)
	);
};

export const HubEditionSectionContainer = ({
	section,
	sectionNumber,
	newsletters,
}: HubEditionSectionContainerProps) => (
	<section css={containerStyles}>
		<header css={sectionHeaderStyles}>
			<Typography
				element="h3"
				variant="headingSm"
				cssOverrides={sectionNumberStyles}
			>
				{`Section ${sectionNumber}:`}
			</Typography>
			<Typography
				element="h4"
				variant="bodyBoldLg"
				cssOverrides={sectionTitleStyles}
			>
				{section.title}
			</Typography>
		</header>
		<ul css={newsletterListStyles}>
			{section.newsletters.map((newsletterId) => (
				<NewsletterListItem
					key={newsletterId}
					newsletter={newsletters.find(
						(newsletter) => newsletter.identityName === newsletterId,
					)}
				/>
			))}
		</ul>
	</section>
);
