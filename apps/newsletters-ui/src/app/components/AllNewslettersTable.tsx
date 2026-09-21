import { css } from '@emotion/react';
import {
	semanticColors,
	semanticRadius,
	semanticSizing,
	semanticSpacing,
} from '@guardian/stand';
import { Badge } from '@guardian/stand/Badge';
import type { ResponsiveTableValue } from '@guardian/stand/Table';
import {
	componentTable,
	Table,
	TableBody,
	TableCell,
	TableColumnHeader,
	TableHeader,
	TableRow,
} from '@guardian/stand/Table';
import { Typography } from '@guardian/stand/Typography';
import { RouterProvider as AriaRouterProvider } from 'react-aria-components';
import { useHref, useNavigate } from 'react-router-dom';
import type { NewsletterRow } from '../lib/all-newsletters-rows';
import { formatPillarCategoryLabel } from '../lib/all-newsletters-rows';
import { formatLastUpdated } from '../lib/format-last-updated';
import {
	stickyListHeaderOffsetVar,
	stickyListLayerVar,
} from '../lib/stand-layout';
import { NewsletterThumbnail } from './NewsletterThumbnail';

const tableColumns: ResponsiveTableValue<string> = {
	sm: 'minmax(0, 1fr)',
	// Fixed rather than `auto` widths: an `auto` track sizes to the widest
	// cell, and "Ready to launch" would unbalance the status column.
	md: 'minmax(0, 1fr) 150px 190px',
};

// Border and radius applied to the sticky header and body, keeping the
// list's outline and rounded corners consistent between the two.
const listBorder = `${semanticSizing.border.default} solid ${semanticColors.border.weak}`;
const listBorderRadius = semanticRadius.cornerSm;

// Stand `Table` currently sets `overflow: hidden`, which makes the table a
// scroll container and breaks sticky headers. `overflow: clip` avoids creating
// a scroll container. Remove once `@guardian/stand` changes its default.
//
// The table hands its border and corners to the pinned header and the body
// below. Left on the table they'd scroll out of view, leaving the list open
// at the top and a straight edge running up behind the pinned header's
// rounded corners.
const tableStyle = css`
	overflow: clip;
	border: none;
	border-radius: 0;
`;

// Header pins below the count block while rows scroll beneath.
//
// `thead` is an opaque, square backdrop in the page colour, hiding the body's
// side borders where they would otherwise run straight up past the rounded
// corners; its row carries the outline itself.
const stickyHeaderStyle = css`
	position: sticky;
	top: var(${stickyListHeaderOffsetVar});
	z-index: var(${stickyListLayerVar});
	background-color: ${semanticColors.bg.base};

	& > tr {
		background-color: ${componentTable.header.backgroundColor};
		border-top: ${listBorder};
		border-left: ${listBorder};
		border-right: ${listBorder};
		border-top-left-radius: ${listBorderRadius};
		border-top-right-radius: ${listBorderRadius};
	}
`;

// Body carries the side/bottom outline. `TableRow` drops its own last bottom
// border, so the list foot is drawn here.
const bodyStyle = css`
	overflow: clip;
	border-left: ${listBorder};
	border-right: ${listBorder};
	border-bottom: ${listBorder};
	border-bottom-left-radius: ${listBorderRadius};
	border-bottom-right-radius: ${listBorderRadius};
`;

// `TableRow` doesn't show a pointer cursor for its `href` rows by default.
const rowStyle = css`
	cursor: pointer;
`;

const statusCellStyle = css`
	display: flex;
	justify-content: flex-start;
`;

const newsletterCellStyle = css`
	display: flex;
	align-items: center;
	gap: ${semanticSpacing.stackSm};
	min-width: 0;
`;

const detailsStyle = css`
	display: flex;
	flex-direction: column;
	gap: ${semanticSpacing.stackXxs};
	min-width: 0;
`;

const titleStyle = css`
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;
`;

const subTextStyle = css`
	color: ${semanticColors.text.weak};
`;

export interface AllNewslettersTableProps {
	rows: NewsletterRow[];
}

export const AllNewslettersTable = ({ rows }: AllNewslettersTableProps) => {
	const navigate = useNavigate();
	const useHrefFromRouter = useHref;

	return (
		<AriaRouterProvider
			// `navigate` returns a promise in react-router 7; react-aria's
			// RouterProvider expects void.
			navigate={(path) => void navigate(path)}
			useHref={useHrefFromRouter}
		>
			<Table
				aria-label="All newsletters"
				columns={tableColumns}
				headerVisibleFrom="md"
				cssOverrides={tableStyle}
			>
				<TableHeader cssOverrides={stickyHeaderStyle}>
					<TableColumnHeader isRowHeader>Newsletters</TableColumnHeader>
					<TableColumnHeader>Last updated</TableColumnHeader>
					<TableColumnHeader>Status</TableColumnHeader>
				</TableHeader>
				<TableBody cssOverrides={bodyStyle}>
					{rows.map((row) => {
						const pillarCategoryLabel = formatPillarCategoryLabel(
							row.theme,
							row.category,
						);
						return (
							<TableRow
								key={row.id}
								id={row.id}
								href={row.href}
								cssOverrides={rowStyle}
							>
								<TableCell
									gridColumn={{ sm: '1', md: '1' }}
									gridRow={{ sm: '1', md: 'auto' }}
								>
									<div css={newsletterCellStyle}>
										<NewsletterThumbnail src={row.thumbnailUrl} />
										<div css={detailsStyle}>
											<Typography
												element="span"
												variant="bodyBoldMd"
												cssOverrides={titleStyle}
											>
												{row.name}
											</Typography>
											{pillarCategoryLabel && (
												<Typography
													element="span"
													variant="bodySm"
													cssOverrides={subTextStyle}
												>
													{pillarCategoryLabel}
												</Typography>
											)}
										</div>
									</div>
								</TableCell>
								<TableCell
									gridColumn={{ sm: '1', md: '2' }}
									gridRow={{ sm: '2', md: 'auto' }}
									compactLabel="Last updated"
								>
									{formatLastUpdated(row.lastUpdated)}
								</TableCell>
								<TableCell
									gridColumn={{ sm: '1', md: '3' }}
									gridRow={{ sm: '3', md: 'auto' }}
									compactLabel="Status"
									cssOverrides={statusCellStyle}
								>
									<Badge color={row.statusBadge.color} weight="strong">
										{row.statusBadge.label}
									</Badge>
								</TableCell>
							</TableRow>
						);
					})}
				</TableBody>
			</Table>
		</AriaRouterProvider>
	);
};
