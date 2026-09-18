import { css } from '@emotion/react';
import { semanticColors, semanticSpacing } from '@guardian/stand';
import { Badge } from '@guardian/stand/Badge';
import type { ResponsiveTableValue } from '@guardian/stand/Table';
import {
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
import { formatLastUpdated } from '../lib/format-last-updated';
import { NewsletterThumbnail } from './NewsletterThumbnail';

const tableColumns: ResponsiveTableValue<string> = {
	sm: 'minmax(0, 1fr)',
	// Fixed (not `auto`) widths: an `auto` track sizes to the widest cell in
	// that column, and "Ready to launch" is much wider than the other status
	// badges, which visually unbalances the column on every other row.
	md: 'minmax(0, 1fr) 150px 190px',
};

const stickyHeaderStyle = css`
	position: sticky;
	top: 0;
	z-index: 1;
`;

// Every row navigates to a newsletter's detail page, but `TableRow` doesn't
// show a pointer cursor for its `href` rows by default.
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
			// `navigate` returns a promise in react-router 7, but react-aria's
			// RouterProvider expects a void return; discard it explicitly.
			navigate={(path) => void navigate(path)}
			useHref={useHrefFromRouter}
		>
			<Table
				aria-label="All newsletters"
				columns={tableColumns}
				headerVisibleFrom="md"
			>
				<TableHeader cssOverrides={stickyHeaderStyle}>
					<TableColumnHeader isRowHeader>Newsletters</TableColumnHeader>
					<TableColumnHeader>Last updated</TableColumnHeader>
					<TableColumnHeader>Status</TableColumnHeader>
				</TableHeader>
				<TableBody>
					{rows.map((row) => (
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
									<NewsletterThumbnail src={row.thumbnailUrl} name={row.name} />
									<div css={detailsStyle}>
										<Typography
											element="span"
											variant="bodyBoldMd"
											cssOverrides={titleStyle}
										>
											{row.name}
										</Typography>
										{row.pillarCategoryLabel && (
											<Typography
												element="span"
												variant="bodySm"
												cssOverrides={subTextStyle}
											>
												{row.pillarCategoryLabel}
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
					))}
				</TableBody>
			</Table>
		</AriaRouterProvider>
	);
};
