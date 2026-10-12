import { css } from '@emotion/react';
import {
	semanticColors,
	semanticRadius,
	semanticSpacing,
} from '@guardian/stand';
import { Button } from '@guardian/stand/Button';
import { Icon } from '@guardian/stand/Icon';
import { Typography } from '@guardian/stand/Typography';
import type {
	LayoutGroup,
	NewsletterData,
} from '@newsletters-nx/newsletters-data-client';
import { useState } from 'react';
import {
	Button as AriaButton,
	DropIndicator,
	GridList,
	GridListItem,
	useDragAndDrop,
} from 'react-aria-components';
import { useIsMobile } from '../../hooks/useIsMobile';
import { NewsletterStatusBadge } from '../NewsletterStatusBadge';
import { NewsletterThumbnail } from '../NewsletterThumbnail';
import { AddNewsletterPanel } from './AddNewsletterPanel';

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

const focusColour = '#0072A9';

const listStyles = css`
	margin: 0;
	padding: 0;
	display: flex;
	flex-direction: column;
	position: relative;
	&:not(:empty) {
		border-bottom: 1px solid ${semanticColors.border.weak};
	}
`;

const rowStyles = css`
	display: flex;
	align-items: center;
	gap: ${semanticSpacing.stackSm};
	padding: ${semanticSpacing.stackSm} ${semanticSpacing.stackMd};
	background-color: ${semanticColors.bg.raisedLevel1};
	border-top: 1px solid ${semanticColors.border.weak};
	outline: none;
	&[data-dragging] {
		opacity: 0.5;
	}
	&[data-focus-visible] {
		outline: 2px solid ${focusColour};
		outline-offset: -2px;
	}
`;

const draggableRowStyles = css`
	cursor: grab;
	user-select: none;
	&[data-dragging] {
		cursor: grabbing;
	}
`;

const gripStyles = css`
	display: flex;
	align-items: center;
	background: none;
	border: 2px solid transparent;
	border-radius: 3px;
	padding: 0;
	color: inherit;
	cursor: inherit;
	&[data-disabled] {
		opacity: 0.4;
		cursor: default;
	}
	&[data-focus-visible] {
		background: #fff;
		border-color: ${focusColour};
		outline: none;
	}
`;

const dropIndicatorStyles = css`
	height: 4px;
	background-color: ${focusColour};
	&:not([data-drop-target]) {
		display: none;
	}
`;

const dragPreviewStyles = css`
	display: flex;
	align-items: center;
	gap: ${semanticSpacing.stackSm};
	padding: ${semanticSpacing.stackSm} ${semanticSpacing.stackMd};
	background-color: ${semanticColors.fill.neutralWeak};
	box-shadow: 0 2px 3px rgba(0, 0, 0, 0.12);
	cursor: grabbing;
`;

const detailsStyles = css`
	flex: 1;
	display: flex;
	flex-direction: column;
	align-items: flex-start;
	gap: ${semanticSpacing.stackXs};
`;

const removeButtonStyles = css`
	/* Stand's hover colour matches the row background, so it can't be seen. */
	&[data-hovered],
	&:hover {
		background: ${semanticColors.fill.weak};
	}
`;

const addButtonRowStyles = css`
	display: flex;
	padding: ${semanticSpacing.stackMd};
	background-color: ${semanticColors.bg.base};
`;

const nameStyles = css`
	margin: 0;
	overflow-wrap: anywhere;
	text-decoration: underline;
`;

const getName = (newsletterId: string, newsletter?: NewsletterData) =>
	newsletter?.name ?? newsletterId;

const NewsletterSummary = ({
	newsletterId,
	newsletter,
}: {
	newsletterId: string;
	newsletter?: NewsletterData;
}) => {
	const thumbnail =
		newsletter?.illustrationSquare ??
		newsletter?.illustrationCircle ??
		newsletter?.illustrationCard;

	return (
		<>
			<NewsletterThumbnail src={thumbnail} />
			<div css={detailsStyles}>
				<Typography element="p" variant="bodyBoldMd" cssOverrides={nameStyles}>
					{getName(newsletterId, newsletter)}
				</Typography>
				{newsletter ? (
					<NewsletterStatusBadge newsletter={newsletter} />
				) : (
					<Typography element="span" variant="bodyXs">
						Invalid id
					</Typography>
				)}
			</div>
		</>
	);
};

interface RowProps {
	newsletterId: string;
	newsletter?: NewsletterData;
	onRemove: () => void;
	canRemove: boolean;
	disabled?: boolean;
	isDragDisabled?: boolean;
}

export const StandNewsletterRow = ({
	newsletterId,
	newsletter,
	onRemove,
	canRemove,
	disabled,
	isDragDisabled,
}: RowProps) => {
	const name = getName(newsletterId, newsletter);

	return (
		<GridListItem
			id={newsletterId}
			textValue={name}
			css={[rowStyles, !isDragDisabled && draggableRowStyles]}
		>
			<AriaButton slot="drag" css={gripStyles} aria-label={`Reorder ${name}`}>
				<Icon symbol="drag_indicator" aria-hidden="true" />
			</AriaButton>
			<NewsletterSummary newsletterId={newsletterId} newsletter={newsletter} />
			{canRemove && (
				<Button
					variant="tertiary"
					size="sm"
					icon="remove"
					aria-label={`Remove ${name}`}
					cssOverrides={removeButtonStyles}
					isDisabled={disabled}
					onPress={onRemove}
				>
					Remove
				</Button>
			)}
		</GridListItem>
	);
};

interface SectionProps {
	group: LayoutGroup;
	groupIndex: number;
	newsletters: NewsletterData[];
	onRemove: (groupIndex: number, newsletterIndex: number) => void;
	disabled?: boolean;
	// True while any section's 'Add newsletter' panel is open.
	isDragDisabled?: boolean;
	onMove?: (
		groupIndex: number,
		newsletterIndex: number,
		newIndex: number,
	) => void;
	availableNewsletters?: NewsletterData[];
	isAddAreaOpen?: boolean;
	onOpenAddArea?: () => void;
	onCloseAddArea?: () => void;
	onAdd?: (groupIndex: number, identityName: string) => void;
}

export const StandLayoutSection = ({
	group,
	groupIndex,
	newsletters,
	onRemove,
	disabled,
	isDragDisabled = false,
	onMove,
	availableNewsletters = [],
	isAddAreaOpen = false,
	onOpenAddArea,
	onCloseAddArea,
	onAdd,
}: SectionProps) => {
	const isMobile = useIsMobile();
	const canAdd = !isMobile && !!onOpenAddArea;
	// Return focus to the 'Add a newsletter' button when the panel is closed with its Close button.
	const [focusAddButton, setFocusAddButton] = useState(false);
	const dragDisabled = isDragDisabled || !!disabled || isMobile || !onMove;

	const { dragAndDropHooks } = useDragAndDrop({
		isDisabled: dragDisabled,
		getItems: (keys) => [...keys].map((key) => ({ 'text/plain': String(key) })),
		renderDragPreview: (items) => {
			const id = items[0]?.['text/plain'] ?? '';
			return (
				<div css={dragPreviewStyles}>
					<Icon symbol="drag_indicator" aria-hidden="true" />
					<NewsletterSummary
						newsletterId={id}
						newsletter={newsletters.find((n) => n.identityName === id)}
					/>
				</div>
			);
		},
		renderDropIndicator: (target) => (
			<DropIndicator target={target} css={dropIndicatorStyles} />
		),
		onReorder: (e) => {
			const movedId = [...e.keys][0];
			const targetId = e.target.key;
			const ids = group.newsletters;
			const from = ids.findIndex((id) => id === movedId);
			const targetIndex = ids.findIndex((id) => id === targetId);
			if (from < 0 || targetIndex < 0 || e.target.dropPosition === 'on') {
				return;
			}
			const insertAt =
				e.target.dropPosition === 'before' ? targetIndex : targetIndex + 1;
			// moveNewsletterTo takes the index in the list after the item is removed.
			const newIndex = insertAt > from ? insertAt - 1 : insertAt;
			if (newIndex !== from) {
				onMove?.(groupIndex, from, newIndex);
			}
		},
	});

	return (
		<section css={sectionStyles} aria-label={group.title}>
			<div css={sectionHeaderStyles}>
				<Typography element="h3" variant="bodyBoldMd">
					{group.title}
				</Typography>
			</div>
			<GridList
				css={listStyles}
				aria-label={`${group.title} newsletters`}
				dragAndDropHooks={dragAndDropHooks}
			>
				{group.newsletters.map((newsletterId, newsletterIndex) => (
					<StandNewsletterRow
						key={newsletterId}
						newsletterId={newsletterId}
						newsletter={newsletters.find(
							(n) => n.identityName === newsletterId,
						)}
						canRemove={!isMobile}
						disabled={disabled}
						isDragDisabled={dragDisabled}
						onRemove={() => onRemove(groupIndex, newsletterIndex)}
					/>
				))}
			</GridList>
			{canAdd && !isAddAreaOpen && (
				<div css={addButtonRowStyles}>
					<Button
						variant="secondary"
						size="sm"
						icon="add"
						isDisabled={disabled}
						autoFocus={focusAddButton}
						onPress={() => {
							setFocusAddButton(false);
							onOpenAddArea();
						}}
					>
						Add a newsletter
					</Button>
				</div>
			)}
			{canAdd && isAddAreaOpen && (
				<AddNewsletterPanel
					sectionTitle={group.title}
					newsletters={availableNewsletters}
					disabled={disabled}
					onAdd={(identityName) => onAdd?.(groupIndex, identityName)}
					onClose={() => {
						setFocusAddButton(true);
						onCloseAddArea?.();
					}}
				/>
			)}
		</section>
	);
};
