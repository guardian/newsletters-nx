import type { ResponsiveTableValue } from '@guardian/stand/Table';
import {
	Table,
	TableBody,
	TableColumnHeader,
	TableHeader,
} from '@guardian/stand/Table';
import { Typography } from '@guardian/stand/Typography';
import type { ReactNode } from 'react';
import type { NewsletterRow } from '../../lib/all-newsletters-rows';
import {
	emptyBodyStyle,
	emptyStateStyle,
	hideOnMobileStyle,
	titleBarStyle,
} from './home.styles';
import { NewsletterTableRow } from './NewsletterTableRow';

const tableColumns: ResponsiveTableValue<string> = {
	sm: 'minmax(0, 1fr) auto',
	md: 'minmax(0, 1fr) auto auto',
};

export const NewsletterPanel = ({
	title,
	background,
	rows,
	emptyText,
	action,
}: {
	title: string;
	background: string;
	rows: NewsletterRow[];
	emptyText: string;
	action?: ReactNode;
}) => (
	<section aria-label={title}>
		<div css={titleBarStyle}>
			<Typography element="h2" variant="headingLg">
				{title}
			</Typography>
			{action}
		</div>
		<Table
			aria-label={title}
			columns={tableColumns}
			headerVisibleFrom="sm"
			theme={{ header: { backgroundColor: background } }}
		>
			<TableHeader>
				<TableColumnHeader isRowHeader>Newsletters</TableColumnHeader>
				<TableColumnHeader cssOverrides={hideOnMobileStyle}>
					Last updated
				</TableColumnHeader>
				<TableColumnHeader>Status</TableColumnHeader>
			</TableHeader>
			<TableBody
				cssOverrides={emptyBodyStyle}
				renderEmptyState={() => (
					<Typography
						element="span"
						variant="bodyBoldMd"
						cssOverrides={emptyStateStyle}
					>
						{emptyText}
					</Typography>
				)}
			>
				{rows.map((row) => (
					<NewsletterTableRow key={row.id} row={row} />
				))}
			</TableBody>
		</Table>
	</section>
);
