import type { ResponsiveTableValue } from '@guardian/stand/Table';
import {
	Table,
	TableBody,
	TableColumnHeader,
	TableHeader,
} from '@guardian/stand/Table';
import { Typography } from '@guardian/stand/Typography';
import type { ReactNode } from 'react';
import { hideOnMobileStyle, titleBarStyle } from './home.styles';

const tableColumns: ResponsiveTableValue<string> = {
	sm: 'minmax(0, 1fr) auto',
	md: 'minmax(0, 1fr) 8.5rem 9.5rem',
};

export const NewsletterPanel = ({
	title,
	background,
	emptyText,
	action,
}: {
	title: string;
	background: string;
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
			<TableBody renderEmptyState={() => emptyText} />
		</Table>
	</section>
);
