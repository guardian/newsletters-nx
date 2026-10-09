import { css } from '@emotion/react';
import {
	semanticColors,
	semanticRadius,
	semanticSpacing,
} from '@guardian/stand';
import { Button } from '@guardian/stand/Button';
import { Typography } from '@guardian/stand/Typography';
import type {
	LayoutGroup,
	NewsletterData,
} from '@newsletters-nx/newsletters-data-client';
import { useIsMobile } from '../../hooks/useIsMobile';
import { NewsletterStatusBadge } from '../NewsletterStatusBadge';
import { NewsletterThumbnail } from '../NewsletterThumbnail';

const sectionStyles = css`
	display: flex;
	flex-direction: column;
	border: 1px solid ${semanticColors.border.weak};
	border-radius: ${semanticRadius.cornerSm};
	overflow: hidden;
`;

const sectionHeaderStyles = css`
	background-color: ${semanticColors.bg.raisedLevel2};
	padding: ${semanticSpacing.stackSm} ${semanticSpacing.stackMd};
`;

const listStyles = css`
	list-style: none;
	margin: 0;
	padding: 0;
	display: flex;
	flex-direction: column;
`;

const rowStyles = css`
	display: flex;
	align-items: center;
	gap: ${semanticSpacing.stackSm};
	padding: ${semanticSpacing.stackSm} ${semanticSpacing.stackMd};
	background-color: ${semanticColors.bg.raisedLevel1};
	border-top: 1px solid ${semanticColors.border.weak};
`;

const detailsStyles = css`
	flex: 1;
	display: flex;
	flex-direction: column;
	align-items: flex-start;
	gap: ${semanticSpacing.stackXs};
`;

// Outlined Material Symbols "do_not_disturb_on". The font Stand loads only
// ships the filled glyph, so the outlined one needs to be an SVG.
const removeIcon = (
	<svg viewBox="0 -960 960 960" fill="currentColor" aria-hidden="true">
		<path d="M280-440h400v-80H280v80Zm200 360q-83 0-156-31.5T197-197q-54-54-85.5-127T80-480q0-83 31.5-156T197-763q54-54 127-85.5T480-880q83 0 156 31.5T763-763q54 54 85.5 127T880-480q0 83-31.5 156T763-197q-54 54-127 85.5T480-80Zm0-80q134 0 227-93t93-227q0-134-93-227t-227-93q-134 0-227 93t-93 227q0 134 93 227t227 93Zm0-320Z" />
	</svg>
);

const removeButtonStyles = css`
	/* Stand's hover colour matches the row background, so it can't be seen. */
	&[data-hovered],
	&:hover {
		background: ${semanticColors.fill.weak};
	}
`;

const nameStyles = css`
	margin: 0;
	overflow-wrap: anywhere;
	text-decoration: underline;
`;

interface RowProps {
	newsletterId: string;
	newsletter?: NewsletterData;
	onRemove: () => void;
	canRemove: boolean;
	disabled?: boolean;
}

export const StandNewsletterRow = ({
	newsletterId,
	newsletter,
	onRemove,
	canRemove,
	disabled,
}: RowProps) => {
	const name = newsletter?.name ?? newsletterId;
	const thumbnail =
		newsletter?.illustrationSquare ??
		newsletter?.illustrationCircle ??
		newsletter?.illustrationCard;

	return (
		<li css={rowStyles}>
			<NewsletterThumbnail src={thumbnail} />
			<div css={detailsStyles}>
				<Typography element="p" variant="bodyBoldMd" cssOverrides={nameStyles}>
					{name}
				</Typography>
				{newsletter ? (
					<NewsletterStatusBadge newsletter={newsletter} />
				) : (
					<Typography element="span" variant="bodyXs">
						Invalid id
					</Typography>
				)}
			</div>
			{canRemove && (
				<Button
					variant="tertiary"
					size="sm"
					icon={removeIcon}
					aria-label={`Remove ${name}`}
					cssOverrides={removeButtonStyles}
					isDisabled={disabled}
					onPress={onRemove}
				>
					Remove
				</Button>
			)}
		</li>
	);
};

interface SectionProps {
	group: LayoutGroup;
	groupIndex: number;
	newsletters: NewsletterData[];
	onRemove: (groupIndex: number, newsletterIndex: number) => void;
	disabled?: boolean;
}

export const StandLayoutSection = ({
	group,
	groupIndex,
	newsletters,
	onRemove,
	disabled,
}: SectionProps) => {
	const isMobile = useIsMobile();

	return (
		<section css={sectionStyles} aria-label={group.title}>
			<div css={sectionHeaderStyles}>
				<Typography element="h3" variant="bodyBoldMd">
					{group.title}
				</Typography>
			</div>
			<ul css={listStyles}>
				{group.newsletters.map((newsletterId, newsletterIndex) => (
					<StandNewsletterRow
						key={newsletterId}
						newsletterId={newsletterId}
						newsletter={newsletters.find(
							(n) => n.identityName === newsletterId,
						)}
						canRemove={!isMobile}
						disabled={disabled}
						onRemove={() => onRemove(groupIndex, newsletterIndex)}
					/>
				))}
			</ul>
		</section>
	);
};
