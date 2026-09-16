import { css } from '@emotion/react';
import {
	componentTable,
	semanticColors,
	semanticRadius,
	semanticSpacing,
} from '@guardian/stand';
import { Icon } from '@guardian/stand/Icon';
import {
	Table,
	TableBody,
	TableCell,
	TableColumnHeader,
	TableHeader,
	TableRow,
} from '@guardian/stand/Table';
import { Typography } from '@guardian/stand/Typography';
import type { KeyboardEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import type { NewsletterRow } from '../lib/all-newsletters-rows';
import {
	formatLastUpdated,
	formatPillarAndCategory,
} from '../lib/all-newsletters-rows';
import { NewsletterStatusBadge } from './NewsletterStatusBadge';

const THUMBNAIL_SIZE = '40px';

/**
 * Cells carry their own inline padding, so a bare 40px track leaves the image
 * filling the track edge to edge and sitting flush against the next column.
 * Widening the track by that padding keeps the gap consistent with every other
 * column boundary.
 */
const THUMBNAIL_COLUMN = `calc(${THUMBNAIL_SIZE} + ${componentTable.cell.paddingInline} * 2)`;

// Stand exposes the table border only as a shorthand, but the width is needed on
// its own to offset the sticky header's copy of it.
const TABLE_BORDER_WIDTH = componentTable.table.border.split(' ')[0] ?? '0';

/**
 * Column tracks per breakpoint. Below `lg` the last-updated cell reflows onto a
 * second row underneath the pillar/category sub-text, with the thumbnail and
 * status spanning both rows.
 */
const columns = {
	sm: `${THUMBNAIL_COLUMN} minmax(0, 1fr) auto`,
	lg: `${THUMBNAIL_COLUMN} minmax(0, 1fr) 160px 140px`,
};

const placement = {
	thumbnail: {
		column: { sm: '1', lg: '1' },
		row: { sm: '1 / span 2', lg: 'auto' },
	},
	newsletter: { column: { sm: '2', lg: '2' }, row: { sm: '1', lg: 'auto' } },
	lastUpdated: { column: { sm: '2', lg: '3' }, row: { sm: '2', lg: 'auto' } },
	status: {
		column: { sm: '3', lg: '4' },
		row: { sm: '1 / span 2', lg: 'auto' },
	},
} as const;

const visuallyHidden = css`
	position: absolute;
	width: 1px;
	height: 1px;
	padding: 0;
	margin: -1px;
	overflow: hidden;
	clip: rect(0, 0, 0, 0);
	white-space: nowrap;
	border: 0;
`;

// The Stand table clips its own overflow, which would stop the sticky header
// from sticking as the rows scroll beneath it.
const tableOverrides = css`
	overflow: visible;
`;

// Comes to rest directly below the pinned page header rather than at the top of
// the scrollport, which is behind it. The table's top edge — its border and
// rounded corners — belongs to the table and so scrolls away, and the table
// cannot clip it back because `overflow: visible` is required for sticky to
// work. The header therefore overlays that edge itself, lapped into place by the
// negative margin so it coincides exactly with the table's own border at rest
// and then travels with the header once it sticks.
const stickyHeaderOverrides = (offset: number) => css`
	position: sticky;
	top: ${offset}px;
	z-index: 1;
	margin: -${TABLE_BORDER_WIDTH} -${TABLE_BORDER_WIDTH} 0;
	border-top: ${componentTable.table.border};
	border-left: ${componentTable.table.border};
	border-right: ${componentTable.table.border};
	border-top-left-radius: ${componentTable.table.borderRadius};
	border-top-right-radius: ${componentTable.table.borderRadius};
`;

const rowOverrides = css`
	cursor: pointer;
	text-decoration: none;
	color: inherit;
`;

const thumbnailStyle = css`
	display: block;
	box-sizing: border-box;
	width: ${THUMBNAIL_SIZE};
	height: ${THUMBNAIL_SIZE};
	border-radius: ${semanticRadius.cornerSm};
	object-fit: cover;
	background-color: ${semanticColors.bg.raisedLevel1};
`;

const fallbackThumbnailStyle = css`
	${thumbnailStyle};
	display: flex;
	align-items: center;
	justify-content: center;
	border: 1px solid ${semanticColors.border.weak};
	color: ${semanticColors.text.weak};
`;

const nameCellStyle = css`
	display: flex;
	flex-direction: column;
	gap: ${semanticSpacing.stackXxs};
`;

const subTextStyle = css`
	color: ${semanticColors.text.weak};
`;

const columnHeaderContentStyle = css`
	display: inline-flex;
	align-items: center;
	gap: ${semanticSpacing.stackXxs};
`;

const NewsletterThumbnail = ({ row }: { row: NewsletterRow }) =>
	row.thumbnailUrl ? (
		<img
			css={thumbnailStyle}
			src={row.thumbnailUrl}
			alt={`Thumbnail for ${row.name}`}
		/>
	) : (
		<span
			css={fallbackThumbnailStyle}
			role="img"
			aria-label={`No thumbnail for ${row.name}`}
		>
			<Icon symbol="mail" size="sm" />
		</span>
	);

interface Props {
	rows: NewsletterRow[];
	/** Height of the pinned page header, so the table header rests below it. */
	stickyHeaderOffset: number;
}

export const AllNewslettersList = ({ rows, stickyHeaderOffset }: Props) => {
	const navigate = useNavigate();

	// react-aria activates a linked row on Enter but treats Space as a
	// selection key, and its row props exclude keyboard handlers. Rows expose
	// their resolved link target as `data-href`, so Space is handled here to
	// keep the row operable with either key.
	const activateOnSpace = (event: KeyboardEvent<HTMLDivElement>) => {
		if (event.key !== ' ') {
			return;
		}
		const href = (event.target as HTMLElement).closest<HTMLElement>(
			'[data-href]',
		)?.dataset.href;
		if (!href) {
			return;
		}
		event.preventDefault();
		void navigate(href);
	};

	return (
		<div onKeyDownCapture={activateOnSpace}>
			<Table
				aria-label="All newsletters"
				columns={columns}
				headerVisibleFrom="lg"
				cssOverrides={tableOverrides}
			>
				<TableHeader cssOverrides={stickyHeaderOverrides(stickyHeaderOffset)}>
					<TableColumnHeader id="thumbnail">
						<span css={visuallyHidden}>Thumbnail</span>
					</TableColumnHeader>
					<TableColumnHeader id="newsletter" isRowHeader>
						<span css={columnHeaderContentStyle}>
							Newsletters
							{/* Display-only until #767 ships the sort mechanics. */}
							<Icon symbol="arrow_upward" size="sm" />
						</span>
					</TableColumnHeader>
					<TableColumnHeader id="lastUpdated">Last updated</TableColumnHeader>
					<TableColumnHeader id="status">Status</TableColumnHeader>
				</TableHeader>
				<TableBody
					renderEmptyState={() => (
						<Typography element="p">No newsletters to show.</Typography>
					)}
				>
					{rows.map((row) => (
						<TableRow
							key={row.id}
							id={row.id}
							href={row.href}
							textValue={row.name}
							cssOverrides={rowOverrides}
						>
							<TableCell
								gridColumn={placement.thumbnail.column}
								gridRow={placement.thumbnail.row}
							>
								<NewsletterThumbnail row={row} />
							</TableCell>
							<TableCell
								gridColumn={placement.newsletter.column}
								gridRow={placement.newsletter.row}
							>
								<span css={nameCellStyle}>
									<Typography element="span" variant="bodyBoldMd">
										{row.name}
									</Typography>
									<Typography
										element="span"
										variant="bodySm"
										cssOverrides={subTextStyle}
									>
										{formatPillarAndCategory(row.theme, row.category)}
									</Typography>
								</span>
							</TableCell>
							<TableCell
								compactLabel="Last updated"
								gridColumn={placement.lastUpdated.column}
								gridRow={placement.lastUpdated.row}
							>
								{formatLastUpdated(row.lastUpdated)}
							</TableCell>
							<TableCell
								gridColumn={placement.status.column}
								gridRow={placement.status.row}
							>
								<NewsletterStatusBadge kind={row.kind} status={row.status} />
							</TableCell>
						</TableRow>
					))}
				</TableBody>
			</Table>
		</div>
	);
};
