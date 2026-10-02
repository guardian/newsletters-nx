import { Badge } from '@guardian/stand/Badge';
import { TableCell, TableRow } from '@guardian/stand/Table';
import { Typography } from '@guardian/stand/Typography';
import type { NewsletterRow } from '../../lib/all-newsletters-rows';
import { formatPillarCategoryLabel } from '../../lib/all-newsletters-rows';
import { formatLastUpdated } from '../../lib/format-last-updated';
import { NewsletterThumbnail } from '../NewsletterThumbnail';
import {
	detailsStyle,
	hideOnMobileStyle,
	lastUpdatedMobileStyle,
	newsletterCellStyle,
	rowStyle,
	rowTitleStyle,
	statusCellStyle,
} from './home.styles';
import { SubText } from './SubText';

export const NewsletterTableRow = ({ row }: { row: NewsletterRow }) => {
	const pillarCategoryLabel = formatPillarCategoryLabel(
		row.theme,
		row.category,
	);
	const lastUpdated = formatLastUpdated(row.lastUpdated);

	return (
		<TableRow id={row.id} href={row.href} cssOverrides={rowStyle}>
			<TableCell gridColumn={{ sm: '1' }} gridRow={{ sm: '1', md: 'auto' }}>
				<div css={newsletterCellStyle}>
					<NewsletterThumbnail src={row.thumbnailUrl} />
					<div css={detailsStyle}>
						<Typography
							element="span"
							variant="bodyBoldMd"
							cssOverrides={rowTitleStyle}
						>
							{row.name}
						</Typography>
						{pillarCategoryLabel && <SubText>{pillarCategoryLabel}</SubText>}
						<SubText cssOverrides={lastUpdatedMobileStyle}>
							{lastUpdated}
						</SubText>
					</div>
				</div>
			</TableCell>
			<TableCell
				gridColumn={{ sm: '1', md: '2' }}
				gridRow={{ sm: '1', md: 'auto' }}
				compactLabel="Last updated"
				cssOverrides={hideOnMobileStyle}
			>
				{lastUpdated}
			</TableCell>
			<TableCell
				gridColumn={{ sm: '2', md: '3' }}
				gridRow={{ sm: '1', md: 'auto' }}
				compactLabel="Status"
				cssOverrides={statusCellStyle}
			>
				<Badge color={row.statusBadge.color} weight="strong">
					{row.statusBadge.label}
				</Badge>
			</TableCell>
		</TableRow>
	);
};
