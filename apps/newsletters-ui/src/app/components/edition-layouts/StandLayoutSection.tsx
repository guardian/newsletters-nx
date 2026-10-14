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
import type { DropItem } from 'react-aria-components';
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

// A custom type, so dropping a row into a text field or another app doesn't paste its ID.
const DRAG_TYPE = 'application/x-newsletter-id';

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

const draggableListStyles = css`
	[role='row'] {
		cursor: grab;
		user-select: none;
	}
	[data-dragging] {
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
		<GridListItem id={newsletterId} textValue={name} css={rowStyles}>
			<AriaButton slot="drag" css={gripStyles} aria-label={`Reorder ${name}`}>
				<Icon symbol="drag_indicator" aria-hidden="true" />
			</AriaButton>
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

// Only one newsletter can be dragged at a time, as selection isn't enabled.
const getDraggedId = async ([item]: DropItem[]) =>
	item?.kind === 'text' ? item.getText(DRAG_TYPE) : undefined;

interface SectionProps {
	group: LayoutGroup;
	groupIndex: number;
	newsletters: NewsletterData[];
	onRemove: (groupIndex: number, newsletterIndex: number) => void;
	disabled?: boolean;
	// `toIndex` is the position in this group's current list to insert before.
	onMove?: (
		newsletterId: string,
		toGroupIndex: number,
		toIndex: number,
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
	availableNewsletters = [],
	isAddAreaOpen = false,
	onOpenAddArea,
	onCloseAddArea,
	onAdd,
}: SectionProps) => {
	const isMobile = useIsMobile();
	const canAdd = !isMobile && !!onOpenAddArea;
	const sectionLabel = group.title || 'Section';
	// Return focus to the 'Add a newsletter' button when the panel is closed with its Close button.
	const [focusAddButton, setFocusAddButton] = useState(false);
	const dragDisabled = !!disabled || isMobile || !onMove;

	const dropIndex = (key: unknown, dropPosition: string) => {
		const targetIndex = group.newsletters.indexOf(String(key));
		return dropPosition === 'before' ? targetIndex : targetIndex + 1;
	};
	const moveDropped = async (items: DropItem[], toIndex: number) => {
		const id = await getDraggedId(items);
		if (id) {
			onMove?.(id, groupIndex, toIndex);
		}
	};

	// Within a section react-aria calls onReorder; from another section, onInsert or onRootDrop.
	const { dragAndDropHooks } = useDragAndDrop({
		isDisabled: dragDisabled,
		acceptedDragTypes: [DRAG_TYPE],
		getItems: (keys) => [...keys].map((key) => ({ [DRAG_TYPE]: String(key) })),
		onReorder: (e) => {
			const [id] = [...e.keys];
			if (id !== undefined) {
				onMove?.(
					String(id),
					groupIndex,
					dropIndex(e.target.key, e.target.dropPosition),
				);
			}
		},
		onInsert: (e) => {
			void moveDropped(e.items, dropIndex(e.target.key, e.target.dropPosition));
		},
		onRootDrop: (e) => {
			void moveDropped(e.items, group.newsletters.length);
		},
		renderDropIndicator: (target) => (
			<DropIndicator target={target} css={dropIndicatorStyles} />
		),
	});

	return (
		<section
			css={sectionStyles}
			aria-label={group.title.length > 0 ? group.title : 'Unnamed section'}
		>
			<div css={sectionHeaderStyles}>
				<Typography element="h3" variant="bodyBoldMd">
					{group.title}
				</Typography>
			</div>
			<GridList
				css={[listStyles, !dragDisabled && draggableListStyles]}
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
