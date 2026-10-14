import { css } from '@emotion/react';
import {
	semanticColors,
	semanticRadius,
	semanticSpacing,
} from '@guardian/stand';
import { Button } from '@guardian/stand/Button';
import { Icon } from '@guardian/stand/Icon';
import { Typography } from '@guardian/stand/Typography';
import type { DroppableCollectionInsertDropEvent } from 'react-aria-components';
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
import { getInsertIndex, getReorderIndex } from '../../lib/modify-layout';
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

// A custom type, so dropping a row into a text field or another app doesn't paste its ID.
const DRAG_TYPE = 'application/x-newsletter-id';
const SOURCE_GROUP_TYPE = 'application/x-newsletter-group-index';

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
		outline: 2px solid ${semanticColors.border.focused};
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
		border-color: ${semanticColors.border.focused};
		outline: none;
	}
`;

// Overlaps the rows (negative margin) so it doesn't shift them. It must stay rendered
// with a real size, not display: none, because react-aria uses it as the keyboard drop target.
const dropIndicatorStyles = css`
	position: relative;
	height: 4px;
	margin: -2px 0;
	z-index: 1;
	&[data-drop-target] {
		background-color: ${semanticColors.border.focused};
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

const emptyStyles = css`
	padding: ${semanticSpacing.stackMd};
	text-align: center;
	color: ${semanticColors.text.strong};
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
	onMove?: (
		groupIndex: number,
		newsletterIndex: number,
		newIndex: number,
	) => void;
	onMoveToGroup?: (
		fromGroupIndex: number,
		newsletterId: string,
		toGroupIndex: number,
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
	onMove,
	onMoveToGroup,
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
	const dragDisabled = !!disabled || isMobile || !onMove;

	const moveDroppedItems = async (
		items: DroppableCollectionInsertDropEvent['items'],
		index: number,
	) => {
		let insertAt = index;
		for (const item of items) {
			if (item.kind !== 'text') {
				continue;
			}
			const id = await item.getText(DRAG_TYPE).catch(() => undefined);
			const from = await item.getText(SOURCE_GROUP_TYPE).catch(() => undefined);
			if (id === undefined || from === undefined) {
				continue;
			}
			onMoveToGroup?.(Number(from), id, groupIndex, insertAt);
			insertAt += 1;
		}
	};

	const { dragAndDropHooks } = useDragAndDrop({
		isDisabled: dragDisabled,
		acceptedDragTypes: [DRAG_TYPE, SOURCE_GROUP_TYPE],
		getItems: (keys) =>
			[...keys].map((key) => ({
				[DRAG_TYPE]: String(key),
				[SOURCE_GROUP_TYPE]: String(groupIndex),
			})),
		onInsert: async (e) => {
			const index = getInsertIndex(
				group.newsletters,
				String(e.target.key),
				e.target.dropPosition,
			);
			await moveDroppedItems(e.items, index);
		},
		onRootDrop: async (e) => {
			await moveDroppedItems(e.items, group.newsletters.length);
		},
		renderDragPreview: (items) => {
			const id = items[0]?.[DRAG_TYPE] ?? '';
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
			if (movedId === undefined || e.target.dropPosition === 'on') {
				return;
			}
			const move = getReorderIndex(
				group.newsletters,
				String(movedId),
				String(e.target.key),
				e.target.dropPosition,
			);
			if (move) {
				onMove?.(groupIndex, move.from, move.to);
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
				aria-label={group.title ? `${group.title} newsletters` : 'Newsletters'}
				keyboardNavigationBehavior="tab"
				dragAndDropHooks={dragAndDropHooks}
				renderEmptyState={() => (
					<div css={emptyStyles}>Drop a newsletter here</div>
				)}
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
