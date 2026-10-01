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
	headerStyle,
	hideOnMobileStyle,
	sectionStyle,
	tableStyle,
	titleBarStyle,
	titleGroupStyle,
} from './home.styles';
import { NewsletterTableRow } from './NewsletterTableRow';
import { SubText } from './SubText';

const tableColumns: ResponsiveTableValue<string> = {
	sm: 'minmax(0, 1fr) auto',
	md: 'minmax(0, 1fr) 8.5rem 9.5rem',
};

export const NewsletterPanel = ({
	title,
	background,
	rows,
	emptyText,
	action,
	caption,
}: {
	title: string;
	background: string;
	rows: NewsletterRow[];
	emptyText: string;
	action?: ReactNode;
	caption?: string;
}) => (
	<section aria-label={title} css={sectionStyle}>
		<div css={titleBarStyle}>
			<div css={titleGroupStyle}>
				<Typography element="h2" variant="headingLg">
					{title}
				</Typography>
				{caption && <SubText>{caption}</SubText>}
			</div>
			{action}
		</div>
		<Table
			aria-label={title}
			columns={tableColumns}
			headerVisibleFrom="sm"
			theme={{ header: { backgroundColor: background } }}
			cssOverrides={tableStyle}
		>
			<TableHeader cssOverrides={headerStyle}>
				<TableColumnHeader isRowHeader>Newsletters</TableColumnHeader>
				<TableColumnHeader cssOverrides={hideOnMobileStyle}>
					Last updated
				</TableColumnHeader>
				<TableColumnHeader>Status</TableColumnHeader>
			</TableHeader>
			<TableBody renderEmptyState={() => emptyText}>
				{rows.map((row) => (
					<NewsletterTableRow key={row.id} row={row} />
				))}
			</TableBody>
		</Table>
	</section>
);
