import { css } from '@emotion/react';
import {
	baseSpacing,
	semanticColors,
	semanticRadius,
	semanticSizing,
	semanticSpacing,
} from '@guardian/stand';
import type { ResponsiveTableValue } from '@guardian/stand/Table';
import {
	componentTable,
	Table,
	TableBody,
	TableColumnHeader,
	TableHeader,
} from '@guardian/stand/Table';
import { Typography } from '@guardian/stand/Typography';
import { until } from '@guardian/stand/utils';
import { RouterProvider as AriaRouterProvider } from 'react-aria-components';
import { useHref, useNavigate } from 'react-router-dom';
import type { NewsletterRow } from '../lib/all-newsletters-rows';
import {
	stickyListHeaderOffsetVar,
	stickyListLayerVar,
} from '../lib/stand-layout';
import { NewsletterTableRow } from './home/NewsletterTableRow';

const tableColumns: ResponsiveTableValue<string> = {
	sm: 'minmax(0, 1fr) auto',
	// Fixed (not `auto`) widths: an `auto` track sizes to the widest cell in
	// that column, and "Ready to launch" is much wider than the other status
	// badges, which visually unbalances the column on every other row.
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

	&[data-empty] > tr,
	&[data-empty] > tr > td {
		display: block;
	}
`;

const hideOnMobileStyle = css`
	${until.md} {
		display: none;
	}
`;

const emptyStateStyle = css`
	display: block;
	text-align: center;
	padding: ${baseSpacing['64Rem']} ${semanticSpacing.stackXxs};
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
			// `navigate` returns a promise in react-router 7, but react-aria's
			// RouterProvider expects a void return; discard it explicitly.
			navigate={(path) => void navigate(path)}
			useHref={useHrefFromRouter}
		>
			<Table
				aria-label="All newsletters"
				columns={tableColumns}
				headerVisibleFrom="sm"
				cssOverrides={tableStyle}
			>
				<TableHeader cssOverrides={stickyHeaderStyle}>
					<TableColumnHeader isRowHeader>Newsletters</TableColumnHeader>
					<TableColumnHeader cssOverrides={hideOnMobileStyle}>
						Last updated
					</TableColumnHeader>
					<TableColumnHeader>Status</TableColumnHeader>
				</TableHeader>
				<TableBody
					cssOverrides={bodyStyle}
					renderEmptyState={() => (
						<Typography
							element="span"
							variant="bodyBoldMd"
							cssOverrides={emptyStateStyle}
						>
							No results found
						</Typography>
					)}
				>
					{rows.map((row) => (
						<NewsletterTableRow key={row.id} row={row} />
					))}
				</TableBody>
			</Table>
		</AriaRouterProvider>
	);
};
